import { EventList } from '@/components/EventList';
import { FeaturedArtistCard } from '@/components/FeaturedArtistCard'; // Import the new component
import { getMusicEvents } from '@/services/event'; // Import function to fetch events
import { Music, Star } from 'lucide-react'; // Use a relevant icon

export default async function HomePage() {
  // Fetch events to find a featured artist and their event
  // In a real app, this logic might be more sophisticated
  const allEvents = await getMusicEvents();
  const upcomingEvents = allEvents
    .filter(event => new Date(event.dateTime) > new Date()) // Filter for future events
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()); // Sort by date

  // Select the first upcoming event's artist as featured (simple logic for now)
  const featuredEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;


  return (
    <div className="space-y-12"> {/* Increased spacing */}
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
       {featuredEvent && (
         <section className="space-y-4">
            <h2 className="text-3xl font-bold text-center flex items-center justify-center gap-2 border-b pb-2 border-primary/30">
               <Star className="w-7 h-7 text-accent" /> Artist of the Week
            </h2>
           <FeaturedArtistCard event={featuredEvent} />
         </section>
       )}


       {/* Upcoming Events Section */}
       <section className="space-y-4">
         <h2 className="text-3xl font-bold text-center border-b pb-2 border-primary/30">Upcoming Events</h2>
         {/* Pass fetched events to EventList to avoid double fetching */}
         <EventList initialEvents={allEvents} />
       </section>
     </div>
  );
}
