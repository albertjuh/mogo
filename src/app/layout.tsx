import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { BottomNav } from "@/components/bottom-nav"
import { AppHeader } from '@/components/app-header';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AuthGuard } from '@/components/auth-guard';

export const metadata: Metadata = {
  title: 'BodaEmpire',
  description: 'Manage your Boda Boda empire with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;900&display=swap" rel="stylesheet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Boda Empire" />
      </head>
      <body className="font-body antialiased bg-muted">
        <FirebaseClientProvider>
            <div className="relative mx-auto flex w-full max-w-[480px] flex-col bg-background shadow-lg sm:my-4 sm:rounded-lg h-dvh">
                <AuthGuard>
                    <AppHeader />
                    <main className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 sm:pb-24">
                        {children}
                    </main>
                    <BottomNav />
                </AuthGuard>
            </div>
            <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
