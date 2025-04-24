
'use client';

import type { Location } from '@/services/event';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

// Default Leaflet icon paths might break in Next.js, so we fix them
// Import images directly. Ensure these are available.
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

         // Explicitly create the icon *after* defaults are potentially merged
        const defaultIcon = new L.Icon.Default();

        // Initialize map only once or if it doesn't exist
        if (!mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current).setView([location.lat, location.lng], 15); // Set initial view and zoom

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapRef.current);


            const marker = L.marker([location.lat, location.lng], { icon: defaultIcon }).addTo(mapRef.current);
            marker.bindPopup(`<b>${eventName}</b><br>${venueName}`).openPopup(); // Add popup to marker

        } else {
             // If map exists, just update view and marker position/popup
             mapRef.current.setView([location.lat, location.lng], 15);

             mapRef.current.eachLayer((layer) => {
                 if (layer instanceof L.Marker) {
                    layer.setLatLng([location.lat, location.lng]);
                    // Ensure marker uses the correctly configured icon if it needs recreation
                    layer.setIcon(defaultIcon);
                    layer.bindPopup(`<b>${eventName}</b><br>${venueName}`).openPopup();
                 } else if (layer instanceof L.TileLayer){
                     // Optional: Force redraw tile layer if needed, though usually not necessary for view changes
                    // layer.redraw();
                 }
             });
             // If no marker exists for some reason, add one
             let markerExists = false;
             mapRef.current.eachLayer((layer) => {
                 if (layer instanceof L.Marker) markerExists = true;
             });
             if (!markerExists) {
                 const marker = L.marker([location.lat, location.lng], { icon: defaultIcon }).addTo(mapRef.current);
                 marker.bindPopup(`<b>${eventName}</b><br>${venueName}`).openPopup();
             }
        }
      }

    }).catch(error => {
        console.error("Failed to load Leaflet", error);
        // Handle error appropriately, e.g., show a message to the user
        if (mapContainerRef.current) {
            mapContainerRef.current.innerHTML = '<p class="text-center text-destructive">Error loading map.</p>';
        }
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
      className="h-64 md:h-80 w-full rounded-lg border border-border shadow-inner bg-muted overflow-hidden" // Style the map container, add overflow hidden
      aria-label={`Map showing location for ${eventName} at ${venueName}`}
    >
       {/* Map will be rendered here by Leaflet */}
       <span className="sr-only">Interactive map showing event location. Map loading...</span>
       {/* Basic loading state */}
        <div className="flex items-center justify-center h-full text-muted-foreground leaflet-loading-placeholder">Loading map...</div>
        <style jsx>{`
            /* Hide placeholder once Leaflet map container is ready */
            .leaflet-container ~ .leaflet-loading-placeholder {
                display: none;
            }
        `}</style>
    </div>
  );
}
