# Peak Energy – Public Power Tariff Explorer

Public Next.js dashboard for comparing Swedish DSO private power tariffs, including VAT and peak-pricing explanations.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create env file:
   ```bash
   cp .env.example .env.local
   ```
3. Add your API key to `.env.local`:
   ```
   PEAK_API_KEY=...
   ```
4. Run:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000`.

## How to test

- Dashboard:
  - Visit `/` and confirm KPI cards, benchmark slider, model distribution, and DSO cards render.
  - Move benchmark slider and submit to confirm ranking/cost update.
- Ranking page:
  - Visit `/ranking` and verify DSOs are sorted by lowest estimated monthly cost.
- Detail page:
  - Open any `/dso/{slug}` and verify:
    - Price incl. VAT and excl. VAT both show.
    - VAT % is visible.
    - Peak explanation text is readable.
    - Recurring time rules render when available.
- Proxy route:
  - `GET /api/peak/dsos?region=SE&hasPrivateTariffs=yes&hasTariffPowerPrices=yes`
  - Confirm JSON structure includes `status` and `data`.

## Routes

- `/` dashboard with KPI cards, ranking chart, pricing model distribution and DSO cards
- `/ranking` ranking table
- `/dso/[slug]` detailed DSO view
- `/api/peak/*` secure backend proxy to Peak API

## Notes

- API calls are cached server-side for 20 minutes.
- VAT is always calculated from API-provided `vatPercentage`.
- If `PEAK_API_KEY` is missing or invalid, the UI will show a friendly fetch error state.
