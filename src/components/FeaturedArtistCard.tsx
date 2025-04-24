
import type { MusicEvent } from '@/services/event';
import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, MapPin, Ticket } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FormattedEventTime } from './FormattedEventTime'; // Import the client component

interface FeaturedArtistCardProps {
  event: MusicEvent; // We use the event data to display artist and event info
}

export function FeaturedArtistCard({ event }: FeaturedArtistCardProps) {
  // Formatting moved to FormattedEventTime component

  return (
    <Card className="overflow-hidden border border-accent shadow-lg hover:shadow-accent/30 transition-shadow duration-300 bg-gradient-to-bl from-card via-card/90 to-accent/10">
      <div className="md:flex">
        <div className="md:w-1/3 relative">
          <Image
            src={event.imageUrl}
            alt={`Featured artist: ${event.artist}`}
            width={400}
            height={400}
            className="w-full h-48 md:h-full object-cover"
          />
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent md:bg-gradient-to-r"></div>
        </div>
        <div className="md:w-2/3 flex flex-col">
          <CardHeader className="pb-2">
            <Badge variant="secondary" className="absolute top-2 right-2 md:top-4 md:right-4 bg-accent text-accent-foreground shadow">
              Featured Artist
            </Badge>
            <CardTitle className="text-3xl font-extrabold text-accent">{event.artist}</CardTitle>
            <CardDescription className="text-muted-foreground pt-1">
                Catch them live soon! Don't miss their set at <span className="font-semibold text-foreground">{event.name}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 flex-grow space-y-3">
             {/* Display truncated artist bio */}
             <p className="text-sm text-muted-foreground italic">
               {event.artistBio ? `${event.artistBio.substring(0, 150)}${event.artistBio.length > 150 ? '...' : ''}` : 'No artist bio available.'}
              </p>
             <div>
                <h4 className="font-semibold text-primary mb-1">Next Show: {event.name}</h4>
                 <div className="space-y-1 text-sm text-muted-foreground">
                   <div className="flex items-center gap-2">
                     <CalendarDays className="w-4 h-4 text-primary/80" />
                     {/* Use FormattedEventTime for date and time */}
                     <FormattedEventTime dateTime={event.dateTime} formatString="eee, MMM d, yyyy 'at' h:mm a" />
                   </div>
                   <div className="flex items-center gap-2">
                     <MapPin className="w-4 h-4 text-primary/80" />
                     <span className="truncate">{event.venue}</span>
                   </div>
                    {event.ticketPrice !== null && (
                        <div className="flex items-center gap-2">
                            <Ticket className="w-4 h-4 text-primary/80" />
                            <span>Tickets: ${event.ticketPrice}</span>
                        </div>
                    )}
                 </div>
             </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button asChild variant="default" size="lg" className="w-full md:w-auto bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity shadow-md">
              <Link href={`/events/${event.id}`}>View Event Details</Link>
            </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
    