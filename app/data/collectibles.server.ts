import fs from 'fs';
import path from 'path';
import { Collectible } from './types';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export function getCollectibles() {
  const { collectibles } = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'collectibles.json'), 'utf-8'),
  ) as { collectibles: Array<Collectible> };
  return collectibles;
}
