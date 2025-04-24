
'use client';

import { MapPin } from 'lucide-react';

// Removed props as the map is now static
// interface EventMapProps {
//   location: Location;
//   venueName: string;
//   eventName: string;
// }

export function EventMap(/* { location, venueName, eventName }: EventMapProps */) {
  // Removed Leaflet logic and refs

  // Coordinates for Puerto Montt, Chile (approximate)
  const puertoMonttLat = -41.4693;
  const puertoMonttLng = -72.9429;

  return (
    <div
      className="h-64 md:h-80 w-full rounded-lg border border-border shadow-inner bg-muted overflow-hidden relative flex flex-col items-center justify-center p-4 text-center" // Style the map container
      aria-label={`Static map placeholder showing general area of Puerto Montt, Chile`}
      style={{ minHeight: '200px' }} // Ensure minimum height
    >
      <MapPin className="w-12 h-12 text-primary mb-4" />
      <h4 className="text-lg font-semibold text-foreground">Event Location Area</h4>
      <p className="text-muted-foreground">
         Puerto Montt, Chile
      </p>
       <p className="text-xs text-muted-foreground mt-2">
         (Static map view)
       </p>
      {/* Placeholder for a future static map image if needed */}
      {/* <Image src={`your_static_map_image_url`} alt="Static map of Puerto Montt" layout="fill" objectFit="cover" /> */}
       {/* Link to open map externally */}
       <a
           href={`https://www.google.com/maps/search/?api=1&query=${puertoMonttLat},${puertoMonttLng}`}
           target="_blank"
           rel="noopener noreferrer"
           className="text-sm text-primary hover:underline mt-4 inline-block"
       >
           Open Location Area in Google Maps
       </a>
    </div>
  );
}
