import { Link } from '@remix-run/react';
import { ChevronLeftIcon, ChevronRightIcon, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '~/lib/components/ui/button';
import { Card, CardContent } from '~/lib/components/ui/card';
import { Checkbox } from '~/lib/components/ui/checkbox';
import { Input } from '~/lib/components/ui/input';
import {
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

type Item = {
  name: string;
  image: {
    alt: string;
    src: string;
  };
  href: string;
  isUnlocked: boolean;
  type: string;
  setType?: string;
  weaponType?: string;
  className?: string;
  howToGet: string;
};

function Items({ items }: { items: Array<Item> }) {
  const take = 100;
  const [page, setPage] = useState(0);
  const maxPage = Math.ceil(items.length / take);
  return (
    <TableBody>
      <TableHeader>
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
        {items.slice(page * take, (page + 1) * take).map((item) => (
          <TableRow key={item.name}>
            <TableCell className="hidden sm:table-cell">
              <img
                loading="lazy"
                alt={item.image.alt}
                className="aspect-square rounded-md border border-white object-cover"
                height="64"
                width="64"
                src={`https://remnant2.wiki.fextralife.com${item.image.src}`}
              />
            </TableCell>
            <TableCell className="font-medium">
              <Link
                to={`https://remnant2.wiki.fextralife.com${item.href}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {item.name}
              </Link>
            </TableCell>
            <TableCell>
              <div className="grid h-full w-full place-content-center">
                <Checkbox checked={item.isUnlocked} />
              </div>
            </TableCell>
            <TableCell className="capitalize">{item.type}</TableCell>
            <TableCell>
              {'setType' in item ? item.setType : null}
              {'weaponType' in item ? item.weaponType : null}
              {'className' in item ? item.className : null}
            </TableCell>
            <TableCell className="whitespace-pre-wrap">
              {item.howToGet}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter className="sticky bottom-4 w-20 bg-slate-800">
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
      </TableFooter>
    </TableBody>
  );
}

export default function Database() {
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
            <Items items={[]} />
          </TabsContent>
          <TabsContent value="unlocked">
            <Items items={[]} />
          </TabsContent>
          <TabsContent value="all">
            <Items items={[]} />
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
}
