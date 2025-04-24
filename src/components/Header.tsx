'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { Home, Ticket, Bell, LogIn, LogOut, UserCircle, Loader2, Music } from 'lucide-react'; // Added icons
import { auth } from '@/lib/firebase/config'; // Import Firebase auth instance
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push('/'); // Redirect to home page after logout
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Logout Failed",
        description: "An error occurred during logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2 text-primary font-bold text-lg">
          <Music className="w-6 h-6 hidden sm:inline-block" />
          <span className=''>NoRaveNoLife</span>
        </Link>
        <nav className="flex items-center space-x-4">
          {/* Standard Navigation Links (visible on larger screens) */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-1">
              <Home className="w-4 h-4" /> Home
            </Link>
            <Link href="/my-tickets" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-1">
              <Ticket className="w-4 h-4" /> My Tickets
            </Link>
            <Link href="/notifications" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-1">
              <Bell className="w-4 h-4" /> Notifications
            </Link>
          </div>

          {/* Auth Status and User Menu */}
          {loading ? (
             <Loader2 className="w-5 h-5 animate-spin" />
          ) : user ? (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? user.email ?? 'User'} />
                        <AvatarFallback>
                            {user.email ? user.email[0].toUpperCase() : <UserCircle className="w-4 h-4" />}
                        </AvatarFallback>
                        </Avatar>
                    </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* Add profile link if needed */}
                {/* <DropdownMenuItem asChild>
                    <Link href="/profile">
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </Link>
                 </DropdownMenuItem>
                 <DropdownMenuSeparator /> */}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link href="/login" className='flex items-center gap-1'>
                <LogIn className="w-4 h-4" /> Login
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
