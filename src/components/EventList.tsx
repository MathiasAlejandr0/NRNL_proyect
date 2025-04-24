
'use client';

import type { MusicEvent } from '@prisma/client'; // Use Prisma-generated type
import { useEffect, useState } from 'react';
import { getMusicEvents } from '@/services/event'; // Use Prisma-based service
import { EventCard } from './EventCard';
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface EventListProps {
  initialEvents?: MusicEvent[]; // Accept pre-fetched Prisma-based events
}

export function EventList({ initialEvents }: EventListProps) {
  const [events, setEvents] = useState<MusicEvent[]>(initialEvents || []);
  const [loading, setLoading] = useState(!initialEvents);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialEvents) {
      const fetchEvents = async () => {
        try {
          setLoading(true);
          setError(null);
          // Fetch using Prisma service
          const fetchedEvents = await getMusicEvents();
          // Sorting is handled by getMusicEvents, no need to sort here unless logic changes
          setEvents(fetchedEvents);
        } catch (err: any) {
          console.error("Failed to fetch events:", err);
          setError(err.message || "Could not load events. Please try again later.");
        } finally {
          setLoading(false);
        }
      };
      fetchEvents();
    } else {
       // If initial events are provided, assume they are sorted from server
       setEvents(initialEvents);
       setLoading(false);
    }
  }, [initialEvents]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
           <div key={i} className="flex flex-col space-y-3 bg-card p-4 rounded-lg border border-border">
             <Skeleton className="h-[192px] w-full rounded-xl bg-muted" />
             <div className="space-y-2 pt-2">
               <Skeleton className="h-6 w-3/4 bg-muted" />
               <Skeleton className="h-4 w-1/2 bg-muted" />
               <Skeleton className="h-4 w-5/6 bg-muted" />
                <Skeleton className="h-4 w-4/6 bg-muted" />
             </div>
              <Skeleton className="h-10 w-full mt-auto bg-muted" />
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

  // Filter out past events using Date objects
  const now = new Date();
  const upcomingEvents = events.filter(event => event.dateTime && event.dateTime >= now);


  if (upcomingEvents.length === 0) {
     return (
        <Alert className="mt-6 border-dashed border-accent text-center">
            <AlertCircle className="h-4 w-4 inline-block mr-2 text-accent" />
           <AlertTitle className="text-lg font-semibold">No Upcoming Events Found</AlertTitle>
           <AlertDescription className="text-muted-foreground">
             There are currently no upcoming electronic music events listed. Check back soon!
           </AlertDescription>
         </Alert>
     )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {upcomingEvents.map((event) => (
        // Pass the Prisma event object directly
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
