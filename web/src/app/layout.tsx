import type { Metadata } from 'next';
import { Playfair_Display, Montserrat } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'WeddingHub — Luxury Wedding Planning',
  description: 'Plan your perfect wedding with elegance and ease',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${montserrat.variable} font-body antialiased`}
        style={{ backgroundColor: 'var(--color-auth-bg)' }}
      >
        {children}
      </body>
    </html>
  );
}
