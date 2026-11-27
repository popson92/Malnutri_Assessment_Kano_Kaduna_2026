# GiveWell SAM Assessment Dashboard — Development Guide

## Project Overview
Monitoring & Verification dashboard for 310 sampled SAM treatment facilities across Kano (142 facilities, 44 LGAs) and Kaduna (168 facilities, 23 LGAs), Nigeria. Data sourced from KoboToolbox via server-side proxy.

## Tech Stack
- React 19 + TypeScript + Vite 6 (SPA)
- Tailwind CSS v4 with `@theme` block
- Recharts for charts, React Leaflet for maps
- React Router v7 for navigation
- Netlify hosting with Netlify Functions for API proxy
- KoboToolbox API v2 (server-side only)

## Critical Security Rules
- **Never put the KoboToolbox token in a `VITE_` variable or any frontend code**
- **Never commit `.env`, credentials, API tokens, or sensitive exports**
- **Never display caregiver names, phone numbers, addresses, or household GPS**
- **Never expose patient IDs used for internal linkage**
- **Keep API tokens server-side only** (in Netlify Functions env vars)
- Exclude `reference_files/` and raw-data directories from Git

## Data Pipeline Rules
- **Do not use synthetic data for the deployed dashboard** — the Netlify build must set `VITE_DATA_MODE=testing`
- **Do not silently fall back to synthetic fixtures** when KoboToolbox fails — show a clear error state with retry button
- Synthetic fixtures are for local development (`VITE_DATA_MODE=development`) and isolated automated tests only
- The `.env` file is git-ignored; Netlify env vars must be configured separately

## Development Workflow
- Work on `develop` branch; push tested changes there
- **Do not merge into `main` without explicit user approval**
- **Do not activate production mode** until explicitly confirmed
- **Do not modify KoboToolbox questionnaires** without explicit instruction
- **Do not automatically delete KoboToolbox submissions**
- All visual reviews must happen through **Netlify Deploy Previews** (not localhost)
- Provide the actual Deploy Preview URL after each push

## Git Branching
- `main` — approved, production-ready code
- `develop` — working branch for development
- Deploy Previews via PR from `develop` to `main`

## Color Palette
- Primary: `#3678B9`
- Medium: `#438AC9`
- Accent: `#65A5DF`
- Pale: `#E8F2FC`
- Grid: `#DFE7F0`

## Key File Locations
- `src/store/DataProvider.tsx` — data source selection (synthetic vs KoboToolbox)
- `src/data/koboService.ts` — KoboToolbox field mapping
- `netlify/functions/kobo-proxy.ts` — server-side API proxy
- `src/analytics/` — indicator registry, outlier engine, quality rules
- `src/config/nav.ts` — navigation structure
- `src/config/geo.ts` — LGA/state geographic mappings

## Env Variables (Netlify)
- `KOBO_BASE_URL` — KoboToolbox API base
- `KOBO_API_TOKEN` — server-side only API token
- `KOBO_FACILITY_ASSET_UID` — facility form asset UID
- `KOBO_CAREGIVER_ASSET_UID` — caregiver form asset UID
- `VITE_DATA_MODE` — `testing` for pilot data, `production` for live
