
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Home, Ticket, Bell } from 'lucide-react';

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
      <head />
      <body className={cn(
        "antialiased",
        "bg-gradient-to-br from-background to-background/90 min-h-screen flex flex-col-reverse items-center"
        )}>
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between px-4">
                 <Link href="/" className="flex items-center space-x-2 text-primary font-bold text-lg">
                   {/* <Music className="w-6 h-6" /> Optional Logo Icon */}
                   <span className='hidden md:block'>NoRaveNoLife</span>
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

        <main className="flex-grow container mx-auto px-4 py-8 w-full max-w-screen-lg">
          {children}
        </main>

        <nav className="sticky bottom-0 z-50 w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-around px-4">
              
                <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center flex-col gap-1">
                    <Home className="w-6 h-6" />
                    <span className='hidden sm:block'>Home</span>
                </Link>
                <Link href="/my-tickets" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center flex-col gap-1">
                    <Ticket className="w-6 h-6" />
                    <span className='hidden sm:block'>My Tickets</span>
                </Link>
                <Link href="/notifications" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center flex-col gap-1">
                  <Bell className="w-6 h-6" />
                  <span className='hidden sm:block'>Notifications</span>
                </Link>
            </div>
        </nav>
        <Toaster />
      </body>
    </html>
  );
}
