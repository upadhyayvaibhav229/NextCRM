import type { Metadata } from 'next'
import { Space_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/src/components/theme-provider'
import { SessionProvider } from '@/src/components/auth/SessionProvider'
import { Toaster as AppToaster } from '@/src/ui/toaster'
import { Toaster as SonnerToaster } from '@/src/ui/sonner'
import './globals.css'

const spaceMono = Space_Mono({ 
  subsets: ["latin"],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/setting`,
      { cache: "no-store" }
    );

    const json = await res.json();
    const settings = json.data;

    const faviconUrl = settings?.favicon
      ? `${process.env.NEXT_PUBLIC_SITE_URL}${settings.favicon}?v=${settings.updatedAt}`
      : undefined;

    return {
      title: settings?.siteName || "My Website",
      description: settings?.siteTagline || "Modern CMS Website",
      icons: faviconUrl
        ? {
            icon: faviconUrl,
            apple: faviconUrl,
          }
        : undefined,
    };
  } catch {
    return {
      title: "My Website",
      description: "Modern CMS Website",
    };
  }
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>{children}</SessionProvider>
          <AppToaster />
          <SonnerToaster richColors closeButton />
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  )
}
