import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'weddingWire - Wedding Planning',
  description: 'Plan your perfect wedding with weddingWire',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
