export type PeakDefinition = {
  identificationPeriod?: string;
  aggregationPeriod?: string;
  duration?: string;
  numberOfPeaksForAverageCalculation?: number;
  multiplier?: number;
};

export type RecurringPeriod = {
  days?: string;
  from?: string;
  to?: string;
  label?: string;
};

export type TariffPowerPrice = {
  priceExVat: number;
  vatPercentage: number;
  minKwIncluding?: number | null;
  maxKwExcluding?: number | null;
  peak?: PeakDefinition | null;
  recurringPeriods?: RecurringPeriod[];
};

export type Tariff = {
  id: string;
  dsoId: string;
  name?: string;
  timezone?: string;
  powerPriceEntries: TariffPowerPrice[];
};

export type Dso = {
  id: string;
  name: string;
  slug: string;
  region?: string;
  currency?: string;
  timezone?: string;
  tariffPowerPricesCount?: { private?: number };
};

export type RankedDso = {
  dso: Dso;
  tariffId: string;
  modelType: 'Peak Model' | 'Tier Model';
  estimatedMonthlyCostIncVat: number;
  priceRows: Array<{
    priceExVat: number;
    priceIncVat: number;
    vatPercentage: number;
    kwRange: string;
    modelType: 'Peak Model' | 'Tier Model';
    peakExplanation: string;
    recurringPeriods: RecurringPeriod[];
  }>;
};
