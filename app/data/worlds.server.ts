import fs from 'fs';
import path from 'path';
import { World, WorldName } from './types';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export function getWorldFilename(world: WorldName) {
  return path.join(
    __dirname,
    'worldData',
    `${world.replaceAll(/[^a-zA-Z0-9]/g, '')}.json`,
  );
}

export async function getWorld(world: WorldName) {
  const filename = getWorldFilename(world);
  const isWorldFilePresent = fs.existsSync(filename);
  if (!isWorldFilePresent) {
    throw new Error(`World file not found: ${filename}`);
  }
  return JSON.parse(fs.readFileSync(filename, 'utf-8')) as World;
}
