# Fathom

Fathom is a learning system that converts curiosity into understanding. It supports multiple explanation styles, three depth levels, and a full observability pipeline for admin verification.

## Features

- Three explanation levels: eli5, eli10, expert.
- Retrieval-first caching to avoid unnecessary model calls.
- Structured schema validation with Zod.
- Postgres persistence via Prisma.
- Admin flow tracing with step-by-step pipeline logs.

## Requirements

- Node.js 18+
- Postgres database (Neon or Supabase compatible)

## Setup

1. Install dependencies:
   - npm install
2. Configure environment:
   - Copy .env.example to .env.local
   - Fill in OPENAI_API_KEY, DATABASE_URL, ADMIN_SECRET
3. Generate Prisma client:
   - npm run db:generate
4. Apply migrations:
   - npm run db:migrate
5. Start the dev server:
   - npm run dev

Open http://localhost:3000 to use the app.

## Admin

Admin routes require a query param secret:

- /admin/flows?secret=YOUR_SECRET
- /admin/flows/[id]?secret=YOUR_SECRET
- /admin/reports?secret=YOUR_SECRET

## Seeding Topics (One-Time)

Generate all domain topics for ELI5, ELI10, and Expert:

- npm run seed:topics

## Example Responses

See [docs/examples/how-does-electricity-flow.json](docs/examples/how-does-electricity-flow.json) for sample responses in all three levels.

## Decision Log

See [docs/decision-log.md](docs/decision-log.md).
