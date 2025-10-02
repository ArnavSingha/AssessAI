
import type { Metadata } from 'next';
import './globals.css';
import StoreProvider from '@/lib/store/StoreProvider';
import { Toaster } from '@/components/ui/toaster';
import { Inter as FontSans } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Loader } from '@/components/Loader';
import { Suspense } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'AssessAI',
  description: 'AI-Powered Interview Assistant',
};

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          'h-full bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <StoreProvider>
            <Suspense fallback={<Loader />}>{children}</Suspense>
            <Toaster />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
