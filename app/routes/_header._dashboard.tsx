import { Link, Outlet, useFetcher, useLoaderData } from '@remix-run/react';
import { LoaderCircleIcon } from 'lucide-react';
import { Button } from '~/lib/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/lib/components/ui/card';
import { getCharacter, getWorlds } from '~/lib/db';
import worldstoneUrl from '~/assets/worldstone.png';
import nightweaverUrl from '~/assets/nighweaver.png';
import queenUrl from '~/assets/queen.png';
import keeperUrl from '~/assets/keeper.png';
import kingUrl from '~/assets/king.png';
import lydusaUrl from '~/assets/lydusa.png';

const worldToImage: Record<string, string> = {
  'Ward 13': worldstoneUrl,
  Labyrinth: keeperUrl,
  'Root Earth': keeperUrl,

  'Eternal Empress': queenUrl,
  Ravager: keeperUrl,
  'Forgotten Kingdom': lydusaUrl,

  'Imposter King': keeperUrl,
  Nightweaver: nightweaverUrl,
  'The One True King': kingUrl,

  "Sha'hala": queenUrl,
  "Tal'ratha": queenUrl,

  'In Game': keeperUrl,
  'W/E': keeperUrl,
};

export function clientLoader() {
  const worlds = getWorlds();
  const character = getCharacter();
  return { worlds: Object.values(worlds), character };
}

function EmptyInitScreen() {
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="post" action="/update-world">
      <Button
        type="submit"
        className="text-white"
        disabled={fetcher.state !== 'idle'}
      >
        Initialize Local Database{' '}
        {fetcher.state !== 'idle' ? (
          <LoaderCircleIcon className="ml-4 h-5 w-5 animate-spin" />
        ) : null}
      </Button>
    </fetcher.Form>
  );
}

export default function Dashboard() {
  const { worlds, character } = useLoaderData<typeof clientLoader>();
  return (
    <>
      <div className="space-y-8">
        {worlds.length === 0 ? <EmptyInitScreen /> : null}
        {worlds.map((world) => {
          const worldProgress = character?.worlds[world.name];
          return (
            <Card key={world.name}>
              <CardHeader className="flex flex-row justify-between">
                <CardTitle
                  className="origin-left scale-100 animate-[scale] text-left text-4xl font-bold text-primary
                    transition-transform group-hover:scale-110"
                  style={{ color: world.mainColor }}
                >
                  {world.name}{' '}
                  <span className="text-2xl">
                    {worldProgress?.totalProgress ?? 0}%
                  </span>
                </CardTitle>
                <div className="flex gap-4 text-xs">
                  <div>
                    <div className="text-muted-foreground">Collectibles</div>
                    <div>
                      {worldProgress?.collectibleProgress.join('/') ?? 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Locations</div>
                    <div>
                      {worldProgress?.locationProgress.join('/') ?? 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Bosses</div>
                    <div>{worldProgress?.bossProgress.join('/') ?? 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Quests</div>
                    <div>{worldProgress?.questProgress.join('/') ?? 'N/A'}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {world.storylines.map((storyline) => {
                  const progress = worldProgress?.storylines[
                    storyline.name
                  ] ?? {
                    locationProgress: [0, 0],
                    bossProgress: [0, 0],
                    collectibleProgress: [0, 0],
                    questProgress: [0, 0],
                    totalProgress: 0,
                  };
                  return (
                    <Card
                      className="border-b-0
                        bg-[linear-gradient(135deg,hsl(var(--background))50%,var(--story-color)170%)]
                        hover:bg-[linear-gradient(45deg,hsl(var(--background))50%,var(--story-color)170%)]"
                      style={{
                        '--story-color': storyline.mainColor,
                      }}
                    >
                      <Link
                        to={`/world/${world.name}`}
                        className="group block rounded-lg"
                      >
                        <div className="flex">
                          <div className="flex-grow">
                            <CardHeader className="pb-3">
                              <span className="font-bold">
                                {progress.totalProgress ?? 0}%
                              </span>
                              <CardTitle
                                className="origin-left scale-100 animate-[scale] text-left text-4xl font-bold text-primary
                                  transition-transform group-hover:scale-110"
                              >
                                {storyline.name}
                              </CardTitle>
                            </CardHeader>
                            <div className="h-px w-full px-6">
                              <div className="h-full w-full bg-accent" />
                            </div>
                            <CardContent className="pt-3">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col items-start gap-1">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Locations
                                  </span>
                                  <span className="text-sm font-medium">
                                    {progress.locationProgress.join('/')}
                                  </span>
                                </div>
                                <div className="flex flex-col items-start gap-1">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Bosses
                                  </span>
                                  <span className="text-sm font-medium">
                                    {progress.bossProgress.join('/')}
                                  </span>
                                </div>
                                <div className="flex flex-col items-start gap-1">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Collectibles
                                  </span>
                                  <span className="text-sm font-medium">
                                    {progress.collectibleProgress.join('/')}
                                  </span>
                                </div>
                                <div className="flex flex-col items-start gap-1">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Quests
                                  </span>
                                  <span className="text-sm font-medium">
                                    {progress.questProgress.join('/')}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </div>
                          <div className="relative basis-1/3">
                            <div className="absolute inset-0 flex justify-center">
                              <div className="absolute bottom-0 flex h-[120%] items-end justify-center overflow-hidden">
                                <img
                                  width="448"
                                  height="558"
                                  src={worldToImage[storyline.name]}
                                  className="h-[90%] max-w-[fit-content] grayscale transition-transform group-hover:scale-110
                                    group-hover:grayscale-0"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Outlet />
    </>
  );
}
