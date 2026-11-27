# GiveWell SAM Assessment | Monitoring & Verification Dashboard

Real-time monitoring dashboard for Solina Health's SAM (Severe Acute Malnutrition) treatment assessment across **310 sampled facilities** in Kano and Kaduna States, Nigeria.

## Scope

| | Kano | Kaduna | Total |
|---|---|---|---|
| LGAs | 44 | 23 | 67 |
| Facilities | 142 | 168 | 310 |
| Caregiver target | 426 | 504 | 930 |

**Reference period:** September 2024 – August 2026 (24 months)

## Stack

- **Frontend:** React 19, TypeScript, Vite 6
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **Maps:** Leaflet / React Leaflet
- **Tables:** TanStack Table
- **Deployment:** Netlify (SPA + serverless functions)
- **Data source:** KoboToolbox API v2 (proxied via Netlify Functions)

## Local development

```bash
npm install
npm run dev
```

The app starts in **development mode** with synthetic fixture data — no API credentials needed.

## Environment variables

Copy `.env.example` to `.env` and fill in the KoboToolbox credentials. API tokens are **never exposed to the browser** — all KoboToolbox calls are proxied through Netlify Functions.

## Data modes

| Mode | Description |
|---|---|
| `development` | Locally generated fixtures, no API calls |
| `testing` | Connected to KoboToolbox with known test submissions |
| `production` | Live data — real and confidential |

Set `DATA_MODE` in your `.env` file and restart.

## Security

- KoboToolbox API token is server-side only (Netlify Functions), never in `VITE_` variables
- No PII (names, phone numbers, GPS, patient IDs) is displayed in the dashboard
- Raw data files (`.xlsx`, `.csv`, shapefiles) are excluded from version control
- All credentials stored in Git-ignored `.env` files
