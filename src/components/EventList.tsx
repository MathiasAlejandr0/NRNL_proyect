'use client';

import type { MusicEvent } from '@/services/event';
import { useEffect, useState } from 'react';
import { getMusicEvents } from '@/services/event';
import { EventCard } from './EventCard';
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export function EventList() {
  const [events, setEvents] = useState<MusicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        // TODO: Implement actual location fetching later
        const fetchedEvents = await getMusicEvents();
        // Sort events by date (soonest first)
        fetchedEvents.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
        setEvents(fetchedEvents);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError("Could not load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
           <div key={i} className="flex flex-col space-y-3">
             <Skeleton className="h-[192px] w-full rounded-xl" />
             <div className="space-y-2 p-4">
               <Skeleton className="h-6 w-3/4" />
               <Skeleton className="h-4 w-1/2" />
               <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
             </div>
              <Skeleton className="h-10 w-full mt-auto p-4" />
           </div>
        ))}
      </div>
    );
  }

  if (error) {
     return (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
     )
  }

  if (events.length === 0) {
     return (
        <Alert className="mt-6 border-dashed border-accent text-center">
            <AlertCircle className="h-4 w-4 inline-block mr-2 text-accent" />
           <AlertTitle className="text-lg font-semibold">No Events Found</AlertTitle>
           <AlertDescription className="text-muted-foreground">
             There are currently no electronic music events listed for your area. Check back soon!
           </AlertDescription>
         </Alert>
     )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
