import { z } from 'zod';
import data from './collectibles/all.json';
import { collectibleSchema } from './types';

const collectiblesFileSchema = z.object({
  collectibles: z.array(collectibleSchema),
});

const { collectibles } = collectiblesFileSchema.parse(data);

export function getCollectibles() {
  return collectibles;
}
