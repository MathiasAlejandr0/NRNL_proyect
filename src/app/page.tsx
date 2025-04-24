
import { EventList } from '@/components/EventList';
import { FeaturedArtistCard } from '@/components/FeaturedArtistCard';
import { getMusicEvents } from '@/services/event'; // Use Prisma-based service
import type { MusicEvent } from '@prisma/client'; // Use Prisma-generated type
import { Music, Star, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function HomePage() {
  let allEvents: MusicEvent[] = [];
  let featuredEvent: MusicEvent | null = null;
  let fetchError: string | null = null;

  try {
    // Fetch events using Prisma service (returns Prisma MusicEvent type)
    allEvents = await getMusicEvents();

    // Filter upcoming events and sort (Prisma returns Date objects)
    const upcomingEvents = allEvents
      .filter(event => event.dateTime && event.dateTime > new Date())
      // Sorting is already done by getMusicEvents, but double-check if needed
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

    // Select the first upcoming event's artist as featured
    featuredEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;

  } catch (error) {
     console.error("Failed to fetch events for Home Page:", error);
     fetchError = "Could not load event data. Please try again later.";
     allEvents = []; // Ensure empty array on error
  }

  return (
    <div className="space-y-12">
       <div className="text-center space-y-2 py-8 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 rounded-lg shadow-inner">
         <Music className="w-16 h-16 mx-auto text-primary animate-pulse" />
         <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
           NoRaveNoLife
         </h1>
         <p className="text-lg text-muted-foreground max-w-xl mx-auto">
           Discover the best electronic music and techno events happening near you. Never miss a beat!
         </p>
       </div>

        {/* Featured Artist Section */}
       {featuredEvent && !fetchError && (
         <section className="space-y-4">
            <h2 className="text-3xl font-bold text-center flex items-center justify-center gap-2 border-b pb-2 border-primary/30">
               <Star className="w-7 h-7 text-accent" /> Artist of the Week
            </h2>
           {/* Pass the Prisma event object directly */}
           <FeaturedArtistCard event={featuredEvent} />
         </section>
       )}
        {/* Added condition for when no upcoming events exist but no error occurred */}
        {!featuredEvent && !fetchError && allEvents.length > 0 && (
             <div className="text-center text-muted-foreground py-4">No upcoming featured artists this week.</div>
        )}
        {/* Keep existing no events message if allEvents is empty and no error */}
         {!featuredEvent && !fetchError && allEvents.length === 0 && (
             <div className="text-center text-muted-foreground py-4">No events scheduled yet. Check back soon!</div>
         )}


       {/* Upcoming Events Section */}
       <section className="space-y-4">
         <h2 className="text-3xl font-bold text-center border-b pb-2 border-primary/30">Upcoming Events</h2>
          {fetchError ? (
             <Alert variant="destructive" className="mt-6">
               <AlertCircle className="h-4 w-4" />
               <AlertTitle>Error Loading Events</AlertTitle>
               <AlertDescription>{fetchError}</AlertDescription>
             </Alert>
          ) : (
            /* Pass fetched Prisma events (or empty array on error) to EventList */
            <EventList initialEvents={allEvents} />
          )}
       </section>
     </div>
  );
}
