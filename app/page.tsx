import Link from 'next/link';
import { DonutDistribution } from '@/components/donut-distribution';
import { SimpleBarChart } from '@/components/simple-bar-chart';
import { getDashboardData } from '@/lib/dashboard-data';

export default async function Home({ searchParams }: { searchParams: { kw?: string } }) {
  const kw = Number(searchParams.kw ?? 7);
  const benchmarkKw = Number.isFinite(kw) ? Math.min(20, Math.max(1, kw)) : 7;

  try {
    const { ranking, metrics } = await getDashboardData(benchmarkKw);

    return (
      <main className="grid" style={{ gap: '1rem' }}>
        <section className="card" style={{ padding: '1rem' }}>
          <div className="header">
            <h2 style={{ margin: 0 }}>Benchmark peak</h2>
            <span className="badge">{benchmarkKw} kW</span>
          </div>
          <form>
            <input type="range" name="kw" min={1} max={20} defaultValue={benchmarkKw} />
            <button type="submit" style={{ marginLeft: '0.5rem' }}>Update ranking</button>
          </form>
        </section>

        <section className="grid mobile-stack" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            ['Total DSOs in Sweden', metrics.totalDsos],
            ['DSOs with private power tariffs', metrics.dsosWithPrivatePowerTariffs],
            ['Total private tariffs', metrics.totalPrivateTariffs],
            ['Current benchmark', `${metrics.benchmarkKw} kW`]
          ].map(([label, value]) => (
            <div className="card" style={{ padding: '1rem' }} key={String(label)}>
              <div style={{ color: 'var(--muted)' }}>{label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{value}</div>
            </div>
          ))}
        </section>

        {!ranking.length ? (
          <section className="card" style={{ padding: '1rem' }}>
            <h3 style={{ marginTop: 0 }}>No ranking data available</h3>
            <p style={{ color: 'var(--muted)' }}>
              We found no PRIVATE tariffs with power pricing for the selected benchmark. Try another kW value.
            </p>
          </section>
        ) : (
          <>
            <section className="grid mobile-stack" style={{ gridTemplateColumns: '2fr 1fr' }}>
              <SimpleBarChart data={ranking} />
              <DonutDistribution peak={metrics.peakModelCount} tier={metrics.tierModelCount} />
            </section>

            <section className="grid mobile-stack" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {ranking.map((row) => (
                <article key={row.dso.id} className="card" style={{ padding: '1rem' }}>
                  <h3 style={{ marginTop: 0 }}>{row.dso.name}</h3>
                  <p style={{ color: 'var(--muted)' }}>{row.dso.region ?? 'SE'} • {row.dso.currency ?? 'SEK'}</p>
                  <p style={{ fontWeight: 700 }}>{row.estimatedMonthlyCostIncVat.toFixed(2)} {row.dso.currency ?? 'SEK'} / month</p>
                  <span className="badge">{row.modelType}</span>
                  <div style={{ marginTop: '.8rem' }}>
                    <Link href={`/dso/${row.dso.slug}?kw=${benchmarkKw}`}><button>View details</button></Link>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </main>
    );
  } catch (error) {
    return (
      <div className="card" style={{ padding: '1rem' }}>
        <h2>We&apos;re unable to fetch tariff data at the moment.</h2>
        <p>Please verify API connectivity and try again.</p>
        <p style={{ color: 'var(--muted)' }}>
          Debug tip: open <code>/api/health</code> to see if your server can reach Peak API with the configured key.
        </p>
        <p style={{ color: 'var(--muted)' }}>
          {error instanceof Error ? error.message : 'Unknown data-loading error'}
        </p>
        <a href="/"><button>Retry</button></a>
      </div>
    );
  }
}
