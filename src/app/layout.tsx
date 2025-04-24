
import type { Metadata } from 'next';
// Correct the import path for Geist fonts
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Home, Ticket, Bell } from 'lucide-react'; // Import icons

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
    <html lang="en" className={cn("dark", GeistSans.variable, GeistMono.variable)} suppressHydrationWarning>
      <head />{/* The <head /> tag is automatically managed by Next.js */}
      <body className={cn(
        "antialiased",
        "bg-gradient-to-br from-background to-background/90 min-h-screen flex flex-col" // Use flex-col
        )}>
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between">
                 <Link href="/" className="flex items-center space-x-2 text-primary font-bold text-lg">
                   {/* <Music className="w-6 h-6" /> Optional Logo Icon */}
                   <span>NoRaveNoLife</span>
                 </Link>
                <nav className="flex items-center space-x-4">
                  <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-1">
                      <Home className="w-4 h-4" /> Home
                  </Link>
                  <Link href="/my-tickets" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-1">
                      <Ticket className="w-4 h-4" /> My Tickets
                  </Link>
                  <Link href="/notifications" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-1">
                     <Bell className="w-4 h-4" /> Notifications
                  </Link>
                </nav>
            </div>
        </header>

        <main className="flex-grow container mx-auto px-4 py-8"> {/* flex-grow takes remaining space */}
          {children}
        </main>
        <Toaster /> {/* Add Toaster component here */}
      </body>
    </html>
  );
}
