# HiVis

HiVis is a daily safety walk for small construction contractors. A superintendent uploads the photos from the morning round. HiVis files what it sees — missing PPE, fall hazards, housekeeping, and electrical — then assigns the fix to a crew lead with a due date. The site keeps the trend, and the daily log exports as a branded PDF.

## Features

- Companies are Clerk organizations. Sites and crews live inside the company.
- A walk takes several photos. Photos go to Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set, and to local disk otherwise.
- Claude vision (server-side only) returns findings with severity, a plain-language place in the frame, and an OSHA construction citation (`29 CFR 1926`).
- Corrective actions have an assignee, a due date, and a status: open, in progress, or closed.
- Each walk writes a daily log entry.
- Each site has a trend: findings over time, and open versus closed actions.
- Export a branded PDF safety report for the job file.
- A sample company, Ridge & Co. Builders, is loaded when there is no database. Sample photos are site sketches, not pictures of people.

## Stack

Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Lucide, Framer Motion, Clerk, Drizzle ORM, Postgres, Recharts, pdf-lib.

## Local setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without Clerk keys, the app opens the sample company and labels it **Demo data**. With keys, app routes require a signed-in user via `clerkMiddleware`.

Keyless Clerk (no account) for local development:

```bash
npx clerk@latest init
```

That writes temporary dev keys to `.env.local`. Enable Organizations in the Clerk dashboard so a company can be created from the header switcher.

## Environment

See `.env.example` for names. None are required to click through the sample company.

| Name | Used for |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Sign-in and organizations. Without them, routes stay on the labeled sample company. |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Optional. The app also sets `/sign-in` and `/sign-up` on the provider. |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Optional post-auth redirects. Default in code is `/dashboard`. |
| `DATABASE_URL` | Postgres (Neon or Supabase). Without it, data stays in memory for the server process. |
| `SEED_ORG_ID` | Clerk organization id to load the sample into. Defaults to the built-in demo org id. |
| `ANTHROPIC_API_KEY` | Live photo readings. Without it, the walk returns a labeled sample reading. |
| `AI_MODEL` | Claude model. Default `claude-sonnet-4-6`. |
| `AI_MAX_TOKENS` | Cap for a reading. Clamped between 256 and 2000. Default 1200. |
| `BLOB_READ_WRITE_TOKEN` | Store walk photos in Vercel Blob. Without it, photos are written under `data/uploads`. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Shared rate limit. Without them, each server process keeps its own limit of 8 readings an hour per user. |
| `DEMO_SCREENSHOT` | Set to `1` only while capturing portfolio screenshots. Opens `/demo` without sign-in. Do not set this in production. |
| `NEXT_PUBLIC_APP_URL` | Absolute URL used for metadata. |

## Database

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

`db:seed` loads Ridge & Co. Builders (Harborline Apartments and Cedar Street Clinic) into `SEED_ORG_ID`. If `DATABASE_URL` is missing, the seed command exits without writing anything — the in-memory store already has that company.

## Scripts

- `npm run dev` — local app
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run screenshot` — write `public/portfolio-screenshot.png` and `public/portfolio-screenshot-landing.png` (dev server must be running with `DEMO_SCREENSHOT=1`)

## What is real, and what is sample

- **Real when configured:** Clerk organizations, Postgres rows, Vercel Blob uploads, Claude vision on the photos you upload, Upstash rate limits, PDF export from stored walks.
- **Sample when unconfigured:** the Ridge & Co. company (clearly labeled Demo data), sketch photos, and a sample photo reading when `ANTHROPIC_API_KEY` is absent. The sample reading is not a vision result for the uploaded file.
- OSHA citations are a filing aid. HiVis does not certify compliance.
