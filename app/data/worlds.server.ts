import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export type WorldData = {
  name: World;
  locations: {
    [locationName: string]: {
      baseItems: Array<string>;
      isWorldDropPresent: boolean;
      events: Array<string>;
    };
  };
  events: {
    [eventName: string]: {
      items: Array<string>;
    };
  };
};

export function getWorldFilename(world: World) {
  return path.join(
    __dirname,
    'worldData',
    `${world.replaceAll(/[^a-zA-Z0-9]/g, '')}.json`,
  );
}

export enum World {
  Ward13 = 'Ward 13',

  NErud = "N'Erud",
  Yaesha = 'Yaesha',
  Losomn = 'Losomn',

  Labyrinth = 'The Labyrinth',
  RootEarth = 'Root Earth',

  Other = 'Other',
}

export async function getWorld(world: World) {
  const filename = getWorldFilename(world);
  const isWorldFilePresent = fs.existsSync(filename);
  if (!isWorldFilePresent) {
    throw new Error(`World file not found: ${filename}`);
  }
  return JSON.parse(fs.readFileSync(filename, 'utf-8')) as WorldData;
}
