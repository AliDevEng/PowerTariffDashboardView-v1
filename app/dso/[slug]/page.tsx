import { notFound } from 'next/navigation';
import { getDashboardData } from '@/lib/dashboard-data';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  return {
    title: `${params.slug} | DSO Details | Peak Energy Explorer`,
    description: 'Power tariff detail view including VAT and peak calculation explanation.'
  };
}

export default async function DsoDetailPage({ params, searchParams }: { params: { slug: string }; searchParams: { kw?: string } }) {
  const kw = Math.min(20, Math.max(1, Number(searchParams.kw ?? 7)));
  const { ranking } = await getDashboardData(kw);
  const dso = ranking.find((row) => row.dso.slug === params.slug);

  if (!dso) return notFound();

  const firstPeak = dso.priceRows[0]?.peakExplanation;

  return (
    <main className="grid" style={{ gap: '1rem' }}>
      <section className="card" style={{ padding: '1rem' }}>
        <h2 style={{ marginBottom: 0 }}>{dso.dso.name}</h2>
        <p style={{ color: 'var(--muted)' }}>{dso.dso.region ?? 'SE'} • {dso.dso.currency ?? 'SEK'} • {dso.dso.timezone ?? 'Europe/Stockholm'}</p>
      </section>

      <section className="card" style={{ padding: '1rem' }}>
        <h3>Power prices (PRIVATE)</h3>
        <table>
          <thead>
            <tr><th>Price incl. VAT</th><th>Price excl. VAT</th><th>VAT %</th><th>kW range</th><th>Model type</th></tr>
          </thead>
          <tbody>
            {dso.priceRows.map((row, idx) => (
              <tr key={`${row.kwRange}-${idx}`}>
                <td>{row.priceIncVat.toFixed(2)} {dso.dso.currency ?? 'SEK'}</td>
                <td>{row.priceExVat.toFixed(2)} {dso.dso.currency ?? 'SEK'}</td>
                <td>{row.vatPercentage}%</td>
                <td>{row.kwRange}</td>
                <td>{row.modelType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card" style={{ padding: '1rem' }}>
        <h3>Peak calculation</h3>
        <p>{firstPeak}</p>
        <ul>
          <li>Peak demand is measured according to the DSO peak definition.</li>
          <li>The measured benchmark is {kw} kW for comparison purposes.</li>
          <li>Estimated monthly power cost is shown including VAT.</li>
        </ul>
      </section>

      <section className="card" style={{ padding: '1rem' }}>
        <h3>Active time rules</h3>
        {dso.priceRows.some((row) => row.recurringPeriods.length > 0) ? (
          <ul>
            {dso.priceRows.flatMap((row) => row.recurringPeriods).map((period, idx) => (
              <li key={idx}>{period.label ?? period.days ?? 'Period'} {period.from ? `${period.from}–${period.to}` : ''}</li>
            ))}
          </ul>
        ) : (
          <p style={{ color: 'var(--muted)' }}>No recurring period constraints were provided.</p>
        )}
      </section>
    </main>
  );
}
