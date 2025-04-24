
'use client';

import type { MusicEvent } from '@/services/event'; // Use mock-based type
import { useState, useEffect } from 'react';
import { enterGiveaway, hasUserEnteredGiveaway } from '@/services/event'; // Use mock-based services
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Clock, CheckCircle, AlertCircle, Loader2, UserRoundX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNowStrict, isBefore } from 'date-fns'; // Use date-fns for date comparison
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

interface GiveawaySectionProps {
  event: MusicEvent; // Expect mock-based type
}

export function GiveawaySection({ event }: GiveawaySectionProps) {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isEntered, setIsEntered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user && event.giveawayActive) {
      const checkEntryStatus = async () => {
        try {
          setIsLoading(true);
          // Use mock-based service
          const entered = await hasUserEnteredGiveaway(user.uid, event.id);
          setIsEntered(entered);
        } catch (err) {
          console.error("Failed to check giveaway status:", err);
        } finally {
          setIsLoading(false);
        }
      };
      checkEntryStatus();
    } else {
        setIsLoading(false);
        setIsEntered(false);
    }
  }, [event.id, event.giveawayActive, user, authLoading]);

  const handleEnterGiveaway = async () => {
     if (!user) {
         toast({
             title: "Login Required",
             description: "You need to be logged in to enter the giveaway.",
             variant: "destructive",
           });
         return;
     }

    setIsSubmitting(true);
    setError(null);
    try {
      // Use mock-based service
      const success = await enterGiveaway(user.uid, event.id);
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
         // Use Date object or null from mock data directly
         const endDate = event.giveawayEndDate;
         let reason = "Could not enter giveaway. It might be closed or you've already entered.";
         if (endDate && isBefore(endDate, now)) { // Check if end date is in the past
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
    return null;
  }

   // Use Date object or null from mock data for giveawayEndDate
  const endDate = event.giveawayEndDate;
  const isGiveawayOpen = endDate ? isBefore(new Date(), endDate) : true; // Check if now is before end date
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
            disabled={isSubmitting || !user}
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
        ) : null}

        {error && !isEntered && user && (
           <p className="text-xs text-destructive flex items-center gap-1 mt-2">
              <AlertCircle className="w-3 h-3" /> {error}
           </p>
        )}
      </CardContent>
    </Card>
  );
}
