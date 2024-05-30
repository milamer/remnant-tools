import { json } from '@remix-run/node';
import { ClientActionFunctionArgs } from '@remix-run/react';
import { getCollectibles } from '~/data/collectibles.server';
import { WorldName } from '~/data/types';
import { getWorld } from '~/data/worlds.server';
import { updateWorlds } from '~/lib/db';

export async function action() {
  const worlds = await Promise.all(Object.values(WorldName).map(getWorld));
  const collectibles = getCollectibles();
  const worldNameToWorld = Object.fromEntries(
    worlds.map((world) => [world.name, world]),
  );
  const collectibleNameToCollectible = Object.fromEntries(
    collectibles.map((colectible) => [colectible.name, colectible]),
  );
  return json({
    collectibles: collectibleNameToCollectible,
    worlds: worldNameToWorld,
  });
}

export async function clientAction({ serverAction }: ClientActionFunctionArgs) {
  const data = await serverAction<typeof action>();
  updateWorlds(data.worlds, data.collectibles);
  return null;
}
