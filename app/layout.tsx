import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NicheHunter AI | Reverse-Engineer Any Niche',
  description:
    'Decode attention, retention, and virality across any content niche. Turn insights into repeatable, scalable content systems.',
  keywords: [
    'content analysis',
    'niche research',
    'youtube analytics',
    'content strategy',
    'retention analysis',
    'hook detection',
  ],
  authors: [{ name: 'NicheHunter AI' }],
  openGraph: {
    title: 'NicheHunter AI',
    description: 'Reverse-Engineer Any Niche. Predict What Wins. Build With Precision.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans">
        <Providers>
          <div className="page-background" />
          <main className="relative min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
