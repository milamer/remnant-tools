import { z } from 'zod';
import { processRemnantSave } from '~/saveFileParser';

const itemToLinkedItems: Record<string, string[]> = {
  // N'Erud
  Aphelion: ['Void Cinder'],
  Nebula: ['Spiced Bile', 'Nano Swarm'],
  'Gas Giant': ['Acidic Jawbone', 'Dying Breath'],
  'Spectral Blade': ['Eidolon Shard'],
  'Void Idol': ['Shining Essence Echo'],
  Bore: ['Mutated Growth'],
  'Energy Wall': ['Ionic Crystal'],
  Helix: ['Seeker Residue'],
  Overflow: ['Escalation Circuit'],
  'Prismatic Driver': ["Sentry's Old Iris"],
  'Space Crabs': ['Cracked Shell'],
  'Stasis Beam': ['Stasis Core'],
  // Losomn
  'Crescent Moon': ["Anamy's Echo", 'Moonlight Barrage'],
  Deceit: ["Imposter's Heart", 'Ouroboros'],
  Nightfall: ['Cursed Dream Silks', 'Dreadwalker'],
  Monarch: ['Agony Spike', 'Chain Of Command'],
  'Rune Pistol': ['Decrepit Rune'],
  Anguish: ['Occult Vessel', 'Loathe The Weak'],
  'Huntress Spear': ['Venerated Spearhead', 'Javelin'],
  Godsplitter: ['Melded Hilt', 'Fracture'],
  Nightshade: ["Nightweaver's Finger", 'Beyond The Veil'],
  Wrathbringer: ["Tormentor's Pommel", 'Awakening'],
  'Blood Draw': ['Bloody Steel Splinter'],
  'Corrosive Rounds': ['Tainted Ichor'],
  Familiar: ['Sacred Hunt Feather'],
  Firestorm: ['Forlorn Fragment'],
  'Time Lapse': ['Broken Timepiece'],
  'Voltaic Rondure': ['Bone Sap'],
  Witchfire: ['Alkahest Powder'],
  'Creeping Mist': ['Hex Wreath'],
  'Knight Guard': ['Cremated Soul Ash'],
  'Ring Of Spears': ['Wretched Skull'],
  // Yaesha
  Merciless: ['Crimson Membrane', 'Bloodline'],
  'Twisted Arbalest': ['Twisted Lazurite', "Guardian's Call"],
  Monolith: ['Eye of Lydusa'],
  Thorn: ['Regurgitated Spiny Sac', 'Deadwood'],
  'Feral Judgement': ["Ravager's Maw", 'Death Sentence'],
  'Red Doe Staff': ["Doe's Antler", 'Lifeline'],
  Stonebreaker: ['Hollow Heart', 'Faultline'],
  Mirage: ['Blossoming Core', 'Cyclone'],
  'Astral Burst': ['Faith Seed'],
  Fargazer: ['Agnosia Driftwood'],
  Rootlash: ['Twilight Dactylus'],
  'Rotted Arrow': ['Soul Sliver'],
  'Song of Eafir': ['Scroll of Binding'],
  Soulbinder: ['Heart Seed'],
  Tremor: ['Cordyceps Gland'],
  'Abrasive Rounds': ['Pallid Lodestone'],
  'Flying Bomb Trap': ['Ceramic Flask'],
  Heatwave: ['Forge Ember'],
  // forgotten
  Enigma: ['Cipher Rod', 'Chaos Driver'],
  'Skewer 2.0': ['Dread Core'],
  'Alpha-Omega': ['Forgotten Memory', 'Beta Ray'],
  Defrag: ['Necrocyte Strand'],
  'Siphon Heart': ['Shining Essence Echo'],
  'Healing Shot': ['Root Ganglia'],
  'Concussive Shot': ['Root Ganglia'],
  'Hot Shot': ['Root Ganglia'],
  'Scrap Shot': ['Root Ganglia'],
  'Cube Gun': ['Conflux Prism', 'Cube Shield'],
  Polygun: ['77 79 68'],
  'Atom Smasher': ['Accelerator'],
  Repulsor: ['Banish'],
  'Star Shot': ['Big Bang'],
  WrathSbringer: ['Awakening'],
  Smolder: ['Blaze'],
  'Corrupted Merciless': ['Bloodshot'],
  "Assassin's Dagger": ['Bloodthirst'],
  'Corrupted Cube Gun': ['Cube Room'],
  'Corrupted Meridian': ['Deadpoint'],
  'Corrupted Rune Pistol': ['Death Brand'],
  Dreamcatcher: ['Dreamwave'],
  "Hero's Sword": ['Energy Wave'],
  Sorrow: ['Eulogy'],
  Hellfire: ['Explosive Shot'],
  'Abyssal Hook': ['Fathomless Deep'],
  'Atom Splitter': ['Fission Strike'],
  'Corrupted Savior': ['Fusion Cannon'],
  Starkiller: ['Gravity Core'],
  'Corrupted Arbalest': ["Guardian's Fury"],
  'Plasma Cutter': ['Heat Sink'],
  "World's Edge": ['Horizon Strike'],
  'Krell Axe': ['Krell Edge'],
  'Corrupted Aphelion': ['Micronova'],
  'Corrupted Nebula': ['Nano Phase'],
  'Crystal Staff': ['Power Stone'],
  'Ritualist Scythe': ['Reaver'],
  // Wrathbringer: ['Awakening'],
  // Wrathbringer: ['Awakening'],
  // Wrathbringer: ['Awakening'],
  // Wrathbringer: ['Awakening'],

  Alchemist: ["Philosopher's Stone", 'Mysterious Stone'],
  Archon: ['Hexahedron', 'Strange Box'],
  Challenger: ['Old Metal Tool', 'Steel Enswell'],
  Engineer: ['Drzyr Caliper', 'Alien Device'],
  Explorer: ['Golden Compass', 'Broken Compass'],
  Gunslinger: ['Iron Cylinder', 'Worn Cylinder'],
  Handler: ['Silent Whistle', 'Old Whistle'],
  Hunter: ['Rusty Medal', 'Sniper War Medal'],
  Invader: ['Serrated Root Blade', 'Wooden Shiv'],
  Invoker: ['Spirit Flute', 'Old Flute'],
  Medic: ['Caduceus Idol', 'Medic Pin'],
  Ritualist: ['Cursed Effigy', 'Ragged Poppet'],
  Summoner: ['Tome of The Bringer', 'Faded Grimoire'],
};

const itemToUncraftedItems: Record<string, string[]> = {};
for (const [item, linkedItems] of Object.entries(itemToLinkedItems)) {
  linkedItems.forEach((linkedItem) => {
    const uncraftedItems = itemToUncraftedItems[linkedItem] ?? [];
    uncraftedItems.push(item);
  });
}

const worldSchema = z.object({
  name: z.enum([
    'Yaesha',
    "N'Erud",
    'Losomn',
    'Ward 13',
    'The Labyrinth',
    'Root Earth',
  ]),
  events: z.record(z.object({ items: z.array(z.string()) })),
  locations: z.record(
    z.object({
      baseItems: z.array(z.string()),
      isWorldDropPresent: z.boolean(),
      events: z.array(z.string()),
    }),
  ),
});
export type World = z.infer<typeof worldSchema>;

const CollectedStatusSchema = z.enum(['Collected', 'Uncollected', 'Uncrafted']);
export type CollectedStatus = z.infer<typeof CollectedStatusSchema>;

const CharacterLocationSchema = z.object({
  bonusProgress: z.tuple([z.number(), z.number()]),
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
  itemData: z.array(z.object({ name: z.string(), saveFileSlug: z.string() })),
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
      itemData: [],
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
      const characterLocation: CharacterLocation = {
        baseProgress: [0, location.baseItems.length],
        bonusProgress: [
          0,
          location.events.reduce(
            (sum, event) => sum + (world.events[event]?.items.length ?? 0),
            0,
          ),
        ],
      };
      for (const collectible of location.baseItems) {
        characterWorld.collectibleProgress[1]++;
        if (character.collectibles[collectible] === 'Collected') {
          characterWorld.collectibleProgress[0]++;
          characterLocation.baseProgress[0]++;
        }
      }
      for (const event of location.events) {
        const eventItems = world.events[event]?.items ?? [];
        for (const eventItem of eventItems) {
          if (character.collectibles[eventItem] === 'Collected') {
            characterLocation.bonusProgress[0]++;
          }
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

    for (const event of Object.values(world.events)) {
      const eventItems = event.items;
      for (const eventItem of eventItems) {
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
  const inMemoryDB = getDB();
  const buffer = await file.arrayBuffer();
  const characters = await processRemnantSave(
    new Uint8Array(buffer),
    inMemoryDB.itemData,
  );

  const charactersProgress: Array<Character> = [];
  for (const character of characters) {
    const characterProgress: Character = {
      name: charactersProgress.length.toString(),
      collectibles: {},
      worlds: {},
    };
    for (const collectible of character.inventory) {
      characterProgress.collectibles[collectible] = 'Collected';
      const linkedItems = itemToLinkedItems[collectible];
      linkedItems?.forEach((linkedItem) => {
        characterProgress.collectibles[linkedItem] = 'Collected';
      });
      const uncraftedItems = itemToUncraftedItems[collectible] ?? [];
      uncraftedItems.forEach((item) => {
        if (characterProgress.collectibles[item] !== 'Collected') {
          characterProgress.collectibles[item] = 'Uncollected';
        }
      });
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
  return null;
}

export function updateWorlds(
  worlds: Record<string, World>,
  itemData: Array<{ name: string; saveFileSlug: string }>,
) {
  const inMemoryDB = getDB();
  inMemoryDB.worlds = worlds;
  inMemoryDB.itemData = itemData;

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
