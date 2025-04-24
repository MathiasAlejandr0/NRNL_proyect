
'use client';

import type { Location } from '@/services/event';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import L from 'leaflet'; // Import Leaflet dynamically on client

// Default Leaflet icon paths might break in Next.js, so we fix them
// You might need to copy icon images to your public folder
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet's default icon paths
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: iconRetinaUrl.src,
        iconUrl: iconUrl.src,
        shadowUrl: shadowUrl.src,
    });
}

interface EventMapProps {
  location: Location;
  venueName: string;
  eventName: string;
}

export function EventMap({ location, venueName, eventName }: EventMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null); // To store map instance

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) { // Initialize map only once
      const map = L.map(mapContainerRef.current).setView([location.lat, location.lng], 15); // Set initial view and zoom

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      const marker = L.marker([location.lat, location.lng]).addTo(map);
      marker.bindPopup(`<b>${eventName}</b><br>${venueName}`).openPopup(); // Add popup to marker

      mapRef.current = map; // Store map instance
    } else if (mapRef.current) {
        // Optional: Update map view if location changes dynamically
        mapRef.current.setView([location.lat, location.lng], 15);
        // Optional: Update marker position if needed
        const markerLayer = mapRef.current.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
               layer.setLatLng([location.lat, location.lng]);
               layer.bindPopup(`<b>${eventName}</b><br>${venueName}`).openPopup();
            }
        });
    }


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
       <span className="sr-only">Interactive map showing event location.</span>
    </div>
  );
}

    