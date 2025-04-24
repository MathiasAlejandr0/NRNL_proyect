
'use client';

import { useState, useEffect } from 'react';
import { checkGiveawayWins, getMusicEventById } from '@/services/event'; // Use Prisma-based services
import type { MusicEvent } from '@prisma/client'; // Use Prisma-generated type
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BellRing, Gift, Ticket, Info, Loader2, UserRoundX } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [wins, setWins] = useState<MusicEvent[]>([]); // Store full MusicEvent objects (Prisma type)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
     if (!authLoading && user) {
        const fetchWins = async () => {
          try {
            setLoading(true);
            setError(null);
            const wonEventIds = await checkGiveawayWins(user.uid); // Use actual user ID
            const wonEventsDetails: MusicEvent[] = [];

            // Fetch details for each won event ID
            for (const eventId of wonEventIds) {
              const eventDetails = await getMusicEventById(eventId); // Fetch full event details (Prisma type)
              if (eventDetails) {
                wonEventsDetails.push(eventDetails);
              } else {
                  console.warn(`Could not fetch details for won event ID: ${eventId}`);
              }
            }
            setWins(wonEventsDetails);
          } catch (err) {
            console.error("Failed to fetch giveaway wins:", err);
            setError("Could not load notifications. Please try again later.");
          } finally {
            setLoading(false);
          }
        };
        fetchWins();
     } else if (!authLoading && !user) {
        setLoading(false);
        setWins([]);
     }
  }, [user, authLoading]);

  const isLoading = loading || authLoading;

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center flex items-center justify-center gap-2">
        <BellRing className="w-8 h-8 text-primary" />
        Notifications
      </h1>

      {isLoading && (
        <div className="flex justify-center items-center p-10">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Checking for good news...</p>
        </div>
      )}

       {error && (
         <Alert variant="destructive">
           <Info className="h-4 w-4" />
           <AlertTitle>Error</AlertTitle>
           <AlertDescription>{error}</AlertDescription>
         </Alert>
       )}

       {!isLoading && !user && (
         <Alert className="text-center border-dashed border-muted-foreground">
           <UserRoundX className="h-4 w-4 inline-block mr-2" />
           <AlertTitle>Please Login</AlertTitle>
           <AlertDescription>You need to be logged in to view your notifications.</AlertDescription>
            <Button asChild variant="link" className="mt-2 text-primary">
                 <Link href="/login">Login / Sign Up</Link>
             </Button>
         </Alert>
       )}


      {!isLoading && user && wins.length === 0 && !error && (
        <Alert className="text-center border-dashed border-muted-foreground">
          <BellRing className="h-4 w-4 inline-block mr-2" />
          <AlertTitle>All Clear!</AlertTitle>
          <AlertDescription>You have no new notifications.</AlertDescription>
        </Alert>
      )}

      {!isLoading && user && wins.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-green-400">Giveaway Wins!</h2>
          {/* Render based on the fetched MusicEvent details */}
          {wins.map((event) => (
            <Card key={event.id} className="bg-gradient-to-r from-green-900/30 via-card to-card border-green-500 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-400">
                   <Gift className="w-6 h-6" /> You Won Tickets!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                 <p className="font-semibold text-lg">{event.name}</p>
                 <p className="text-muted-foreground">Congratulations! You've won tickets to {event.artist} at {event.venue}.</p>
                 <p className="text-sm text-primary font-medium">Check 'My Tickets' section to see your winnings!</p>
                 <Button asChild variant="outline" size="sm" className="mt-2 border-primary text-primary hover:bg-primary/10">
                     {/* Link using event.id */}
                     <Link href={`/events/${event.id}`}>View Event</Link>
                 </Button>
                 <Button asChild variant="secondary" size="sm" className="mt-2 ml-2">
                     <Link href="/my-tickets">Go to My Tickets</Link>
                 </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
