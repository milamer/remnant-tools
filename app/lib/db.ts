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
});
type CharacterLocation = z.infer<typeof CharacterLocationSchema>;

const CharacterWorldSchema = z.object({
  locationProgress: z.tuple([z.number(), z.number()]),
  bossProgress: z.tuple([z.number(), z.number()]),
  collectibleProgress: z.tuple([z.number(), z.number()]),
  questProgress: z.tuple([z.number(), z.number()]),
  totalProgress: z.number(),

  locations: z.record(CharacterLocationSchema),
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

function updateCharacterWithWorlds(character: Character): Character {
  const worlds = getWorlds();

  for (const [worldName, world] of Object.entries(worlds)) {
    const characterWorld: CharacterWorld = {
      locationProgress: [0, Object.keys(world.locations).length],
      collectibleProgress: [0, 0],
      locations: {},
      totalProgress: 0,

      // TODO: calculate these stats
      questProgress: [0, 0],
      bossProgress: [0, 0],
    };

    for (const [locationName, location] of Object.entries(world.locations)) {
      const locationProgress: Record<string, [number, number]> = {};

      for (const injectableGroup of location.injectables ?? []) {
        let totalCollectibles = 0;
        let collectedCollectibles = 0;
        for (const injectable of injectableGroup.injectables) {
          for (const collectible of world.injectables[injectable]
            ?.collectibles ?? []) {
            totalCollectibles++;
            if (character.collectibles[collectible] === 'Collected') {
              collectedCollectibles++;
            }
          }
        }
        locationProgress[injectableGroup.name] = [
          collectedCollectibles,
          totalCollectibles,
        ];
      }

      const characterLocation: CharacterLocation = {
        baseProgress: [0, location.collectibles.length],
        bonusProgress: locationProgress,
      };
      for (const collectible of location.collectibles) {
        characterWorld.collectibleProgress[1]++;
        if (character.collectibles[collectible] === 'Collected') {
          characterWorld.collectibleProgress[0]++;
          characterLocation.baseProgress[0]++;
        }
      }

      if (
        characterLocation.baseProgress[0] ===
          characterLocation.baseProgress[1] &&
        characterLocation.bonusProgress[0] ===
          characterLocation.bonusProgress[1]
      ) {
        characterWorld.locationProgress[0]++;
      }

      characterWorld.locations[locationName] = characterLocation;
    }

    for (const injectable of Object.values(world.injectables)) {
      const injectableCollectible = injectable.collectibles;
      for (const eventItem of injectableCollectible) {
        characterWorld.collectibleProgress[1]++;
        if (character.collectibles[eventItem] === 'Collected') {
          characterWorld.collectibleProgress[0]++;
        }
      }
    }

    characterWorld.totalProgress = Math.round(
      (characterWorld.collectibleProgress[0] * 100) /
        characterWorld.collectibleProgress[1],
    );

    character.worlds[worldName] = characterWorld;
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
  await what(rawSaveFile);
}

async function what(raw: string) {
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
  if (raw) {
    await what(raw);
  }

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
