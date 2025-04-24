'use client';

import { useState, useEffect } from 'react';
import { checkGiveawayWins, getMusicEventById } from '@/services/event';
import type { MusicEvent } from '@/services/event';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BellRing, Gift, Ticket, Info, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotificationsPage() {
  const [wins, setWins] = useState<MusicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock user ID - replace with actual authentication later
  const userId = 'user123';

  useEffect(() => {
    const fetchWins = async () => {
      try {
        setLoading(true);
        setError(null);
        const wonEventIds = await checkGiveawayWins(userId);
        const wonEventsDetails: MusicEvent[] = [];

        for (const eventId of wonEventIds) {
          const eventDetails = await getMusicEventById(eventId);
          if (eventDetails) {
            wonEventsDetails.push(eventDetails);
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
  }, []);


  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center flex items-center justify-center gap-2">
        <BellRing className="w-8 h-8 text-primary" />
        Notifications
      </h1>

      {loading && (
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


      {!loading && !error && wins.length === 0 && (
        <Alert className="text-center border-dashed border-muted-foreground">
          <BellRing className="h-4 w-4 inline-block mr-2" />
          <AlertTitle>All Clear!</AlertTitle>
          <AlertDescription>You have no new notifications.</AlertDescription>
        </Alert>
      )}

      {!loading && !error && wins.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-green-400">Giveaway Wins!</h2>
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
                 {/* Add instructions on how to claim tickets here */}
                 <p className="text-sm text-primary font-medium">Check your email for instructions on how to claim your prize.</p>
                 <Button asChild variant="outline" size="sm" className="mt-2 border-primary text-primary hover:bg-primary/10">
                     <Link href={`/events/${event.id}`}>View Event</Link>
                 </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
