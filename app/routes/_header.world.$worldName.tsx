import {
  ClientLoaderFunctionArgs,
  NavLink,
  Outlet,
  useLoaderData,
} from '@remix-run/react';
import { SearchIcon, SparklesIcon } from 'lucide-react';
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
    const locations = Object.entries(world.locations);
    if (!input) return locations;
    return locations.filter(([locationName]) =>
      locationName.toLowerCase().includes(input.toLowerCase()),
    );
  }, [input, world.locations]);
  return (
    <>
      <h1 className="mx-auto h-10 text-center text-3xl font-semibold">
        {world.name}
      </h1>
      <div
        className="flex h-[calc(100%-theme('spacing.10'))] gap-4 rounded-sm border border-accent
          bg-card py-4"
      >
        <ScrollArea className="h-full w-full">
          <div className="sticky top-0 bg-card px-4 pb-4 pt-2">
            <SearchIcon className="absolute left-6 top-4 h-5 w-5" />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="bg-accent pl-8"
            />
          </div>
          <div className="flex h-full flex-col gap-2 p-4 pt-0">
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
                        {Object.entries(
                          locationProgress?.bonusProgress ?? {},
                        ).map(([key, value]) => (
                          <span>
                            {key}: {value.join('/')}
                          </span>
                        ))}
                        {!location.injectables?.some(
                          (injectable) => injectable.name === 'World Drops',
                        ) ? (
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
