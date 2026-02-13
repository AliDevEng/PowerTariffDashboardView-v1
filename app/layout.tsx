import './globals.css';
import Link from 'next/link';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';

export const metadata = {
  title: 'Peak Energy - Public Power Tariff Explorer',
  description: 'Compare Swedish DSO private power tariffs including VAT.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <div className="container">
            <header className="header">
              <div>
                <h1 style={{ margin: 0 }}>Peak Energy – Power Tariff Explorer</h1>
                <p style={{ margin: 0, color: 'var(--muted)' }}>Public comparison of Swedish private capacity tariffs.</p>
              </div>
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <Link href="/">Dashboard</Link>
                <Link href="/ranking">Ranking</Link>
                <ThemeToggle />
              </div>
            </header>
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
