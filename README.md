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
   (Alternative env var also supported: `PEAKENERGY_API_KEY`)
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

## Troubleshooting data loading

If the dashboard shows "We're unable to fetch tariff data at the moment":

1. Open `http://localhost:3000/api/health`.
2. Check response:
   - `ok: true` means server can reach Peak API.
   - `ok: false` includes diagnostic details (`statusCode`, `upstreamMessage`, or error text).
3. Ensure `.env.local` contains exactly one of:
   - `PEAK_API_KEY=your_real_key`
   - `PEAKENERGY_API_KEY=your_real_key`
4. Do not wrap the key in quotes unless required by your environment.
5. Restart dev server after changing `.env.local`.

## Routes

- `/` dashboard with KPI cards, ranking chart, pricing model distribution and DSO cards
- `/ranking` ranking table
- `/dso/[slug]` detailed DSO view
- `/api/peak/*` secure backend proxy to Peak API
- `/api/health` connectivity diagnostics endpoint

## Notes

- API calls are cached server-side for 20 minutes.
- VAT is always calculated from API-provided `vatPercentage`.
- If `PEAK_API_KEY` is missing or invalid, the UI will show a friendly fetch error state.
