import { z } from 'zod';

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

const wikiLinksSchema = z.tuple([z.string().nullable(), z.string().nullable()]);

export enum GameDLC {
  BASE = 'Remnant 2',
  DLC1 = 'The Awakened King',
  DLC2 = 'The Forgotten Kingdom',
}

export const collectibleSchema = z.object({
  name: z.string(),
  type: z.nativeEnum(CollectibleType),
  addedIn: z.nativeEnum(GameDLC),
  craftInto: z.array(z.string()).optional(),
  linkedCollectibles: z.array(z.string()).optional(),
  saveFileFlag: z.string(),
  wikiLinks: wikiLinksSchema,
  description: z.string(),
  imageUrl: z.string(),
  // TODO: how to get, stats
});

export type Collectible = z.infer<typeof collectibleSchema>;

export const injectableSchema = z.object({
  name: z.string(),
  addedIn: z.nativeEnum(GameDLC),
  wikiLinks: wikiLinksSchema,
  collectibles: z.array(z.string()),
});
export type Injectable = z.infer<typeof injectableSchema>;

export const locationSchema = z.object({
  name: z.string(),
  addedIn: z.nativeEnum(GameDLC),
  wikiLinks: wikiLinksSchema,
  collectibles: z.array(z.string()),
  injectables: z
    .array(
      z.object({
        name: z.string(),
        injectables: z.array(z.string()),
      }),
    )
    .optional(),
});
export type Location = z.infer<typeof locationSchema>;

export enum WorldName {
  Campaign = 'Campaign',

  NErud = "N'Erud",
  Yaesha = 'Yaesha',
  Losomn = 'Losomn',

  Other = 'Other',
}

export const worldSchema = z.object({
  name: z.nativeEnum(WorldName),
  mainColor: z.string(),
  locations: z.record(locationSchema),
  injectables: z.record(injectableSchema),
  storylines: z.array(
    z.object({
      name: z.string(),
      mainColor: z.string(),
      locations: z.array(z.string()),
    }),
  ),
});
export type World = z.infer<typeof worldSchema>;

export type GameData = {
  worlds: Record<string, World>;
};
