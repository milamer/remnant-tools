import { Tabs, TabsList, TabsTrigger } from '~/lib/components/ui/tabs';
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

  const [filter, setFilter] = useState<
    'All' | 'FullyCompleted' | 'Completed' | 'Uncompleted'
  >('All');
  const [groupBy, setGroupBy] = useState<'Progress' | 'Biome' | 'Type'>(
    'Progress',
  );

  const [search, setSearch] = useState('');
  const filteredLocations = useMemo(() => {
    const locations = Object.entries(world.locations);
    if (!search) return locations;
    return locations.filter(([locationName]) =>
      locationName.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, world.locations]);

  const locations = useMemo(() => {
    if (filter === 'All') return filteredLocations;
    return filteredLocations.filter(([locationName]) => {
      const progress = character?.worlds[world.name]?.locations[locationName];
      return progress?.state === filter;
    });
  }, [filter, filteredLocations]);

  const locationGroups = useMemo(() => {
    const groups: Record<string, typeof locations> = {};
    for (const location of locations) {
      switch (groupBy) {
        case 'Progress': {
          const progress =
            character?.worlds[world.name]?.locations[location[0]]?.state ??
            'Uncompleted';
          const groupedLocations = (groups[progress] ??= []);
          groups[progress] = groupedLocations;
          groupedLocations.push(location);
          break;
        }
        case 'Biome': {
          const biome = location[1].biome;
          const groupedLocations = (groups[biome] ??= []);
          groupedLocations.push(location);
          break;
        }
        case 'Type': {
          const type = location[1].type;
          const groupedLocations = (groups[type] ??= []);
          groupedLocations.push(location);
          break;
        }
      }
    }
    return groups;
  }, [groupBy, locations]);

  return (
    <>
      <div className="h-full">
        <div className="flex justify-between pb-4">
          <Tabs
            value={filter}
            onValueChange={(value) => setFilter(value as typeof filter)}
          >
            <TabsList>
              <TabsTrigger value="All">All</TabsTrigger>
              <TabsTrigger value="FullyCompleted">Fully Completed</TabsTrigger>
              <TabsTrigger value="Completed">Completed</TabsTrigger>
              <TabsTrigger value="Uncompleted">Uncompleted</TabsTrigger>
            </TabsList>
          </Tabs>
          <h1
            className="mx-auto h-10 text-center text-3xl font-semibold"
            style={{ color: world.mainColor }}
          >
            {world.name}
          </h1>
          <Tabs
            value={groupBy}
            onValueChange={(value) => setGroupBy(value as typeof groupBy)}
          >
            <TabsList>
              <TabsTrigger value="Progress">Progress</TabsTrigger>
              <TabsTrigger value="Biome">Biome</TabsTrigger>
              <TabsTrigger value="Type">Type</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div
          className="flex h-[calc(100%-theme('spacing.10')-theme('spacing.4'))] gap-4 rounded-lg
            border border-accent bg-card py-4"
        >
          <ScrollArea className="h-full w-full">
            <div className="sticky top-0 bg-card px-4 pb-4 pt-2">
              <SearchIcon className="absolute left-6 top-4 h-5 w-5" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-accent pl-8"
              />
            </div>
            <div className="flex h-full flex-col gap-2 p-4 pt-0">
              {Object.entries(locationGroups).map(([group, locations]) => (
                <div className="flex h-full flex-col gap-2 p-4 pt-0">
                  <div className="text-2xl font-bold">{group}</div>
                  {locations.map(([locationName, location]) => {
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
                              <div className="font-semibold">
                                {locationName}
                              </div>
                              <span>
                                Base:{' '}
                                {locationProgress?.baseProgress.join('/') ??
                                  'N/A'}
                              </span>
                              {Object.entries(
                                locationProgress?.bonusProgress ?? {},
                              ).map(([key, value]) => (
                                <span>
                                  {key}: {value.join('/')}
                                </span>
                              ))}
                              {!location.injectables?.some(
                                (injectable) =>
                                  injectable.name === 'World Drops',
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
              ))}
            </div>
          </ScrollArea>
          <Outlet />
        </div>
      </div>
    </>
  );
}
