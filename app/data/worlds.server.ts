import { z } from 'zod';
import { World, WorldName, worldSchema } from './types';
const data = import.meta.glob('./worldData/*.json');

function worldNameToFileName(worldName: WorldName): string {
  return worldName.replaceAll(/[^a-zA-Z0-9]/g, '');
}

function fileNameToWorldName(fileName: string): WorldName | null {
  return (
    Object.values(WorldName).find(
      (worldName) => fileName === worldNameToFileName(worldName),
    ) ?? null
  );
}

const moduleSchema = z.object({
  default: worldSchema,
});

async function loadJsonData() {
  const jsonData = {} as Record<WorldName, World>;

  for (const [path, loadModule] of Object.entries(data)) {
    const jsonModule = await loadModule();
    const key = path.replace('./worldData/', '').replace('.json', '');

    const worldName = fileNameToWorldName(key);
    if (!worldName) continue;

    const worldData = moduleSchema.safeParse(jsonModule);

    if (!worldData.success) {
      console.error(`Invalid data for world ${worldName} at path ${path}`);
      continue;
    }

    jsonData[worldName] = worldData.data.default;
  }

  return jsonData;
}

const worldData = loadJsonData();

export async function getWorld(world: WorldName) {
  return (await worldData)[world];
}
