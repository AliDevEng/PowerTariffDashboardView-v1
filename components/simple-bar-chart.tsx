import { RankedDso } from '@/lib/types';

export function SimpleBarChart({ data }: { data: RankedDso[] }) {
  const top = data.slice(0, 10);
  const max = Math.max(...top.map((d) => d.estimatedMonthlyCostIncVat), 1);

  return (
    <div className="card" style={{ padding: '1rem' }}>
      <h3>Ranking (lowest estimated monthly cost incl. VAT)</h3>
      <div className="grid" style={{ gap: '0.6rem' }}>
        {top.map((item) => (
          <div key={item.dso.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span>{item.dso.name}</span>
              <span>{item.estimatedMonthlyCostIncVat.toFixed(2)} {item.dso.currency ?? 'SEK'}</span>
            </div>
            <div style={{ height: 8, background: 'rgba(180,200,205,.2)', borderRadius: 999 }}>
              <div style={{ width: `${(item.estimatedMonthlyCostIncVat / max) * 100}%`, background: 'linear-gradient(90deg, #14b8a6, #2dd4bf)', height: '100%', borderRadius: 999 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
