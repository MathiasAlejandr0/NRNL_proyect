'use client';

import type { MusicEvent } from '@/services/event';
import { useState, useEffect } from 'react';
import { enterGiveaway, hasUserEnteredGiveaway } from '@/services/event';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Clock, CheckCircle, AlertCircle, Loader2, UserRoundX } from 'lucide-react'; // Added UserRoundX
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth hook
import Link from 'next/link'; // Import Link

interface GiveawaySectionProps {
  event: MusicEvent;
}

export function GiveawaySection({ event }: GiveawaySectionProps) {
  const { user, loading: authLoading } = useAuth(); // Get user and auth loading state
  const { toast } = useToast();
  const [isEntered, setIsEntered] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Loading state for initial check
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for submission
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only check status if auth is loaded, user exists, and giveaway is active
    if (!authLoading && user && event.giveawayActive) {
      const checkEntryStatus = async () => {
        try {
          setIsLoading(true);
          const entered = await hasUserEnteredGiveaway(user.uid, event.id); // Use actual user ID
          setIsEntered(entered);
        } catch (err) {
          console.error("Failed to check giveaway status:", err);
          // Don't block UI for this, maybe show a subtle error
        } finally {
          setIsLoading(false);
        }
      };
      checkEntryStatus();
    } else {
        // If no user or giveaway not active, stop loading
        setIsLoading(false);
        setIsEntered(false); // Ensure isEntered is false
    }
  }, [event.id, event.giveawayActive, user, authLoading]); // Depend on user and authLoading

  const handleEnterGiveaway = async () => {
     if (!user) {
         toast({
             title: "Login Required",
             description: "You need to be logged in to enter the giveaway.",
             variant: "destructive",
           });
         return; // Don't proceed if user is not logged in
     }

    setIsSubmitting(true);
    setError(null);
    try {
      const success = await enterGiveaway(user.uid, event.id); // Use actual user ID
      if (success) {
        setIsEntered(true);
        toast({
          title: "Successfully Entered!",
          description: `You're in the draw for ${event.name}. Good luck!`,
          variant: "default",
          className: "bg-primary text-primary-foreground border-primary/50",
        });
      } else {
         const now = new Date();
         const endDate = event.giveawayEndDate ? parseISO(event.giveawayEndDate) : null;
         let reason = "Could not enter giveaway. It might be closed or you've already entered.";
         if (endDate && now > endDate) {
             reason = "Could not enter giveaway. The entry period has ended.";
         }

         setError(reason);
         toast({
           title: "Entry Failed",
           description: reason,
           variant: "destructive",
         });
      }
    } catch (err) {
      console.error("Failed to enter giveaway:", err);
      const reason = "An error occurred while entering the giveaway. Please try again.";
      setError(reason);
      toast({
        title: "Error",
        description: reason,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!event.giveawayActive) {
    return null; // Don't render if giveaway isn't active
  }

  const endDate = event.giveawayEndDate ? parseISO(event.giveawayEndDate) : null;
  const isGiveawayOpen = endDate ? new Date() < endDate : true; // Assume open if no end date
  const timeLeft = endDate && isGiveawayOpen ? formatDistanceToNowStrict(endDate, { addSuffix: true }) : null;

  const showLoadingSpinner = isLoading || authLoading;

  return (
    <Card className="bg-gradient-to-br from-accent/20 via-accent/10 to-transparent border-accent shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-accent">
          <Gift className="w-6 h-6 animate-bounce" /> Ticket Giveaway!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
         {event.giveawayTickets && (
            <p className="text-sm font-medium">{event.giveawayTickets} {event.giveawayTickets > 1 ? 'tickets' : 'ticket'} up for grabs!</p>
         )}
         {timeLeft && isGiveawayOpen && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-4 h-4" /> Closes {timeLeft}
            </p>
         )}
         {!isGiveawayOpen && endDate && (
            <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> Giveaway closed.
            </p>
         )}

        {showLoadingSpinner ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : !user ? (
            <div className="flex flex-col items-center gap-2 text-center text-muted-foreground p-2 bg-secondary/30 rounded-md border border-border">
                 <UserRoundX className="w-5 h-5 text-primary" />
                 <p className="text-sm">Login required to enter.</p>
                  <Button asChild variant="link" size="sm" className="text-primary p-0 h-auto">
                     <Link href="/login">Login / Sign Up</Link>
                 </Button>
            </div>
        ) : isEntered ? (
          <div className="flex items-center gap-2 text-green-400 font-semibold p-2 bg-green-900/30 rounded-md border border-green-600">
            <CheckCircle className="w-5 h-5" /> You've Entered! Good Luck!
          </div>
        ) : isGiveawayOpen ? (
          <Button
            onClick={handleEnterGiveaway}
            disabled={isSubmitting || !user} // Disable if submitting or no user
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 transition-colors shadow-md disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entering...
              </>
            ) : (
              'Enter Giveaway'
            )}
          </Button>
        ) : null /* Don't show button if closed and not entered */}

        {error && !isEntered && user && ( // Show error only if user is logged in and not successfully entered
           <p className="text-xs text-destructive flex items-center gap-1 mt-2">
              <AlertCircle className="w-3 h-3" /> {error}
           </p>
        )}
      </CardContent>
    </Card>
  );
}
