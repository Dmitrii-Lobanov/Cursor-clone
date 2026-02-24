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




