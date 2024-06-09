import { Tabs, TabsList, TabsTrigger } from '~/lib/components/ui/tabs';
import {
  ClientLoaderFunctionArgs,
  NavLink,
  Outlet,
  useLoaderData,
  useSearchParams,
} from '@remix-run/react';
import { SearchIcon, SparklesIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { z } from 'zod';
import { Input } from '~/lib/components/ui/input';
import { ScrollArea } from '~/lib/components/ui/scroll-area';
import { getCharacter, getWorld } from '~/lib/db';
import { cn } from '~/lib/lib/utils';
import clsx from 'clsx';

export function clientLoader({ params, request }: ClientLoaderFunctionArgs) {
  const worldName = z.string().parse(params.worldName);
  const url = new URL(request.url);
  const storyline = z
    .string()
    .nullable()
    .parse(url.searchParams.get('storyline'));

  const world = getWorld(worldName);
  if (!world) throw new Error(`World ${worldName} not found`);
  const character = getCharacter();
  return { world, character, storyline };
}

export default function World() {
  const { world, character, storyline } = useLoaderData<typeof clientLoader>();

  const [filter, setFilter] = useState<
    'All' | 'FullyCompleted' | 'Completed' | 'Uncompleted'
  >('All');
  const [groupBy, setGroupBy] = useState<'Progress' | 'Biome' | 'Type'>(
    'Progress',
  );

  const [search, setSearch] = useState('');
  const storylineLocations = useMemo(() => {
    const worldLocations = Object.keys(world.locations);
    if (!storyline) return new Set(worldLocations);
    return new Set(
      world.storylines.find((s) => s.name === storyline)?.locations ??
        worldLocations,
    );
  }, [storyline, world.locations, world.storylines]);
  const filteredLocations = useMemo(() => {
    const locations = Object.entries(world.locations).filter((location) => {
      return storylineLocations.has(location[0]);
    });
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

  const [searchParams] = useSearchParams();

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
                    const eventProgress = Object.entries(
                      locationProgress?.bonusProgress ?? {},
                    ).filter(([key, value]) => value[1] !== 0);

                    if (locationProgress?.baseProgress?.[1] !== 0) {
                      eventProgress.unshift([
                        'Base',
                        locationProgress!.baseProgress,
                      ]);
                    }
                    return (
                      <NavLink
                        to={{
                          pathname: `location/${encodeURIComponent(locationName)}`,
                          search: searchParams.toString(),
                        }}
                        key={locationName}
                        className={({ isActive }) =>
                          cn(
                            `flex flex-col items-start gap-2 rounded-lg border px-4 py-2 text-left text-sm
                            transition-all hover:bg-primary-foreground`,
                            isActive && 'bg-primary-foreground',
                          )
                        }
                      >
                        <div className="flex w-full justify-between gap-2">
                          <div className="max-w-[50%] space-y-2">
                            <div className="flex items-center gap-2 text-xl font-semibold">
                              <span className="overflow-hidden text-clip text-nowrap">
                                {locationName}
                              </span>
                              {locationProgress?.state === 'FullyCompleted' && (
                                <SparklesIcon className="h-4 w-4" />
                              )}
                            </div>
                            <div className="flex gap-2 overflow-hidden text-ellipsis text-nowrap">
                              <div className="rounded-full bg-accent px-2 py-1">
                                {location.biome}
                              </div>
                              <div className="rounded-full bg-accent px-2 py-1">
                                {location.type}
                              </div>
                            </div>
                          </div>
                          <div className="grid auto-cols-fr grid-flow-col grid-rows-2 gap-2 py-2">
                            {eventProgress.map(([key, value]) => (
                              <div className="flex justify-between">
                                <span className="overflow-hidden text-ellipsis text-nowrap text-muted-foreground">
                                  {key}:
                                </span>
                                <span
                                  className={clsx({
                                    'text-green-400': value[0] === value[1],
                                    'text-red-400': value[0] === 0,
                                    'text-yellow-400':
                                      value[0] !== 0 && value[0] !== value[1],
                                  })}
                                >
                                  {value.join('/')}
                                </span>
                              </div>
                            ))}
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
