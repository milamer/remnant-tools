import {
  ClientActionFunctionArgs,
  Form,
  Link,
  Outlet,
  redirect,
  useFetcher,
  useLoaderData,
  useSearchParams,
} from '@remix-run/react';
import { CompassIcon, DatabaseIcon, UploadIcon } from 'lucide-react';
import { z } from 'zod';
import { Button } from '~/lib/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/lib/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/lib/components/ui/dialog';
import { Label } from '~/lib/components/ui/label';
import { Input } from '~/lib/components/ui/input';
import { getCharactersInfo, updateCharacters } from '~/lib/lib/db';

export async function clientLoader() {
  const selectedCharacter = getCharactersInfo();
  return {
    characters: Array.from(
      { length: selectedCharacter?.totalCharacters ?? 0 },
      (_, idx) => `Character ${idx + 1}`,
    ),
    selectedCharacterIdx: selectedCharacter?.idx ?? null,
  };
}

function UpdateDatabaseButton() {
  const fetcher = useFetcher();
  return (
    <fetcher.Form method="post" action="/update-world">
      <Button
        type="submit"
        className="rounded-full"
        size="icon"
        variant="ghost"
      >
        <DatabaseIcon className="h-5 w-5" />
        <span className="sr-only">Update Database</span>
      </Button>
    </fetcher.Form>
  );
}

function UploadSaveDialogContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <Dialog
      open={searchParams.has('upload')}
      onOpenChange={() =>
        setSearchParams(
          (prev) => {
            prev.delete('upload');
            return prev;
          },
          { replace: true, preventScrollReset: true },
        )
      }
    >
      <Form
        id="form"
        encType="multipart/form-data"
        method="POST"
        action="/update-char"
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload .sav file</DialogTitle>
          <DialogDescription>
            You can find it under <code>~/My Games/Remnant 2/profile.sav</code>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file" className="text-right hover:cursor-pointer">
              profile.sav
            </Label>
            <Input
              form="form"
              id="file"
              name="saveFile"
              type="file"
              className="col-span-3 text-white hover:cursor-pointer hover:bg-primary-foreground"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            form="form"
            type="submit"
            className="hover:bg-muted-foreground"
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
export default function Header() {
  const { characters, selectedCharacterIdx } =
    useLoaderData<typeof clientLoader>();
  const [searchParams] = useSearchParams();
  const uploadSearch = new URLSearchParams(searchParams);
  uploadSearch.append('upload', '');

  const fetcher = useFetcher();

  return (
    <>
      <header
        className="fixed flex h-16 w-full items-center justify-between border-b bg-gray-900 px-4
          text-gray-50 md:px-6"
      >
        <nav className="flex items-center gap-6">
          <Link
            className="flex items-center gap-2 text-lg font-semibold"
            to="/"
          >
            <CompassIcon className="h-6 w-6" />
            <span>Remnant2 Progress Tracker</span>
          </Link>
          <Link className="font-medium" to="/database">
            Database
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Button className="rounded-full" size="icon" variant="ghost" asChild>
            <Link
              to={{ search: uploadSearch.toString() }}
              replace
              preventScrollReset
            >
              <UploadIcon className="h-5 w-5" />
              <span className="sr-only">Upload</span>
            </Link>
          </Button>
          <UpdateDatabaseButton />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                {selectedCharacterIdx === null
                  ? characters.length > 0
                    ? 1
                    : '/'
                  : selectedCharacterIdx + 1}
              </Button>
            </DropdownMenuTrigger>
            {characters.length === 0 ? null : (
              <DropdownMenuContent align="end">
                <fetcher.Form method="post" action="/update-selected-character">
                  {characters.map((character, idx) => (
                    <DropdownMenuItem key={idx}>
                      <button
                        className="w-full text-left"
                        type="submit"
                        name="characterIdx"
                        value={idx}
                      >
                        {character}
                      </button>
                    </DropdownMenuItem>
                  ))}
                </fetcher.Form>
              </DropdownMenuContent>
            )}
          </DropdownMenu>
        </div>
      </header>
      <div className="h-16" />
      <main className="h-[calc(100vh-theme('spacing.16'))] overflow-y-auto p-4 md:p-10">
        <Outlet />
        <UploadSaveDialogContent />
      </main>
    </>
  );
}
