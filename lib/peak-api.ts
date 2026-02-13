import { Dso, Tariff } from './types';

const BASE_URL = 'https://api.peakenergy.io';

type PeakResponse = {
  status?: string;
  data?: unknown;
  pagination?: { nextPage?: number | string | null; hasNextPage?: boolean };
  message?: string;
};

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function asArray(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];

  const candidateKeys = ['items', 'rows', 'results', 'dsos', 'tariffs'];
  for (const key of candidateKeys) {
    const value = (data as Record<string, unknown>)[key];
    if (Array.isArray(value)) return value;
  }

  return [];
}

function nextPageValue(pagination: PeakResponse['pagination']) {
  if (!pagination) return 0;
  if (typeof pagination.nextPage === 'string') {
    const parsed = Number(pagination.nextPage);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return pagination.nextPage ?? 0;
}

async function peakFetch(path: string): Promise<PeakResponse> {
  const key = process.env.PEAK_API_KEY;
  if (!key) {
    throw new Error('Missing PEAK_API_KEY environment variable. Add it to .env.local and restart the dev server.');
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'x-api-key': key },
    next: { revalidate: 60 * 20 }
  });

  let payload: PeakResponse | null = null;
  try {
    payload = (await response.json()) as PeakResponse;
  } catch {
    // ignore parse errors and surface generic response diagnostics below
  }

  if (!response.ok) {
    const message = payload?.message ?? `HTTP ${response.status}`;
    throw new Error(`Peak API request failed for ${path}: ${message}`);
  }

  return payload ?? {};
}

export async function fetchSwedishDsos(): Promise<Dso[]> {
  const response = await peakFetch('/dsos?region=SE&hasPrivateTariffs=yes&hasTariffPowerPrices=yes');
  const raw = asArray(response.data);

  return raw
    .filter((item: any) => item?.id != null && item?.name)
    .map((item: any) => ({
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
    const rows = asArray(response.data);

    rows.forEach((item: any) => {
      const entries = Array.isArray(item?.tariffPowerPrices) ? item.tariffPowerPrices : [];
      result.push({
        id: String(item.id),
        dsoId: String(item.dsoId),
        name: item.name,
        timezone: item.timezone,
        powerPriceEntries: entries
          .filter((entry: any) => typeof entry?.priceExVat === 'number' && typeof entry?.vatPercentage === 'number')
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

    page = nextPageValue(response.pagination);
  }

  return result;
}
