import {
  ClientLoaderFunctionArgs,
  Link,
  useLoaderData,
} from '@remix-run/react';
import { SquareAsterisk, SquareCheckIcon, SquareIcon } from 'lucide-react';
import { z } from 'zod';
import { Button } from '~/lib/components/ui/button';
import { ScrollArea } from '~/lib/components/ui/scroll-area';
import { Separator } from '~/lib/components/ui/separator';
import { getCharacter, getLocation, getWorld } from '~/lib/db';

const statusToIcon = {
  Collected: <SquareCheckIcon className="h-6 w-6 text-green-400" />,
  Uncollected: <SquareIcon className="h-6 w-6 text-red-400" />,
  Uncrafted: <SquareAsterisk className="h-6 w-6 text-yellow-400" />,
};

export function clientLoader({ params }: ClientLoaderFunctionArgs) {
  const { locationName, worldName } = z
    .object({
      locationName: z.string(),
      worldName: z.string(),
    })
    .parse(params);

  const world = getWorld(worldName);
  const location = getLocation(worldName, locationName);
  if (!world || !location)
    throw new Error(`Location ${locationName} not found in world ${worldName}`);
  const character = getCharacter();
  return { locationName, injectables: world.injectables, location, character };
}

export default function World() {
  const { locationName, injectables, location, character } =
    useLoaderData<typeof clientLoader>();

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <ScrollArea className="w-full flex-grow">
        <div className="flex h-full flex-col gap-2 p-4 pt-0">
          {location.collectibles.length === 0 ? null : (
            <>
              <div className="font-semibold">Base Collectibles</div>
              <ul className="grid gap-3">
                {location.collectibles.map((collectible) => {
                  const status =
                    character?.collectibles[collectible] ?? 'Uncollected';
                  const icon = statusToIcon[status];
                  return (
                    <li
                      key={collectible}
                      className="flex items-center justify-between"
                    >
                      <span className="text-muted-foreground">
                        {collectible}
                      </span>
                      {icon}
                    </li>
                  );
                })}
              </ul>
              {(location.injectables?.length ?? 0) === 0 ? null : (
                <Separator className="my-2" />
              )}
            </>
          )}
          {(location?.injectables ?? []).map((injectible) => {
            return (
              <>
                <div className="font-semibold">{injectible.name}</div>
                <ul className="grid gap-3">
                  {injectible.injectables.map((injectibleName) => {
                    const event = injectables[injectibleName];
                    return (
                      <li key={injectibleName}>
                        <span>{injectibleName}</span>
                        <ul className="grid pl-4">
                          {(event?.collectibles ?? []).map((collectible) => {
                            const status =
                              character?.collectibles[collectible] ??
                              'Uncollected';
                            const icon = statusToIcon[status];
                            return (
                              <li
                                key={collectible}
                                className="flex items-center justify-between"
                              >
                                <span className="text-muted-foreground">
                                  {collectible}
                                </span>
                                {icon}
                              </li>
                            );
                          })}
                        </ul>
                      </li>
                    );
                  })}
                </ul>
              </>
            );
          })}
        </div>
      </ScrollArea>
      <div className="px-4">
        <Button asChild className="block text-center">
          <Link
            to={`https://remnant2.wiki.fextralife.com/${locationName}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Wiki
          </Link>
        </Button>
      </div>
    </div>
  );
}
