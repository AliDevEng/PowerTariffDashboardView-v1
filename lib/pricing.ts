import { Dso, RankedDso, Tariff, TariffPowerPrice } from './types';

export function priceIncVat(row: TariffPowerPrice) {
  return row.priceExVat * (1 + row.vatPercentage / 100);
}

function isPeakModel(entry: TariffPowerPrice): boolean {
  return entry.maxKwExcluding == null;
}

function modelType(entry: TariffPowerPrice): 'Peak Model' | 'Tier Model' {
  return isPeakModel(entry) ? 'Peak Model' : 'Tier Model';
}

function entryMatchesBenchmark(entry: TariffPowerPrice, benchmarkKw: number): boolean {
  if (isPeakModel(entry)) return true;
  const min = entry.minKwIncluding ?? -Infinity;
  const max = entry.maxKwExcluding ?? Infinity;
  return benchmarkKw >= min && benchmarkKw < max;
}

export function explainPeak(entry: TariffPowerPrice) {
  const peak = entry.peak;
  if (!peak) {
    return 'This DSO did not provide full peak-identification fields, so only the pricing formula can be shown.';
  }

  const identification = peak.identificationPeriod
    ? `identifies demand peaks during each ${peak.identificationPeriod}`
    : 'identifies demand peaks over a defined billing period';

  const duration = peak.duration ? `using ${peak.duration} intervals` : 'using fixed time intervals';

  const averaging = peak.numberOfPeaksForAverageCalculation
    ? `then selects the ${peak.numberOfPeaksForAverageCalculation} highest peak values and averages them`
    : 'then applies the DSO peak-selection and averaging method';

  const aggregation = peak.aggregationPeriod ? `within every ${peak.aggregationPeriod}` : '';
  const multiplier = peak.multiplier ? `The result is multiplied by ${peak.multiplier} before tariff pricing is applied.` : '';

  return `${identification}, ${duration}, ${averaging}${aggregation ? ` ${aggregation}` : ''}. ${multiplier}`.trim();
}

function estimatedCostForEntry(entry: TariffPowerPrice, benchmarkKw: number) {
  const incVat = priceIncVat(entry);
  return isPeakModel(entry) ? benchmarkKw * incVat : incVat;
}

function asRow(entry: TariffPowerPrice) {
  return {
    priceExVat: entry.priceExVat,
    priceIncVat: priceIncVat(entry),
    vatPercentage: entry.vatPercentage,
    kwRange: `${entry.minKwIncluding ?? 0}–${entry.maxKwExcluding ?? '∞'} kW`,
    modelType: modelType(entry),
    peakExplanation: explainPeak(entry),
    recurringPeriods: entry.recurringPeriods ?? []
  };
}

export function rankDsos(dsos: Dso[], tariffs: Tariff[], benchmarkKw: number): RankedDso[] {
  const tariffsByDso = new Map<string, Tariff[]>();
  tariffs.forEach((tariff) => {
    if (!tariffsByDso.has(tariff.dsoId)) tariffsByDso.set(tariff.dsoId, []);
    tariffsByDso.get(tariff.dsoId)?.push(tariff);
  });

  const ranked: RankedDso[] = [];

  for (const dso of dsos) {
    const dsoTariffs = tariffsByDso.get(dso.id) ?? [];
    let best: RankedDso | null = null;

    for (const tariff of dsoTariffs) {
      const applicable = tariff.powerPriceEntries.filter((row) => entryMatchesBenchmark(row, benchmarkKw));
      if (!applicable.length) continue;

      const cheapestEntry = applicable.reduce((bestEntry, current) => {
        return estimatedCostForEntry(current, benchmarkKw) < estimatedCostForEntry(bestEntry, benchmarkKw) ? current : bestEntry;
      }, applicable[0]);

      const candidate: RankedDso = {
        dso,
        tariffId: tariff.id,
        modelType: modelType(cheapestEntry),
        estimatedMonthlyCostIncVat: estimatedCostForEntry(cheapestEntry, benchmarkKw),
        priceRows: applicable.map(asRow)
      };

      if (!best || candidate.estimatedMonthlyCostIncVat < best.estimatedMonthlyCostIncVat) {
        best = candidate;
      }
    }

    if (best) ranked.push(best);
  }

  return ranked.sort((a, b) => a.estimatedMonthlyCostIncVat - b.estimatedMonthlyCostIncVat);
}
