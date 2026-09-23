import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/firebase/auth/use-user';
import { AppClientLayout } from '@/components/app-client-layout';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'King Bariki',
  description: 'King Bariki — Bajaji & TukTuk fleet management.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0C3F85" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;900&display=swap" rel="stylesheet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="King Bariki" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <AuthProvider>
              <AppClientLayout>
                  {children}
              </AppClientLayout>
              <Toaster />
          </AuthProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
