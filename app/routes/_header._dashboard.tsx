import { NavLink, Outlet, useLoaderData } from '@remix-run/react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/lib/components/ui/card';
import { Progress } from '~/lib/components/ui/progress';
import { getCharacter, getWorlds } from '~/lib/db';
import { cn } from '~/lib/lib/utils';

export function clientLoader() {
  const worlds = getWorlds();
  const character = getCharacter();
  return { worlds: Object.values(worlds), character };
}

export default function Dashboard() {
  const { worlds, character } = useLoaderData<typeof clientLoader>();
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {worlds.map((world) => {
          const worldProgress = character?.worlds[world.name];
          return (
            <Card key={world.name}>
              <NavLink
                to={`/world/${world.name}`}
                className={({ isActive }) =>
                  cn(
                    'block rounded-lg',
                    isActive
                      ? 'bg-primary-foreground'
                      : 'hover:bg-primary-foreground',
                  )
                }
              >
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>{world.name}</CardTitle>
                  <div className="flex w-full items-center gap-2">
                    <span className="text-sm font-medium">
                      {worldProgress?.totalProgress ?? 0}%
                    </span>
                    <Progress
                      value={worldProgress?.totalProgress ?? 0}
                      className="flex-grow"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Locations
                      </span>
                      <span className="text-sm font-medium">
                        {worldProgress?.locationProgress.join('/') ?? 'N/A'}
                      </span>
                    </div>
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Bosses
                      </span>
                      <span className="text-sm font-medium">
                        {worldProgress?.bossProgress.join('/') ?? 'N/A'}
                      </span>
                    </div>
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Collectibles
                      </span>
                      <span className="text-sm font-medium">
                        {worldProgress?.collectibleProgress.join('/') ?? 'N/A'}
                      </span>
                    </div>
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Quests
                      </span>
                      <span className="text-sm font-medium">
                        {worldProgress?.questProgress.join('/') ?? 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </NavLink>
            </Card>
          );
        })}
      </div>
      <Outlet />
    </>
  );
}
