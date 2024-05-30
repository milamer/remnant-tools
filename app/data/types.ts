export enum CollectibleType {
  Weapon = 'Weapon',
  Armor = 'Armor',
  Mod = 'Mod',
  Material = 'Material',
  Ring = 'Ring',
  Amulet = 'Amulet',
  Archetype = 'Archetype',
  Mutator = 'Mutator',
  Relic = 'Relic',
  RelicFragment = 'Relic Fragment',
  Trait = 'Trait',
  Engram = 'Engram',
  // There are a few Consumables that are "Collectibles"
  Consumable = 'Consumable',

  // Skill, Perk, Consumable, QuestItem
}

type WikiLinks = [string | null, string | null];

export enum GameDLC {
  BASE = 'Remnant 2',
  DLC1 = 'The Awakened King',
  DLC2 = 'The Forgotten Kingdom',
}

export type Collectible = {
  name: string; // unique
  type: CollectibleType;

  addedIn: GameDLC; // version
  craftInto?: string[]; // Collectible.name
  linkedCollectibles?: string[]; // Collectible.name - These items are considered "collected" if this item is collected
  saveFileFlag: string;

  wikiLinks: WikiLinks; // [fextralife, remnant.wiki]
  description: string;
  imageUrl: string;

  // TODO: how to get, stats
};

export type Injectable = {
  name: string; // unique
  addedIn: GameDLC;
  wikiLinks: WikiLinks;

  collectibles: string[]; // Collectible.name
};

export type Location = {
  name: string; // unique
  addedIn: GameDLC;
  wikiLinks: WikiLinks;

  collectibles: string[]; // Collectible.name
  injectables: Array<{
    // only one of these can be injected
    name: string;
    injectables: string[]; // Injectable.name
  }>;
};

export enum WorldName {
  Ward13 = 'Ward 13',

  NErud = "N'Erud",
  Yaesha = 'Yaesha',
  Losomn = 'Losomn',

  Labyrinth = 'The Labyrinth',
  RootEarth = 'Root Earth',

  Other = 'Other',
}

export type World = {
  name: WorldName;
  locations: Record<string, Location>;
  injectables: Record<string, Injectable>;
};

export type GameData = {
  worlds: Record<string, World>;
};
