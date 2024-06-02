import { Link, useLoaderData } from '@remix-run/react';
import { ChevronLeftIcon, ChevronRightIcon, Search } from 'lucide-react';
import { useState } from 'react';
import { Collectible } from '~/data/types';
import { Button } from '~/lib/components/ui/button';
import { Card, CardContent } from '~/lib/components/ui/card';
import { Checkbox } from '~/lib/components/ui/checkbox';
import { Input } from '~/lib/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '~/lib/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/lib/components/ui/tabs';
import { getCollectibles } from '~/lib/db';

export async function clientLoader() {
  const collectibles = getCollectibles();

  return {
    collectibles,
  };
}

function Collectibles({ collectibles }: { collectibles: Array<Collectible> }) {
  const take = 10;
  const [page, setPage] = useState(0);
  const maxPage = Math.ceil(collectibles.length / take);
  return (
    <Table>
      <TableHeader className="sticky top-0 bg-background">
        <TableRow>
          <TableHead className="hidden w-[100px] sm:table-cell">
            <span className="sr-only">Image</span>
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Unlocked</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>SubType</TableHead>
          <TableHead>How to</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {collectibles
          .slice(page * take, (page + 1) * take)
          .map((collectible) => (
            <TableRow key={collectible.name}>
              <TableCell className="hidden sm:table-cell">
                {/* <img
                loading="lazy"
                alt={item.image.alt}
                className="aspect-square rounded-md border border-white object-cover"
                height="64"
                width="64"
                src={`https://remnant2.wiki.fextralife.com${item.image.src}`}
              /> */}
              </TableCell>
              <TableCell className="font-medium">
                <Link
                  to={`https://remnant2.wiki.fextralife.com${collectible.wikiLinks[0] ?? ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {collectible.name}
                </Link>
              </TableCell>
              <TableCell>
                <div className="grid h-full w-full place-content-center">
                  {/* <Checkbox checked={collectible.type} /> */}
                </div>
              </TableCell>
              <TableCell className="capitalize">{collectible.type}</TableCell>
              <TableCell>
                {/* {'setType' in collectible ? collectible.setType : null}
                {'weaponType' in collectible ? collectible.weaponType : null}
                {'className' in collectible ? collectible.className : null} */}
              </TableCell>
              <TableCell className="whitespace-pre-wrap">
                {/* {collectible.howToGet} */}
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
      <TableFooter className="sticky bottom-0 block w-full">
        <TableRow className="h-12">
          <TableCell colSpan={5} className="flex w-full flex-row bg-black">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            Page {page} of {maxPage}
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

export default function Database() {
  const { collectibles } = useLoaderData<typeof clientLoader>();
  return (
    <Tabs defaultValue="unlocked">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="locked">Locked</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
        </TabsList>
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
          />
        </div>
      </div>
      <Card x-chunk="dashboard-06-chunk-0">
        <CardContent>
          <TabsContent value="locked" className="overflow-visible" asChild>
            <Collectibles collectibles={[]} />
          </TabsContent>
          <TabsContent value="unlocked" asChild>
            <Collectibles collectibles={Object.values(collectibles)} />
          </TabsContent>
          <TabsContent value="all" asChild>
            <Collectibles collectibles={[]} />
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
}
