import { SerializeFrom } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Search,
  SquareAsteriskIcon,
  SquareCheckIcon,
  SquareIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '~/lib/components/ui/button';
import { Card, CardContent } from '~/lib/components/ui/card';
import { Input } from '~/lib/components/ui/input';
import { Label } from '~/lib/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/lib/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '~/lib/components/ui/table';
import { getCollectibles } from '~/lib/db';

const statusToIcon = {
  Collected: <SquareCheckIcon className="h-6 w-6 text-green-400" />,
  Uncollected: <SquareIcon className="h-6 w-6 text-red-400" />,
  Uncrafted: <SquareAsteriskIcon className="h-6 w-6 text-yellow-400" />,
};

export async function clientLoader() {
  const collectibles = getCollectibles();

  return {
    collectibles,
  };
}

function Collectibles({
  collectibles,
  orderBy,
  setOrderBy,
}: {
  collectibles: SerializeFrom<typeof clientLoader>['collectibles'];
  orderBy: string;
  setOrderBy: (orderBy: string) => void;
}) {
  const take = 25;
  const [page, setPage] = useState(1);
  const maxPage = Math.ceil(collectibles.length / take);

  useEffect(() => {
    if (page > maxPage) setPage(1);
  }, [maxPage, page]);

  const order = orderBy.startsWith('-') ? orderBy.slice(1) : orderBy;
  const orderIcon = orderBy.startsWith('-') ? (
    <ArrowUpIcon className="h-4 w-4" />
  ) : (
    <ArrowDownIcon className="h-4 w-4" />
  );

  const unsortedIcon = <ArrowUpDownIcon className="h-4 w-4" />;

  return (
    <Table>
      <TableHeader className="sticky top-0 bg-card">
        <TableRow>
          <TableHead>
            <button
              className="flex items-center gap-2"
              type="button"
              onClick={() => setOrderBy(orderBy === 'name' ? '-name' : 'name')}
            >
              Name {order === 'name' ? orderIcon : unsortedIcon}
            </button>
          </TableHead>
          <TableHead>
            <button
              className="flex items-center justify-center gap-2"
              type="button"
              onClick={() =>
                setOrderBy(orderBy === 'lockState' ? '-lockState' : 'lockState')
              }
            >
              Unlocked {order === 'lockState' ? orderIcon : unsortedIcon}
            </button>
          </TableHead>
          <TableHead>
            <button
              className="flex items-center gap-2"
              type="button"
              onClick={() => setOrderBy(orderBy === 'type' ? '-type' : 'type')}
            >
              Type {order === 'type' ? orderIcon : unsortedIcon}
            </button>
          </TableHead>
          <TableHead>
            <button
              className="flex items-center gap-2"
              type="button"
              onClick={() =>
                setOrderBy(orderBy === 'world' ? '-world' : 'world')
              }
            >
              World {order === 'world' ? orderIcon : unsortedIcon}
            </button>
          </TableHead>
          <TableHead>Location</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {collectibles
          .slice((page - 1) * take, page * take)
          .map((collectible) => {
            const lockIcon = statusToIcon[collectible.lockState];
            return (
              <TableRow key={collectible.name}>
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
                    {lockIcon}
                  </div>
                </TableCell>
                <TableCell className="capitalize">{collectible.type}</TableCell>
                <TableCell>{collectible.world}</TableCell>
                <TableCell className="whitespace-pre-wrap">
                  {collectible.location}
                </TableCell>
              </TableRow>
            );
          })}
      </TableBody>
      <TableFooter className="sticky bottom-0 border-t bg-card">
        <TableRow className="border-t">
          <TableCell colSpan={5}>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setPage((page) => Math.max(1, page - 1))}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <span className="tabular-nums">
                Page {page} of {maxPage}
              </span>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setPage((page) => Math.min(maxPage, page + 1))}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

export default function Database() {
  const { collectibles } = useLoaderData<typeof clientLoader>();
  const [lockFilter, setLockFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [worldFilter, setWorldFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [orderBy, setOrderBy] = useState('name');

  const [allTypes, allWorlds] = useMemo(() => {
    const types = new Set<string>();
    const worlds = new Set<string>();
    for (const collectible of collectibles) {
      types.add(collectible.type);
      worlds.add(collectible.world);
    }
    return [Array.from(types), Array.from(worlds)];
  }, [collectibles]);

  const filteredCollectibles = useMemo(() => {
    return collectibles
      .filter((collectible) => {
        if (lockFilter !== 'ALL' && collectible.lockState !== lockFilter) {
          return false;
        }
        if (typeFilter !== 'ALL' && collectible.type !== typeFilter) {
          return false;
        }
        if (worldFilter !== 'ALL' && collectible.world !== worldFilter) {
          return false;
        }
        if (
          search !== '' &&
          !collectible.name.toLowerCase().includes(search.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((collectibleA, collectibleB) => {
        const descending = orderBy.startsWith('-');
        if (descending) {
          [collectibleA, collectibleB] = [collectibleB, collectibleA];
        }

        const order = descending ? orderBy.slice(1) : orderBy;

        const valueA =
          order in collectibleA
            ? (collectibleA as Record<string, unknown>)[order]
            : 0;
        const valueB =
          order in collectibleB
            ? (collectibleB as Record<string, unknown>)[order]
            : 0;
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return valueA.localeCompare(valueB);
        }
        if (typeof valueA === 'number' && typeof valueB === 'number') {
          return valueA - valueB;
        }
        return 0;
      });
  }, [collectibles, lockFilter, typeFilter, search, worldFilter, orderBy]);

  return (
    <>
      <div className="flex items-center gap-2 py-4">
        <Select
          value={lockFilter}
          onValueChange={(newLockFilter) => setLockFilter(newLockFilter)}
        >
          <SelectTrigger className="w-[180px]">
            <Label>Lock</Label>
            <SelectValue placeholder="Lock State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="Uncollected">Locked</SelectItem>
            <SelectItem value="Collected">Unlocked</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={typeFilter}
          onValueChange={(newTypeFilter) => setTypeFilter(newTypeFilter)}
        >
          <SelectTrigger className="w-[180px]">
            <Label>Type</Label>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            {allTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={worldFilter}
          onValueChange={(newWorldFilter) => setWorldFilter(newWorldFilter)}
        >
          <SelectTrigger className="w-[180px]">
            <Label>World</Label>
            <SelectValue placeholder="World" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            {allWorlds.map((world) => (
              <SelectItem key={world} value={world}>
                {world}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
          />
        </div>
      </div>
      <Card>
        <CardContent>
          <Collectibles
            collectibles={filteredCollectibles}
            orderBy={orderBy}
            setOrderBy={setOrderBy}
          />
        </CardContent>
      </Card>
    </>
  );
}
