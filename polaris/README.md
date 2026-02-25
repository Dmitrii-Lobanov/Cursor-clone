This is a README

# Steps

## Project Setup
1. Install Next.js

```npx create-next-app@latest```

2. Install `shadcn`

`npx shadcn@latest init`

3. Add shadcn components

`npx shadcn@3.6.2 add --all`

4. Add theme provider

    Create a `src/components/theme-provider.tsx` with a `ThemeProvider` component from `next-themes`

    Add `ThemeProvider` from `src/components/theme-provider.tsx` to `src/app/layout.tsx`

5. Change default fonts in `src/app/layout.tsx`

6. Update `src/app/globals.css`

## Authentication

1. Create a new project on `clerk`

`https://dashboard.clerk.com/apps/new`

Choose `Github` in Sign in options

2. Install `clerk`

```npm install @clerk/nextjs```

3. Set Clerk API keys

Add Clerk API keys to `.env`

4. Add Clerk proxy to `src/proxy.ts`

5. Wrap all content of `src/app/layout.tsx` in `ClerkProvider`

6. Add Clerk components to `src/app/layout.tsx`

7. Install and use Clerk themes

`npm i @clerk/themes`

## Database setup

1. Install `Convex`

`npx install convex`

2. Run Convex in dev mode

`npx convex dev`

3. Move Clerk environment variables from `.env` to `.env.local` and delete `.env`

4. Create sample data for your database in `sampleData.jsonl`

5. Add the sample data to your database

`npx convex import --table tasks sampleData.jsonl`

6. Expose a database query

Create a `convex/tasks.ts`

7. Create a client component for the Convex provider

8. Wire up the ConvexClientProvider

9. Display the data in your app

10. Create a database schema at `convex/schema.ts`

11. Remove `convex/tasks.ts` (because we doesn't need it anymore)

12. Create a `convex/projects.ts`

13. Add new API calls to `src/app/page.tsx`

14. Connect Clerk to Convex in order to secure data on sign out

[Clerk Docs](https://docs.convex.dev/auth/clerk)

Add new template on `dashboard.clerk.com` -> Configure -> Sessions -> JWT Templates

Click Add new template

15. Add all environment variables to Convex environment variables

On `https://dashboard.convex.dev/` select Settings -> Environment variables and copy all `.env.local` into it

16. Configure Convex with the Clerk issuer domain by creating `convex/auth.config.ts`

17. Configure ConvexProviderWithClerk

Create `src/components/providers.tsx`

Delete `src/components/convex-client-provider.tsx`
