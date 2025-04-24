import { EventList } from '@/components/EventList';
import { FeaturedArtistCard } from '@/components/FeaturedArtistCard';
import { getMusicEvents } from '@/services/event';
import { Music, Star, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components

export default async function HomePage() {
  let allEvents = [];
  let featuredEvent = null;
  let fetchError = null;

  try {
    allEvents = await getMusicEvents();
    const upcomingEvents = allEvents
      // Ensure dateTime is valid and convert Timestamp to Date for comparison
      .filter(event => event.dateTime && event.dateTime.toDate() > new Date())
      // Sort by date using Timestamps
      .sort((a, b) => a.dateTime.toMillis() - b.dateTime.toMillis());

    // Select the first upcoming event's artist as featured
    featuredEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;
  } catch (error) {
     console.error("Failed to fetch events for Home Page:", error);
     fetchError = "Could not load event data. Please try again later.";
     // featuredEvent remains null, initialEvents will be empty for EventList
     allEvents = [];
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
           <FeaturedArtistCard event={featuredEvent} />
         </section>
       )}
        {!featuredEvent && !fetchError && (
             <div className="text-center text-muted-foreground">No upcoming featured artists this week.</div>
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
            /* Pass fetched events (or empty array on error) to EventList */
            <EventList initialEvents={allEvents} />
          )}
       </section>
     </div>
  );
}
    