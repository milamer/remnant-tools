import { z } from 'zod';
import {
  Collectible,
  World,
  collectibleSchema,
  worldSchema,
} from '~/data/types';
import { decompressSave, extractCharacters } from '~/saveFileParser';

const CollectedStatusSchema = z.enum(['Collected', 'Uncollected', 'Uncrafted']);
export type CollectedStatus = z.infer<typeof CollectedStatusSchema>;

const CharacterLocationSchema = z.object({
  bonusProgress: z.record(z.string(), z.tuple([z.number(), z.number()])),
  baseProgress: z.tuple([z.number(), z.number()]),
  state: z.enum(['FullyCompleted', 'Completed', 'Uncompleted']),
});
type CharacterLocation = z.infer<typeof CharacterLocationSchema>;

const progressSchema = z.object({
  locationProgress: z.tuple([z.number(), z.number()]),
  bossProgress: z.tuple([z.number(), z.number()]),
  collectibleProgress: z.tuple([z.number(), z.number()]),
  questProgress: z.tuple([z.number(), z.number()]),
  totalProgress: z.number(),
});
type Progress = z.infer<typeof progressSchema>;

const CharacterWorldSchema = progressSchema.extend({
  locations: z.record(CharacterLocationSchema),
  storylines: z.record(progressSchema),
});
type CharacterWorld = z.infer<typeof CharacterWorldSchema>;

const CharacterSchema = z.object({
  name: z.string(),
  worlds: z.record(CharacterWorldSchema),
  collectibles: z.record(CollectedStatusSchema),
});
type Character = z.infer<typeof CharacterSchema>;

const dbSchema = z.object({
  characters: z.array(CharacterSchema),
  worlds: z.record(worldSchema),
  collectibles: z.record(z.string(), collectibleSchema),
  selectedCharacterIdx: z.number(),
});
type DB = z.infer<typeof dbSchema>;

let inMemoryDB: DB | null = null;

function getDB() {
  // if it is already in memory, return it
  if (inMemoryDB) return inMemoryDB;

  let db = loadFromLocalStorage();
  if (db === null) {
    // this is only the case when the local storage is empty
    // -> init it
    db = {
      characters: [],
      worlds: {},
      collectibles: {},
      selectedCharacterIdx: 0,
    };
    localStorage.setItem('@remnant-save', JSON.stringify(db));
  }
  inMemoryDB = db;
  return db;
}

export function getCharacter() {
  const inMemoryDB = getDB();
  return inMemoryDB.characters[inMemoryDB.selectedCharacterIdx];
}

export function getCharactersInfo() {
  const inMemoryDB = getDB();
  return {
    totalCharacters: inMemoryDB.characters.length,
    idx: inMemoryDB.selectedCharacterIdx,
  };
}

function calculateCollectiblesProgress(
  collectibles: Array<string>,
  character: Character,
) {
  const progress = [0, collectibles.length] as [number, number];
  for (const collectible of collectibles) {
    if (character.collectibles[collectible] === 'Collected') {
      progress[0]++;
    }
  }
  return progress;
}

function calculateProgress(
  worldProgress: CharacterWorld['locations'],
  injectablesProgress: Record<string, [number, number]>,
  locations: Array<string>,
  injectables: Array<string>,
): Progress {
  const progress: Progress = {
    locationProgress: [0, locations.length],
    collectibleProgress: [0, 0],

    bossProgress: [0, 0],
    questProgress: [0, 0],
    totalProgress: 0,
  };

  for (const locationName of locations) {
    const locationProgress = worldProgress[locationName];
    if (!locationProgress) continue;
    if (locationProgress.state !== 'Uncompleted') {
      progress.locationProgress[0]++;
    }
    progress.collectibleProgress[0] += locationProgress.baseProgress[0];
    progress.collectibleProgress[1] += locationProgress.baseProgress[1];
  }

  for (const injectableName of injectables) {
    const injectableProgress = injectablesProgress[injectableName];
    if (!injectableProgress) continue;
    progress.collectibleProgress[0] += injectableProgress[0];
    progress.collectibleProgress[1] += injectableProgress[1];
  }

  progress.totalProgress = Math.round(
    (progress.collectibleProgress[0] * 100) / progress.collectibleProgress[1],
  );

  return progress;
}

function updateCharacterWithWorlds(character: Character): Character {
  const worlds = getWorlds();

  for (const [worldName, world] of Object.entries(worlds)) {
    const characterWorld: CharacterWorld = {
      locationProgress: [0, Object.keys(world.locations).length],
      collectibleProgress: [0, 0],
      locations: {},
      storylines: {},
      totalProgress: 0,

      // TODO: calculate these stats
      questProgress: [0, 0],
      bossProgress: [0, 0],
    };
    character.worlds[worldName] = characterWorld;

    const injectibleToProgress: Record<string, [number, number]> = {};
    for (const injectible of Object.values(world.injectables)) {
      injectibleToProgress[injectible.name] = calculateCollectiblesProgress(
        injectible.collectibles,
        character,
      );
    }

    for (const [locationName, location] of Object.entries(world.locations)) {
      const baseProgress = calculateCollectiblesProgress(
        location.collectibles,
        character,
      );
      const bonusProgress = Object.fromEntries(
        (location.injectables ?? []).map((injectibleGroup) => {
          const bonusProgress = injectibleGroup.injectables.reduce(
            (acc, injectable) => {
              const progress = injectibleToProgress[injectable];
              if (!progress) return acc;
              acc[0] += progress[0];
              acc[1] += progress[1];
              return acc;
            },
            [0, 0] as [number, number],
          );
          return [injectibleGroup.name, bonusProgress];
        }),
      );
      const isBonusCompleted = Object.values(bonusProgress).every(
        ([collected, total]) => collected === total,
      );
      const isBaseCompleted = baseProgress[0] === baseProgress[1];

      const state =
        isBaseCompleted && isBonusCompleted
          ? 'FullyCompleted'
          : isBaseCompleted
            ? 'Completed'
            : 'Uncompleted';
      characterWorld.locations[locationName] = {
        baseProgress,
        bonusProgress,
        state,
      };
    }

    const totalProgress = calculateProgress(
      characterWorld.locations,
      injectibleToProgress,
      Object.keys(world.locations),
      Object.keys(world.injectables),
    );
    characterWorld.totalProgress = totalProgress.totalProgress;
    characterWorld.collectibleProgress = totalProgress.collectibleProgress;
    characterWorld.locationProgress = totalProgress.locationProgress;
    characterWorld.bossProgress = totalProgress.bossProgress;
    characterWorld.questProgress = totalProgress.questProgress;

    for (const storyline of world.storylines) {
      const injectables = new Set(
        storyline.locations.flatMap(
          (location) =>
            world.locations[location]?.injectables?.flatMap(
              (injectable) => injectable.injectables,
            ) ?? [],
        ),
      );

      const progress = calculateProgress(
        characterWorld.locations,
        injectibleToProgress,
        storyline.locations,
        Array.from(injectables),
      );
      characterWorld.storylines[storyline.name] = progress;
    }
  }

  return character;
}

export function updateSelectedCharacterIdx(characterIdx: number) {
  const inMemoryDB = getDB();
  inMemoryDB.selectedCharacterIdx = characterIdx;
  saveToLocalStorage();
}

export async function updateCharacters(file: File) {
  const buffer = await file.arrayBuffer();
  const rawSaveFile = await decompressSave(new Uint8Array(buffer));
  setTimeout(() => {
    localStorage.setItem('@remnant-save-raw', rawSaveFile);
  });
  await setCharacterProgressWithRawSav(rawSaveFile);
}

async function setCharacterProgressWithRawSav(raw: string | null) {
  const inMemoryDB = getDB();
  const characters = extractCharacters(
    raw,
    Object.values(inMemoryDB.collectibles),
  );
  const charactersProgress: Array<Character> = [];
  for (const character of characters) {
    const characterProgress: Character = {
      name: charactersProgress.length.toString(),
      collectibles: {},
      worlds: {},
    };
    for (const collectibleName of character.inventory) {
      const collectible = inMemoryDB.collectibles[collectibleName];

      characterProgress.collectibles[collectibleName] = 'Collected';

      for (const linkedCollectible of collectible?.linkedCollectibles ?? []) {
        characterProgress.collectibles[linkedCollectible] = 'Collected';
      }
    }
    updateCharacterWithWorlds(characterProgress);
    charactersProgress.push(characterProgress);
  }

  inMemoryDB.characters = charactersProgress;
  inMemoryDB.selectedCharacterIdx =
    (inMemoryDB.selectedCharacterIdx ?? 0) >= charactersProgress.length
      ? 0
      : inMemoryDB.selectedCharacterIdx ?? 0;

  saveToLocalStorage();
}

export function saveToLocalStorage() {
  const inMemoryDB = getDB();
  setTimeout(() => {
    localStorage.setItem('@remnant-save', JSON.stringify(inMemoryDB));
  }, 10);
}

export function loadFromLocalStorage() {
  const data = localStorage.getItem('@remnant-save');
  if (data === null) {
    return data;
  }
  const db = dbSchema.safeParse(JSON.parse(data));
  if (db.success) {
    return db.data;
  }
  console.error('Failed to parse local storage data');
  console.error(db.error);
  return null;
}

export async function updateWorlds(
  worlds: Record<string, World>,
  collectibles: Record<string, Collectible>,
) {
  const inMemoryDB = getDB();
  inMemoryDB.worlds = worlds;
  inMemoryDB.collectibles = collectibles;

  const raw = localStorage.getItem('@remnant-save-raw');
  await setCharacterProgressWithRawSav(raw);

  const characters = inMemoryDB.characters;
  if (characters) {
    for (const character of characters) {
      updateCharacterWithWorlds(character);
    }
  }
  saveToLocalStorage();
}

export function getWorlds() {
  const inMemoryDB = getDB();
  return inMemoryDB.worlds;
}

export function getWorld(worldName: string) {
  return getWorlds()[worldName];
}

export function getLocation(worldName: string, locationName: string) {
  const world = getWorld(worldName);
  return world?.locations[locationName];
}

export function getCollectibles() {
  const inMemoryDB = getDB();

  const collectibleToWorldData: Record<
    string,
    { world: string; location: string }
  > = {};
  for (const world of Object.values(inMemoryDB.worlds)) {
    for (const location of Object.values(world.locations)) {
      for (const collectible of location.collectibles) {
        collectibleToWorldData[collectible] = {
          world: world.name,
          location: location.name,
        };
      }
    }
    for (const injectable of Object.values(world.injectables)) {
      for (const collectible of injectable.collectibles) {
        collectibleToWorldData[collectible] = {
          world: world.name,
          location: `Injectable: ${injectable.name}`,
        };
      }
    }
  }

  return Object.values(inMemoryDB.collectibles).map((collectible) => ({
    ...collectible,
    ...(collectibleToWorldData[collectible.name] ?? {
      world: 'Unknown',
      location: 'Unknown',
    }),
    lockState:
      inMemoryDB.characters?.[inMemoryDB.selectedCharacterIdx ?? 0]
        ?.collectibles[collectible.name] ?? 'Uncollected',
  }));
}
