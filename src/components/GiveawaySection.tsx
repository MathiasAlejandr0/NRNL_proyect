'use client';

import type { MusicEvent } from '@/services/event';
import { useState, useEffect } from 'react';
import { enterGiveaway, hasUserEnteredGiveaway } from '@/services/event';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';

interface GiveawaySectionProps {
  event: MusicEvent;
}

export function GiveawaySection({ event }: GiveawaySectionProps) {
  const { toast } = useToast();
  const [isEntered, setIsEntered] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Loading state for initial check
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for submission
  const [error, setError] = useState<string | null>(null);

  // Mock user ID - replace with actual authentication later
  const userId = 'user123';

  useEffect(() => {
    const checkEntryStatus = async () => {
      if (!event.giveawayActive) {
         setIsLoading(false);
         return;
      }
      try {
        setIsLoading(true);
        const entered = await hasUserEnteredGiveaway(userId, event.id);
        setIsEntered(entered);
      } catch (err) {
        console.error("Failed to check giveaway status:", err);
        // Don't block UI for this, maybe show a subtle error
      } finally {
        setIsLoading(false);
      }
    };
    checkEntryStatus();
  }, [event.id, event.giveawayActive]);

  const handleEnterGiveaway = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const success = await enterGiveaway(userId, event.id);
      if (success) {
        setIsEntered(true);
        toast({
          title: "Successfully Entered!",
          description: `You're in the draw for ${event.name}. Good luck!`,
          variant: "default", // Use default which is styled dark/neon now
          className: "bg-primary text-primary-foreground border-primary/50",
        });
      } else {
         // Check if giveaway ended
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

        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : isEntered ? (
          <div className="flex items-center gap-2 text-green-400 font-semibold p-2 bg-green-900/30 rounded-md border border-green-600">
            <CheckCircle className="w-5 h-5" /> You've Entered! Good Luck!
          </div>
        ) : isGiveawayOpen ? (
          <Button
            onClick={handleEnterGiveaway}
            disabled={isSubmitting}
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

        {error && !isEntered && ( // Show error only if not successfully entered
           <p className="text-xs text-destructive flex items-center gap-1 mt-2">
              <AlertCircle className="w-3 h-3" /> {error}
           </p>
        )}
      </CardContent>
    </Card>
  );
}
