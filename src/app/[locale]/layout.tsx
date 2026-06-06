import {getMessages, setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {notFound} from 'next/navigation';

export const dynamic = 'force-dynamic';
import Navbar from '@/components/Navbar/Navbar';
import '../globals.css';
import {prisma} from '@/lib/prisma';
import {Metadata} from 'next';
import {NextIntlClientProvider} from 'next-intl';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  const settingsRaw = await prisma.siteSettings.findMany();
  const settings = settingsRaw.length > 0 ? {
    general: settingsRaw[0].general as any,
    stats: settingsRaw[0].stats as any,
    socials: settingsRaw[0].socials as any,
  } : null;
  
  const siteName = locale === 'ar' 
    ? (settings?.general?.siteNameAr || 'تيكنيكال فايب')
    : (settings?.general?.siteNameEn || 'Technical Vibe');
  
  return {
    title: `${siteName} | Modern Software Solutions`,
    description: `${siteName} specializes in building modern, responsive, and dynamic web applications.`,
    icons: {
      icon: settings?.general?.faviconUrl || '/logo.png',
    }
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const settingsRaw = await prisma.siteSettings.findMany();
  const settings = settingsRaw.length > 0 ? {
    general: settingsRaw[0].general as any,
    stats: settingsRaw[0].stats as any,
    socials: settingsRaw[0].socials as any,
  } : null;

  // Set text direction based on locale
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const siteName = locale === 'ar' 
    ? (settings?.general?.siteNameAr || 'تيكنيكال فايب')
    : (settings?.general?.siteNameEn || 'Technical Vibe');

  return (
    <html lang={locale} dir={dir}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Navbar 
            logoUrl={settings?.general?.logoUrl || '/logo.png'} 
            siteName={siteName}
          />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
