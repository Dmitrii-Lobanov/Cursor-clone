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