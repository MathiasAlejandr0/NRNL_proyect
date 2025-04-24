import { EventList } from '@/components/EventList';
import { Music } from 'lucide-react'; // Use a relevant icon

export default function HomePage() {
  return (
    <div className="space-y-8">
       <div className="text-center space-y-2 py-8 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 rounded-lg shadow-inner">
         <Music className="w-16 h-16 mx-auto text-primary animate-pulse" />
         <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
           NoRaveNoLife
         </h1>
         <p className="text-lg text-muted-foreground max-w-xl mx-auto">
           Discover the best electronic music and techno events happening near you. Never miss a beat!
         </p>
       </div>

       <h2 className="text-3xl font-bold text-center border-b pb-2 border-primary/30">Upcoming Events</h2>
       <EventList />
     </div>
  );
}
