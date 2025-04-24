import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/context/AuthContext'; // Import AuthProvider
import { Header } from '@/components/Header'; // Import Header
import { BottomNav } from '@/components/BottomNav'; // Import BottomNav

export const metadata: Metadata = {
  title: 'NoRaveNoLife',
  description: 'Discover electronic music events and win tickets!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Apply fonts and suppress warning on the html tag
    <html lang="en" className={cn("dark", GeistSans.variable, GeistMono.variable)} suppressHydrationWarning>
      <head />{/* The <head /> tag is automatically managed by Next.js */}
      <body> {/* Apply base styling */}
        <AuthProvider> {/* Wrap content with AuthProvider */}
          <div className="flex flex-col min-h-screen"> {/* Ensure footer is at bottom */}
            <Header /> {/* Add Header component */}
            <main className="flex-grow container mx-auto px-4 py-8 w-full max-w-screen-lg">
              {children}
            </main>
            <BottomNav /> {/* Add BottomNav component */}
          </div>
          <Toaster /> {/* Keep Toaster outside the flex container */}
        </AuthProvider>
      </body>
    </html>
  );
}
