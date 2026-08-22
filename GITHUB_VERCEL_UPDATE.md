# GitHub/Vercel Update Package

This package is arranged for the existing `mgvptltd-all-in-on` GitHub repository where the Next.js app lives at repository root (`src/`, `public/`, `package.json`).

## Copy/replace
- Replace the existing root `src/` with this `src/`.
- Replace the existing root `public/` with this `public/`.
- Replace root `package.json`, `package-lock.json`, `next-env.d.ts`, `postcss.config.js`, `tailwind.config.ts`, and `tsconfig.json` with these versions.
- Keep the `backend/` folder in the repository if you intend to deploy/use the backend separately.
- Do NOT upload `.env` or secrets to GitHub.

## Vercel
Vercel should continue to use the repository root as the Next.js project root. Configure production environment variables in Vercel rather than committing secrets.
