import { Footer } from '@/components/layouts/footer';
import { Header } from '@/components/layouts/header';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { websiteUrl } from '@/constants/profile';
import { cn } from '@/lib/utils';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { Epilogue } from 'next/font/google';
import './globals.css';

const epilogue = Epilogue({ subsets: ['latin'] });

const metainfo = {
  name: 'Nazar',
  description:
    'The human is an ever-evolving story, where each action writes the next chapter of possibility.',
  url: websiteUrl,
};

export const metadata: Metadata = {
  metadataBase: new URL(metainfo.url),
  title: metainfo.name,
  description: metainfo.description,
  authors: {
    name: metainfo.name,
    url: metainfo.url,
  },
  creator: metainfo.name,
  openGraph: {
    type: 'website',
    url: metainfo.url,
    title: metainfo.name,
    description: metainfo.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'bg-neutral-100 text-neutral-700 dark:bg-neutral-950 dark:text-neutral-300',
          epilogue.className,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="container flex min-h-screen max-w-2xl flex-col">
            <Header />

            <main className="flex flex-1 flex-col pt-40 pb-20 md:pt-48">{children}</main>

            <Footer />
          </div>

          <Toaster />
        </ThemeProvider>

        <div className="pointer-events-none fixed inset-0 z-99 h-full w-full overflow-hidden bg-[url(/assets/noise.png)] opacity-20 sm:opacity-30 dark:opacity-[0.12]" />

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
