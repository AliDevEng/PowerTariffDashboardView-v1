import { Dso, Tariff } from './types';

const BASE_URL = 'https://api.peakenergy.io';

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function peakFetch(path: string) {
  const key = process.env.PEAK_API_KEY;
  if (!key) {
    throw new Error('Missing PEAK_API_KEY environment variable.');
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'x-api-key': key },
    next: { revalidate: 60 * 20 }
  });

  if (!response.ok) {
    throw new Error(`Peak API request failed for ${path}: ${response.status}`);
  }

  return response.json() as Promise<{ status: string; data: unknown; pagination?: { nextPage?: number | null } }>;
}

export async function fetchSwedishDsos(): Promise<Dso[]> {
  const response = await peakFetch('/dsos?region=SE&hasPrivateTariffs=yes&hasTariffPowerPrices=yes');
  const raw = Array.isArray(response.data) ? response.data : [];

  return raw.map((item: any) => ({
    id: String(item.id),
    name: String(item.name),
    slug: slugify(String(item.name)),
    region: item.region,
    currency: item.currency,
    timezone: item.timezone,
    tariffPowerPricesCount: item.tariffPowerPricesCount
  }));
}

export async function fetchPrivateTariffs(): Promise<Tariff[]> {
  let page = 1;
  const result: Tariff[] = [];

  while (page) {
    const response = await peakFetch(`/tariffs?tariffType=PRIVATE&page=${page}`);
    const rows = Array.isArray(response.data) ? response.data : [];

    rows.forEach((item: any) => {
      const entries = Array.isArray(item.tariffPowerPrices) ? item.tariffPowerPrices : [];
      result.push({
        id: String(item.id),
        dsoId: String(item.dsoId),
        name: item.name,
        timezone: item.timezone,
        powerPriceEntries: entries
          .filter((entry: any) => typeof entry.priceExVat === 'number' && typeof entry.vatPercentage === 'number')
          .map((entry: any) => ({
            priceExVat: entry.priceExVat,
            vatPercentage: entry.vatPercentage,
            minKwIncluding: entry.minKwIncluding,
            maxKwExcluding: entry.maxKwExcluding,
            peak: entry.peak,
            recurringPeriods: Array.isArray(entry.recurringPeriods) ? entry.recurringPeriods : []
          }))
      });
    });

    page = response.pagination?.nextPage ?? 0;
  }

  return result;
}
