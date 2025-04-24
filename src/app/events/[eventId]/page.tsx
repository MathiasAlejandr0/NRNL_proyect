
import { getMusicEventById } from '@/services/event';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { MapPin, CalendarDays, Ticket, Info, Mic2, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { GiveawaySection } from '@/components/GiveawaySection';
import Link from 'next/link';
import { EventMap } from '@/components/EventMap';
import { FormattedEventTime } from '@/components/FormattedEventTime'; // Import the time formatting component


type Props = {
  params: { eventId: string }
}

// isPrismaDecimal check removed as it's not needed for SQLite (uses Float)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await getMusicEventById(params.eventId);

  if (!event) {
    return {
      title: 'Event Not Found',
    }
  }

   const description = event.description || `Details for ${event.name}`;


  return {
    title: `${event.name} | NoRaveNoLife`,
    description: description,
  }
}


export default async function EventDetailPage({ params }: Props) {
  const event = await getMusicEventById(params.eventId);

  if (!event) {
    notFound();
  }

  // ticketPrice is already a number (Float) or null from Prisma with SQLite
  const ticketPriceNumber = event.ticketPrice;


  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
         &larr; Back to Events
      </Link>

      <Card className="overflow-hidden border border-border shadow-xl bg-gradient-to-b from-card via-card/95 to-card/90">
        <CardHeader className="p-0 relative">
          <Image
            src={event.imageUrl}
            alt={event.name}
            width={1200}
            height={400}
            className="w-full h-64 object-cover"
          />
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
           <div className="absolute bottom-0 left-0 p-6">
             <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">{event.name}</h1>
             <p className="text-xl font-semibold text-accent drop-shadow-md">{event.artist}</p>
           </div>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-2"><Info className="w-6 h-6 text-primary" /> Details</h2>
              <p className="text-muted-foreground leading-relaxed">{event.description}</p>
            </div>

             <Separator className="my-6 border-primary/20" />

            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2"><Mic2 className="w-5 h-5 text-primary" /> Artist Info</h3>
              <p className="text-muted-foreground leading-relaxed">{event.artistBio}</p>
            </div>

            <Separator className="my-6 border-primary/20" />

            <div>
               <h3 className="text-xl font-semibold mb-3 flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Venue Info</h3>
               <p className="text-muted-foreground leading-relaxed">{event.venueDetails}</p>
               {/* Interactive Map Section */}
                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2 text-primary flex items-center gap-2"><MapPin className="w-5 h-5" /> Location</h3>
                    {/* Ensure location is passed correctly */}
                    {/* Prisma returns lat/lng directly on the event object */}
                    <EventMap location={{ lat: event.lat, lng: event.lng }} venueName={event.venue} eventName={event.name} />
                </div>
            </div>

          </div>

          <div className="space-y-4">
             <Card className="bg-secondary/50 border-primary/30 p-4">
               <h3 className="text-lg font-semibold mb-3 text-primary flex items-center gap-2"><CalendarDays className="w-5 h-5" /> When</h3>
               {/* Use FormattedEventTime for date */}
               <FormattedEventTime dateTime={event.dateTime} formatString="EEEE, MMMM d, yyyy" />
               <p className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {/* Use FormattedEventTime for time */}
                    <FormattedEventTime dateTime={event.dateTime} formatString="h:mm a" />
               </p>
             </Card>

             <Card className="bg-secondary/50 border-primary/30 p-4">
               <h3 className="text-lg font-semibold mb-3 text-primary flex items-center gap-2"><MapPin className="w-5 h-5" /> Where</h3>
               <p>{event.venue}</p>
               <p className="text-sm text-muted-foreground">{/* Address could go here if separated from venueDetails */}</p>
                {/* Link to open map in external app (optional) */}
                 <a
                     href={`https://www.google.com/maps/search/?api=1&query=${event.lat},${event.lng}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="text-sm text-primary hover:underline mt-2 inline-block"
                 >
                     Open in Maps
                 </a>
             </Card>

             <Card className="bg-secondary/50 border-primary/30 p-4">
               <h3 className="text-lg font-semibold mb-3 text-primary flex items-center gap-2"><Ticket className="w-5 h-5" /> Tickets</h3>
               <p className="text-xl font-bold">{ticketPriceNumber !== null ? `$${ticketPriceNumber.toFixed(2)}` : 'Free Event'}</p>
               {ticketPriceNumber !== null && event.ticketUrl && (
                 <Button asChild className="w-full mt-3 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity shadow-md">
                   <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer">Buy Tickets</a>
                 </Button>
               )}
             </Card>

             {/* Giveaway Section - Pass the full event object */}
             {/* Pass the Prisma event object directly */}
             {event.giveawayActive && (
               <GiveawaySection event={event} />
             )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
