
'use client';

import type { Location } from '@/services/event';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

// Import images directly. Ensure these are available.
// Note: Using .src is important for Next.js image imports
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import type L from 'leaflet'; // Import Leaflet type for ref

interface EventMapProps {
  location: Location;
  venueName: string;
  eventName: string;
}

export function EventMap({ location, venueName, eventName }: EventMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null); // To store map instance
  const LRef = useRef<typeof L | null>(null); // To store Leaflet static instance

  useEffect(() => {
    // Dynamically import Leaflet only on the client-side
    import('leaflet').then(leaflet => {
      LRef.current = leaflet; // Store Leaflet instance
      console.log('Leaflet loaded:', LRef.current);
       console.log('Icon URLs:', {
           iconUrl: iconUrl?.src,
           iconRetinaUrl: iconRetinaUrl?.src,
           shadowUrl: shadowUrl?.src,
       });


      if (mapContainerRef.current && LRef.current) {
        const L = LRef.current; // Use the stored Leaflet instance

        // --- Create the icon instance directly with required options ---
        const defaultIcon = L.icon({
            iconRetinaUrl: iconRetinaUrl.src,
            iconUrl: iconUrl.src,
            shadowUrl: shadowUrl.src,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            tooltipAnchor: [16, -28],
            shadowSize: [41, 41]
        });
        console.log('Created defaultIcon instance with options:', defaultIcon.options);

        // Check if icon URLs are valid strings
        if (!defaultIcon.options.iconUrl || !defaultIcon.options.iconRetinaUrl || !defaultIcon.options.shadowUrl) {
            console.error("Error: One or more icon URLs are missing or invalid after creation.", defaultIcon.options);
            if (mapContainerRef.current) {
                 mapContainerRef.current.innerHTML = '<p class="text-center text-destructive p-4">Error loading map: Invalid marker icon configuration.</p>';
            }
            return; // Prevent further execution if icon URLs are bad
        }


        // Initialize map only once or if it doesn't exist
        if (!mapRef.current && mapContainerRef.current.clientHeight > 0) { // Check if container has height
            console.log('Initializing map...');
            mapRef.current = L.map(mapContainerRef.current, {
                // Optional: Add preferCanvas: true if performance is an issue with many markers
                preferCanvas: true
            }).setView([location.lat, location.lng], 15); // Set initial view and zoom

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              // Optional: Add errorTileUrl for debugging tile loading
              // errorTileUrl: 'path/to/your/error/tile.png'
            }).addTo(mapRef.current);

            // Add error handling for tile layer
             mapRef.current.on('tileerror', function(error) {
                console.error('Tile loading error:', error);
             });

            // Create marker using the explicitly defined default icon instance
            console.log('Adding marker with explicitly created defaultIcon...');
            const marker = L.marker([location.lat, location.lng], { icon: defaultIcon }).addTo(mapRef.current);
            marker.bindPopup(`<b>${eventName}</b><br>${venueName}`).openPopup(); // Add popup to marker
            console.log('Map initialized and marker added.');

        } else if (mapRef.current) {
             // If map exists, update view and marker
             console.log('Updating existing map view and marker...');
             mapRef.current.setView([location.lat, location.lng], 15);

             let markerExists = false;
             mapRef.current.eachLayer((layer) => {
                 // Check if layer is a marker before casting
                 if (layer instanceof L.Marker) {
                    markerExists = true;
                    layer.setLatLng([location.lat, location.lng]);
                    layer.setIcon(defaultIcon); // Ensure correct icon on update
                    layer.bindPopup(`<b>${eventName}</b><br>${venueName}`).openPopup();
                    console.log('Existing marker updated.');
                 }
             });
             // If no marker exists (e.g., removed previously), add one
             if (!markerExists) {
                 console.log('No existing marker found, adding new one...');
                 const marker = L.marker([location.lat, location.lng], { icon: defaultIcon }).addTo(mapRef.current);
                 marker.bindPopup(`<b>${eventName}</b><br>${venueName}`).openPopup();
             }
             // Invalidate map size after potential container resizes or updates
             // Use requestAnimationFrame to ensure DOM is ready for resize calculation
             requestAnimationFrame(() => {
                 if (mapRef.current) {
                     mapRef.current.invalidateSize();
                     console.log('Map size invalidated.');
                 }
             });
        } else {
            console.warn('Map container not ready or has no height.');
        }
      } else {
        console.error('Map container ref or Leaflet instance not available.');
      }

    }).catch(error => {
        console.error("Failed to load Leaflet dynamically", error);
        if (mapContainerRef.current) {
            mapContainerRef.current.innerHTML = '<p class="text-center text-destructive p-4">Error loading map component.</p>';
        }
    });


    // Cleanup function to remove map on component unmount
    return () => {
      if (mapRef.current) {
        console.log('Removing map instance.');
        mapRef.current.remove();
        mapRef.current = null; // Clear reference
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.lat, location.lng, venueName, eventName]); // Dependencies explicitly listed

  return (
    <div
      ref={mapContainerRef}
      className="h-64 md:h-80 w-full rounded-lg border border-border shadow-inner bg-muted overflow-hidden relative" // Style the map container, add overflow hidden
      aria-label={`Map showing location for ${eventName} at ${venueName}`}
      style={{ minHeight: '200px' }} // Ensure minimum height
    >
       {/* Map will be rendered here by Leaflet */}
        {/* Improved Loading/Error State */}
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-muted/50 leaflet-loading-placeholder z-0">
            Loading map...
        </div>
        <style jsx>{`
            /* Hide placeholder once Leaflet map pane is ready */
            .leaflet-pane {
                z-index: 1; /* Ensure map pane is above placeholder */
            }
            .leaflet-pane ~ .leaflet-loading-placeholder {
                display: none;
            }
             /* Ensure Leaflet container takes up space */
            .leaflet-container {
                 background-color: hsl(var(--muted)); /* Match background */
            }
        `}</style>
    </div>
  );
}

