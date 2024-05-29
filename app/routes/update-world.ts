import { json } from '@remix-run/node';
import { ClientActionFunctionArgs } from '@remix-run/react';
import { collectibles } from '~/data/collectibles.server';
import { World, getWorld } from '~/data/worlds.server';
import { updateWorlds } from '~/lib/db';

export async function action() {
  const [Losomn, Yaesha, NErud, Ward13] = await Promise.all([
    getWorld(World.Losomn),
    getWorld(World.Yaesha),
    getWorld(World.NErud),
    getWorld(World.Ward13),
  ]);
  return json({
    itemData: collectibles,
    worlds: {
      Losomn,
      Yaesha,
      [World.NErud]: NErud,
      [World.Ward13]: Ward13,
    },
  });
}

export async function clientAction({ serverAction }: ClientActionFunctionArgs) {
  const data = await serverAction<typeof action>();
  updateWorlds(data.worlds, data.itemData);
  return null;
}
