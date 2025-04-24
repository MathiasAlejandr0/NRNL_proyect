import type {Metadata} from 'next';
// Correct the import path for Geist fonts
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import { cn } from '@/lib/utils';


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
    <html lang="en" className={cn("dark", GeistSans.variable, GeistMono.variable)}> {/* Force dark mode and apply fonts */}
      <body className={cn(
        // Apply the font variables directly from the imported objects - moved font variables to html tag
        "antialiased",
        "bg-gradient-to-br from-background to-background/90 min-h-screen"
        )}>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        <Toaster /> {/* Add Toaster component here */}
      </body>
    </html>
  );
}
