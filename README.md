# Remnant Tools

A progress tracker for **Remnant II**. Upload your save file and see what you
have collected, which locations, bosses and quests you have finished, and what
is still missing, per world, storyline and location (DLCs included).

## How it works

- **Save file parsing in the browser.** `profile.sav` (found under
  `~/My Games/Remnant 2/`) is a chunked, zlib-compressed Unreal Engine save.
  [`app/saveFileParser.ts`](app/saveFileParser.ts) reads the chunk headers,
  inflates each chunk and extracts every character's inventory. The file never
  leaves your machine.
- **Hand-curated game data.** Around 1,000 collectibles (weapons, armor,
  rings, amulets, traits, materials …) and the world, location, boss and event
  data live as JSON in [`app/data/`](app/data), validated with Zod schemas.
  Each collectible is linked to the save file flag that marks it as collected.
- **Client-only Remix app.** All routes use `clientLoader` / `clientAction`;
  progress is computed in the browser and stored in `localStorage`, so the
  server only delivers the app.

## Features

- Dashboard with overall progress and per-world progress bars
- World and location views, filterable by storyline, biome and type
- Searchable, filterable database of all collectibles
- Multiple characters per save file

## Stack

Remix (Vite) · React · TypeScript · Zod · Tailwind CSS · shadcn/ui (Radix) ·
Docker

## Development

```sh
npm install
npm run dev        # Vite dev server
npm run typecheck
npm run lint
```

## Deployment

```sh
npm run build
npm start          # remix-serve on port 3000
```

Or with Docker: `docker compose -f deploy/docker-compose.yml up -d --build`
(expects an external `outside` network for the reverse proxy).

## Credits

Items and locations link to the community wikis
([Fextralife](https://remnant2.wiki.fextralife.com/) and
[remnant.wiki](https://remnant.wiki/)) for details.
