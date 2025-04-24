
import type { MusicEvent } from '@prisma/client'; // Use Prisma-generated type
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, CalendarDays, Ticket } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormattedEventTime } from './FormattedEventTime'; // Use the client component

interface EventCardProps {
  event: MusicEvent; // Use Prisma-generated type
}

export function EventCard({ event }: EventCardProps) {

   // ticketPrice is already a number (Float) or null from Prisma
   const ticketPriceNumber = event.ticketPrice;

  return (
    <Card className="overflow-hidden group border border-border hover:border-primary transition-colors duration-300 shadow-lg hover:shadow-primary/20 flex flex-col h-full bg-gradient-to-br from-card via-card/95 to-card/90">
      <CardHeader className="p-0 relative">
         {/* Link uses event.id */}
        <Link href={`/events/${event.id}`} className="block">
          <Image
            src={event.imageUrl}
            alt={event.name}
            width={600}
            height={400}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
         {event.giveawayActive && (
           <Badge variant="destructive" className="absolute top-2 right-2 bg-gradient-to-r from-accent to-destructive text-white shadow-md animate-pulse">
             Giveaway!
           </Badge>
         )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
         {/* Link uses event.id */}
        <Link href={`/events/${event.id}`} className="block">
            <CardTitle className="text-xl font-bold mb-2 hover:text-primary transition-colors truncate">{event.name}</CardTitle>
        </Link>
        <p className="text-lg font-semibold text-accent mb-3 truncate">{event.artist}</p>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            {/* Pass the Prisma Date object */}
            <FormattedEventTime dateTime={event.dateTime} />
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="truncate">{event.venue}</span>
          </div>
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-primary" />
            {/* Display formatted ticket price */}
            <span>{ticketPriceNumber !== null ? `$${ticketPriceNumber.toFixed(2)}` : 'Free'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
         {/* Link uses event.id */}
        <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 hover:text-primary">
          <Link href={`/events/${event.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
