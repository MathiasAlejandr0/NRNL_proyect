
'use client';

import { useState, useEffect } from 'react';
import { getUserTickets } from '@/services/event'; // Use mock-based service
import type { UserTicket } from '@/services/event'; // Use mock-based type
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Ticket, QrCode, CalendarDays, Clock, MapPin, Gift, Info, Loader2, UserRoundX } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth hook

export default function MyTicketsPage() {
  const { user, loading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      const fetchTickets = async () => {
        try {
          setLoading(true);
          setError(null);
          // Use mock service
          const userTickets = await getUserTickets(user.uid);
          setTickets(userTickets);
        } catch (err) {
          console.error("Failed to fetch user tickets:", err);
          setError("Could not load your tickets. Please try again later.");
        } finally {
          setLoading(false);
        }
      };

      fetchTickets();
    } else if (!authLoading && !user) {
        setLoading(false);
        setTickets([]);
    }
  }, [user, authLoading]);

  const isLoading = loading || authLoading;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center flex items-center justify-center gap-2">
        <Ticket className="w-8 h-8 text-primary" />
        My Tickets
      </h1>

      {isLoading && (
        <div className="flex justify-center items-center p-10">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="ml-3 text-muted-foreground">Loading...</p>
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
           <AlertDescription>You need to be logged in to view your tickets.</AlertDescription>
            <Button asChild variant="link" className="mt-2 text-primary">
                 <Link href="/login">Login / Sign Up</Link>
             </Button>
         </Alert>
       )}


      {!isLoading && user && tickets.length === 0 && !error && (
        <Alert className="text-center border-dashed border-muted-foreground">
          <Ticket className="h-4 w-4 inline-block mr-2" />
          <AlertTitle>No Tickets Yet!</AlertTitle>
          <AlertDescription>You haven't purchased or won any tickets. Explore events to find your next rave!</AlertDescription>
           <Button asChild variant="link" className="mt-2 text-primary">
                <Link href="/">Browse Events</Link>
            </Button>
        </Alert>
      )}

      {!isLoading && user && tickets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map((ticket) => {
             // Use ticket.dateTime which is a Date object from mock data
             const formattedDate = format(ticket.dateTime, 'eee, MMM d, yyyy');
             const formattedTime = format(ticket.dateTime, 'h:mm a');
             return (
                // Use ticket.ticketId
                <Card key={ticket.ticketId} className="overflow-hidden border border-border shadow-lg bg-gradient-to-br from-card via-card/95 to-card/90">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                         <div>
                             <CardTitle className="text-xl font-bold text-primary">{ticket.eventName}</CardTitle>
                             {/* Use ticket.ticketId */}
                             <CardDescription className="text-muted-foreground">Ticket ID: {ticket.ticketId}</CardDescription>
                         </div>
                         <Badge variant={ticket.type === 'giveaway' ? 'destructive' : 'secondary'} className="capitalize whitespace-nowrap">
                            {ticket.type === 'giveaway' && <Gift className="w-3 h-3 mr-1" />}
                            {ticket.type}
                         </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                     <div className="flex items-center gap-2 text-sm">
                        <CalendarDays className="w-4 h-4 text-muted-foreground" />
                        <span>{formattedDate}</span>
                        <Clock className="w-4 h-4 text-muted-foreground ml-2" />
                        <span>{formattedTime}</span>
                     </div>
                     <div className="flex items-center gap-2 text-sm">
                         <MapPin className="w-4 h-4 text-muted-foreground" />
                         <span>{ticket.venue}</span>
                     </div>
                     <div className="flex flex-col items-center justify-center p-4 bg-secondary/30 rounded-md mt-4 border border-border">
                        <QrCode className="w-16 h-16 text-foreground mb-2" />
                        <p className="text-xs text-muted-foreground break-all">{ticket.qrCodeData}</p>
                        <p className="text-xs text-muted-foreground mt-1">(Scan at Venue Entry)</p>
                     </div>
                  </CardContent>
                  <CardFooter>
                      {/* Use ticket.eventId */}
                     <Button asChild variant="outline" size="sm" className="w-full border-primary text-primary hover:bg-primary/10">
                         <Link href={`/events/${ticket.eventId}`}>View Event Details</Link>
                     </Button>
                  </CardFooter>
                </Card>
             );
          })}
        </div>
      )}
    </div>
  );
}
