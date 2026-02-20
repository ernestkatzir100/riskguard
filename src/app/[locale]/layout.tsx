import type { Metadata } from 'next';
import { Rubik, Assistant } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import '../globals.css';

const rubik = Rubik({
  subsets: ['hebrew', 'latin'],
  variable: '--font-rubik',
  weight: ['400', '500', '600', '700', '800'],
});

const assistant = Assistant({
  subsets: ['hebrew', 'latin'],
  variable: '--font-assistant',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'RiskGuard — ניהול סיכונים',
  description: 'פלטפורמת ניהול סיכונים לנותני אשראי חוץ-בנקאיים',
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'he' ? 'rtl' : 'ltr'}>
      <body
        className={`${rubik.variable} ${assistant.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
