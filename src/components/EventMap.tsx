
'use client';

import type { Location } from '@/services/event';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

// Import images directly. Ensure these are available.
// Note: Using .src is important for Next.js image imports
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

      if (mapContainerRef.current && LRef.current) {
        const L = LRef.current; // Use the stored Leaflet instance

        // Create a reusable icon instance with explicit paths and options
        // This is the crucial fix for the iconUrl error
        const defaultIcon = L.icon({
            iconUrl: iconUrl.src,
            iconRetinaUrl: iconRetinaUrl.src,
            shadowUrl: shadowUrl.src,
            iconSize: [25, 41], // Default size
            iconAnchor: [12, 41], // Default anchor
            popupAnchor: [1, -34], // Default popup anchor
            shadowSize: [41, 41] // Default shadow size
        });

        // Initialize map only once or if it doesn't exist
        if (!mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current).setView([location.lat, location.lng], 15); // Set initial view and zoom

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapRef.current);

            // Create marker using the explicitly defined icon
            const marker = L.marker([location.lat, location.lng], { icon: defaultIcon }).addTo(mapRef.current);
            marker.bindPopup(`<b>${eventName}</b><br>${venueName}`).openPopup(); // Add popup to marker

        } else {
             // If map exists, just update view and marker position/popup
             mapRef.current.setView([location.lat, location.lng], 15);

             let markerExists = false;
             mapRef.current.eachLayer((layer) => {
                 if (layer instanceof L.Marker) {
                    markerExists = true;
                    layer.setLatLng([location.lat, location.lng]);
                    // Ensure marker uses the correctly configured icon
                    layer.setIcon(defaultIcon);
                    layer.bindPopup(`<b>${eventName}</b><br>${venueName}`).openPopup();
                 }
             });
             // If no marker exists for some reason (e.g., removed), add one
             if (!markerExists) {
                 const marker = L.marker([location.lat, location.lng], { icon: defaultIcon }).addTo(mapRef.current);
                 marker.bindPopup(`<b>${eventName}</b><br>${venueName}`).openPopup();
             }
        }
      }

    }).catch(error => {
        console.error("Failed to load Leaflet", error);
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
