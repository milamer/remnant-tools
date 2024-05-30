import { json } from '@remix-run/node';
import { ClientActionFunctionArgs } from '@remix-run/react';
import { collectibles } from '~/data/collectibles.server';
import { World, getWorld } from '~/data/worlds.server';
import { updateWorlds } from '~/lib/db';

export async function action() {
  const worlds = await Promise.all(Object.values(World).map(getWorld));
  for (const world of worlds) {
    world.name = Object.values(World).find((w) => w === world.name)!;
  }
  const worldNameToWorld = Object.fromEntries(
    worlds.map((world) => [world.name, world]),
  );
  return json({
    itemData: collectibles,
    worlds: worldNameToWorld,
  });
}

export async function clientAction({ serverAction }: ClientActionFunctionArgs) {
  const data = await serverAction<typeof action>();
  updateWorlds(data.worlds, data.itemData);
  return null;
}
