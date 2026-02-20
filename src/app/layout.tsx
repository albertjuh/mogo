import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { BottomNav } from "@/components/bottom-nav"

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
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div className="relative mx-auto w-full max-w-[480px] bg-background shadow-lg sm:my-4 sm:rounded-lg">
          <div className="relative flex min-h-screen flex-col">
            <main className="flex-1 p-4 pb-24 sm:p-6 sm:pb-24">
              {children}
            </main>
            <BottomNav />
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
