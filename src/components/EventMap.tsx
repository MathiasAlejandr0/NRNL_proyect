
'use client';

import type { Location } from '@/services/event';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

// Default Leaflet icon paths might break in Next.js, so we fix them
// Import images directly. Ensure these are available.
// Note: If using a CDN or other asset handling, adjust paths accordingly.
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

interface EventMapProps {
  location: Location;
  venueName: string;
  eventName: string;
}

export function EventMap({ location, venueName, eventName }: EventMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null); // To store map instance
  const LRef = useRef<typeof L | null>(null); // To store Leaflet instance

  useEffect(() => {
    // Dynamically import Leaflet only on the client-side
    import('leaflet').then(leaflet => {
      LRef.current = leaflet; // Store Leaflet instance

      // Fix Leaflet's default icon paths *after* Leaflet is loaded
      // Ensure this runs only once or when necessary
      if (LRef.current && !(LRef.current.Icon.Default.prototype as any)._iconUrlFixed) {
        delete (LRef.current.Icon.Default.prototype as any)._getIconUrl;
        LRef.current.Icon.Default.mergeOptions({
          iconRetinaUrl: iconRetinaUrl.src,
          iconUrl: iconUrl.src,
          shadowUrl: shadowUrl.src,
        });
        (LRef.current.Icon.Default.prototype as any)._iconUrlFixed = true; // Mark as fixed
      }


      if (mapContainerRef.current && LRef.current) {
        const L = LRef.current; // Use the stored Leaflet instance

        // Initialize map only once or if it doesn't exist
        if (!mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current).setView([location.lat, location.lng], 15); // Set initial view and zoom

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapRef.current);

            // Explicitly create the icon
            const defaultIcon = new L.Icon.Default();

            const marker = L.marker([location.lat, location.lng], { icon: defaultIcon }).addTo(mapRef.current);
            marker.bindPopup(`<b>${eventName}</b><br>${venueName}`).openPopup(); // Add popup to marker

        } else {
             // If map exists, just update view and marker position/popup
             mapRef.current.setView([location.lat, location.lng], 15);

             mapRef.current.eachLayer((layer) => {
                 if (layer instanceof L.Marker) {
                    layer.setLatLng([location.lat, location.lng]);
                    layer.bindPopup(`<b>${eventName}</b><br>${venueName}`).openPopup();
                 }
             });
        }
      }

    }).catch(error => {
        console.error("Failed to load Leaflet", error);
        // Handle error appropriately, e.g., show a message to the user
    });


    // Cleanup function to remove map on component unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null; // Clear reference
      }
    };
  }, [location, venueName, eventName]); // Re-run effect if location, venue, or event name changes

  return (
    <div
      ref={mapContainerRef}
      className="h-64 md:h-80 w-full rounded-lg border border-border shadow-inner bg-muted" // Style the map container
      aria-label={`Map showing location for ${eventName} at ${venueName}`}
    >
       {/* Map will be rendered here by Leaflet */}
       <span className="sr-only">Interactive map showing event location. Map loading...</span>
       {/* Add a loading state or placeholder if needed */}
       {!LRef.current && <div className="flex items-center justify-center h-full text-muted-foreground">Loading map...</div>}
    </div>
  );
}
