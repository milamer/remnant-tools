import {
  ClientLoaderFunctionArgs,
  NavLink,
  Outlet,
  useLoaderData,
} from '@remix-run/react';
import { SparklesIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { z } from 'zod';
import { Input } from '~/lib/components/ui/input';
import { ScrollArea } from '~/lib/components/ui/scroll-area';
import { getCharacter, getWorld } from '~/lib/db';
import { cn } from '~/lib/lib/utils';

export function clientLoader({ params }: ClientLoaderFunctionArgs) {
  const worldName = z.string().parse(params.worldName);
  const world = getWorld(worldName);
  if (!world) throw new Error(`World ${worldName} not found`);
  const character = getCharacter();
  return { world, character };
}

export default function World() {
  const { world, character } = useLoaderData<typeof clientLoader>();

  const [input, setInput] = useState('');
  const filteredLocations = useMemo(() => {
    if (!input) return Object.entries(world.locations);
    return Object.entries(world.locations).filter(([locationName]) =>
      locationName.toLowerCase().includes(input.toLowerCase()),
    );
  }, [input, world.locations]);
  return (
    <>
      <h1 className="mx-auto h-10 text-center text-3xl font-semibold">
        {world.name}
      </h1>
      <div className="flex h-[calc(100%-theme('spacing.10'))] gap-4 border border-accent py-4">
        <ScrollArea className="h-full w-full">
          <div className="sticky top-0 px-4 pb-4 pt-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} />
          </div>
          <div className="flex h-full flex-col gap-2 p-4 pt-0">
            <NavLink
              to={`location/${encodeURIComponent('World Drops')}`}
              className={({ isActive }) =>
                cn(
                  `flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm
                  transition-all hover:bg-primary-foreground`,
                  isActive && 'bg-primary-foreground',
                )
              }
            >
              <div className="flex w-full flex-col gap-1">
                <div className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">World Drops:</div>
                    <span>{world.worldDrops.length}</span>
                  </div>
                </div>
              </div>
            </NavLink>
            {filteredLocations.map(([locationName, location]) => {
              const locationProgress =
                character?.worlds[world.name]?.locations[locationName];
              return (
                <NavLink
                  to={`location/${encodeURIComponent(locationName)}`}
                  key={locationName}
                  className={({ isActive }) =>
                    cn(
                      `flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm
                      transition-all hover:bg-primary-foreground`,
                      isActive && 'bg-primary-foreground',
                    )
                  }
                >
                  <div className="flex w-full flex-col gap-1">
                    <div className="flex items-center">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">{locationName}</div>
                        <span>
                          Base:{' '}
                          {locationProgress?.baseProgress.join('/') ?? 'N/A'}
                        </span>
                        <span>
                          Bonus:{' '}
                          {locationProgress?.bonusProgress.join('/') ?? 'N/A'}
                        </span>
                        {!location.isWorldDropPresent ? (
                          <div className="h-6 w-6" />
                        ) : (
                          <SparklesIcon className="h-6 w-6" />
                        )}
                      </div>
                    </div>
                  </div>
                </NavLink>
              );
            })}
          </div>
        </ScrollArea>
        <Outlet />
      </div>
    </>
  );
}
