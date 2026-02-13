export function getPeakApiKey() {
  const raw = process.env.PEAK_API_KEY ?? process.env.PEAKENERGY_API_KEY ?? '';

  const key = raw
    .trim()
    .replace(/^['\"]/, '')
    .replace(/['\"]$/, '');

  return key;
}

export function hasLikelyValidApiKeyFormat(key: string) {
  return key.length >= 10;
}
