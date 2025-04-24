'use client';

import type { MusicEvent } from '@/services/event';
import { useEffect, useState } from 'react';
import { getMusicEvents } from '@/services/event'; // Keep for potential client-side updates/filtering later
import { EventCard } from './EventCard';
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface EventListProps {
  initialEvents?: MusicEvent[]; // Accept pre-fetched events
}

export function EventList({ initialEvents }: EventListProps) {
  const [events, setEvents] = useState<MusicEvent[]>(initialEvents || []);
  const [loading, setLoading] = useState(!initialEvents); // Only load if no initial events provided
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if initialEvents were not provided
    if (!initialEvents) {
      const fetchEvents = async () => {
        try {
          setLoading(true);
          setError(null);
          // TODO: Implement actual location fetching later
          const fetchedEvents = await getMusicEvents();
          // Sorting is now handled server-side or in getMusicEvents, but ensure it here if needed
          // fetchedEvents.sort((a, b) => a.dateTime.toMillis() - b.dateTime.toMillis());
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
       // If initial events are provided, ensure they are sorted (if not already)
       const sortedEvents = [...initialEvents].sort((a, b) => a.dateTime.toMillis() - b.dateTime.toMillis());
       setEvents(sortedEvents);
       setLoading(false); // Already loaded
    }
  }, [initialEvents]); // Re-run if initialEvents changes

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

  // Filter out past events before rendering the list using Timestamps
  const now = new Date();
  const upcomingEvents = events.filter(event => event.dateTime && event.dateTime.toDate() >= now);


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
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
    