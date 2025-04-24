
'use client';

import { useState, useEffect } from 'react';
import { getUserTickets } from '@/services/event';
import type { UserTicket } from '@/services/event';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Ticket, QrCode, CalendarDays, Clock, MapPin, Gift, Info, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock user ID - replace with actual authentication later
  const userId = 'user123';

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError(null);
        const userTickets = await getUserTickets(userId);
        setTickets(userTickets);
      } catch (err) {
        console.error("Failed to fetch user tickets:", err);
        setError("Could not load your tickets. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []); // Fetch tickets on component mount for the mock user

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center flex items-center justify-center gap-2">
        <Ticket className="w-8 h-8 text-primary" />
        My Tickets
      </h1>

      {loading && (
        <div className="flex justify-center items-center p-10">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="ml-3 text-muted-foreground">Loading your tickets...</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && tickets.length === 0 && (
        <Alert className="text-center border-dashed border-muted-foreground">
          <Ticket className="h-4 w-4 inline-block mr-2" />
          <AlertTitle>No Tickets Yet!</AlertTitle>
          <AlertDescription>You haven't purchased or won any tickets. Explore events to find your next rave!</AlertDescription>
           <Button asChild variant="link" className="mt-2 text-primary">
                <Link href="/">Browse Events</Link>
            </Button>
        </Alert>
      )}

      {!loading && !error && tickets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map((ticket) => {
             const formattedDate = format(new Date(ticket.dateTime), 'eee, MMM d, yyyy');
             const formattedTime = format(new Date(ticket.dateTime), 'h:mm a');
             return (
                <Card key={ticket.ticketId} className="overflow-hidden border border-border shadow-lg bg-gradient-to-br from-card via-card/95 to-card/90">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                         <div>
                             <CardTitle className="text-xl font-bold text-primary">{ticket.eventName}</CardTitle>
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

    