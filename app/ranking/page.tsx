import Link from 'next/link';
import { getDashboardData } from '@/lib/dashboard-data';

export const metadata = { title: 'DSO Ranking | Peak Energy Explorer' };

export default async function RankingPage({ searchParams }: { searchParams: { kw?: string } }) {
  const kw = Math.min(20, Math.max(1, Number(searchParams.kw ?? 7)));
  const { ranking } = await getDashboardData(kw);

  return (
    <main className="card" style={{ padding: '1rem' }}>
      <h2>Ranking table ({kw} kW benchmark)</h2>
      <table>
        <thead>
          <tr><th>#</th><th>DSO</th><th>Model</th><th>Estimated monthly cost incl. VAT</th><th /></tr>
        </thead>
        <tbody>
          {ranking.map((row, idx) => (
            <tr key={row.dso.id}>
              <td>{idx + 1}</td>
              <td>{row.dso.name}</td>
              <td>{row.modelType}</td>
              <td>{row.estimatedMonthlyCostIncVat.toFixed(2)} {row.dso.currency ?? 'SEK'}</td>
              <td><Link href={`/dso/${row.dso.slug}?kw=${kw}`}>Open</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
