import { unstable_cache } from 'next/cache';
import { fetchPrivateTariffs, fetchSwedishDsos } from './peak-api';
import { rankDsos } from './pricing';

const loadBaseData = unstable_cache(
  async () => {
    const [dsos, tariffs] = await Promise.all([fetchSwedishDsos(), fetchPrivateTariffs()]);
    return { dsos, tariffs };
  },
  ['peak-base-data'],
  { revalidate: 60 * 20 }
);

export async function getDashboardData(benchmarkKw: number) {
  const { dsos, tariffs } = await loadBaseData();
  const ranking = rankDsos(dsos, tariffs, benchmarkKw);
  const totalPrivateTariffs = tariffs.length;
  const peakModelCount = ranking.filter((r) => r.modelType === 'Peak Model').length;
  const tierModelCount = ranking.filter((r) => r.modelType === 'Tier Model').length;

  return {
    dsos,
    tariffs,
    ranking,
    metrics: {
      totalDsos: dsos.length,
      dsosWithPrivatePowerTariffs: dsos.filter((d) => (d.tariffPowerPricesCount?.private ?? 0) > 0).length,
      totalPrivateTariffs,
      benchmarkKw,
      peakModelCount,
      tierModelCount
    }
  };
}
