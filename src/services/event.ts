/**
 * Represents a geographical location with latitude and longitude coordinates.
 */
export interface Location {
  /**
   * The latitude of the location.
   */
  lat: number;
  /**
   * The longitude of the location.
   */
  lng: number;
}

/**
 * Represents details of a music event.
 */
export interface MusicEvent {
  /**
   * Unique identifier for the event.
   */
  id: string;
  /**
   * The name of the event.
   */
  name: string;
  /**
   * The name of the artist or lineup.
   */
  artist: string;
  /**
   * Detailed biography or information about the artist(s).
   */
  artistBio: string;
  /**
   * The venue name where the event takes place.
   */
  venue: string;
  /**
   * Details about the venue (address, capacity, etc.).
   */
  venueDetails: string;
   /**
   * Location coordinates of the venue.
   */
  location: Location;
  /**
   * The date and time of the event in ISO 8601 format.
   */
  dateTime: string;
  /**
   * The price of the ticket. Use 0 or null if free.
   */
  ticketPrice: number | null;
  /**
   * URL to purchase tickets.
   */
  ticketUrl: string;
  /**
   * A description of the event.
   */
  description: string;
  /**
   * URL for the event's cover image.
   */
  imageUrl: string;
  /**
   * Indicates if a ticket giveaway is currently active for this event.
   */
  giveawayActive: boolean;
  /**
   * The end date and time for the giveaway entry in ISO 8601 format.
   */
  giveawayEndDate?: string;
  /**
   * Number of tickets available in the giveaway.
   */
  giveawayTickets?: number;
}

// Mock data store
const mockEvents: MusicEvent[] = [
  {
    id: 'techno-fest-01',
    name: 'Warehouse Echoes',
    artist: 'Synth System',
    artistBio: 'Synth System is a pioneering duo known for their atmospheric techno soundscapes and driving rhythms. Formed in Berlin, they have played major festivals worldwide.',
    venue: 'The Steel Yard',
    venueDetails: '1 Industrial Way, Metro City. Capacity: 1500. Underground vibe, state-of-the-art sound system.',
    location: { lat: 40.7128, lng: -74.0060 }, // Example: NYC
    dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
    ticketPrice: 35,
    ticketUrl: '#',
    description: 'Experience the depths of techno with Synth System. A night of hypnotic beats and immersive visuals.',
    imageUrl: 'https://picsum.photos/seed/techno1/600/400',
    giveawayActive: true,
    giveawayEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    giveawayTickets: 5,
  },
  {
    id: 'electro-night-02',
    name: 'Neon Circuit',
    artist: 'Voltage Vixen',
    artistBio: 'Voltage Vixen electrifies crowds with her high-energy electro sets, blending classic sounds with futuristic bangers. A staple in the underground scene.',
    venue: 'Circuit Club',
    venueDetails: '25 Electric Ave, Metro City. Capacity: 800. Intimate venue with a focus on lighting and sound quality.',
    location: { lat: 40.7580, lng: -73.9855 }, // Example: Near Times Square
    dateTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
    ticketPrice: 28,
    ticketUrl: '#',
    description: 'Get charged up with Voltage Vixen! An unforgettable night of pure electro energy.',
    imageUrl: 'https://picsum.photos/seed/electro2/600/400',
    giveawayActive: false,
  },
  {
    id: 'house-party-03',
    name: 'Groove Sanctuary',
    artist: 'Rhythm Ritualist',
    artistBio: 'Bringing soulful house vibes, Rhythm Ritualist creates uplifting sets that make you move. Feel-good music for feel-good people.',
    venue: 'The Loft',
    venueDetails: 'Penthouse, 100 Skyline Dr, Metro City. Capacity: 300. Rooftop venue with city views.',
    location: { lat: 40.748817, lng: -73.985428 }, // Example: Near Empire State Building
    dateTime: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 3 weeks from now
    ticketPrice: 40,
    ticketUrl: '#',
    description: 'Find your groove in the sanctuary. Uplifting house music all night long.',
    imageUrl: 'https://picsum.photos/seed/house3/600/400',
    giveawayActive: true,
    giveawayEndDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    giveawayTickets: 2,
  },
   {
    id: 'dark-techno-04',
    name: 'Abyss',
    artist: 'Shadow Code',
    artistBio: 'Shadow Code delves into the darker, industrial side of techno. Expect relentless beats and an intense atmosphere.',
    venue: 'The Bunker',
    venueDetails: 'Basement, 50 Deep St, Metro City. Capacity: 500. Raw, industrial space.',
    location: { lat: 40.7128, lng: -74.0060 }, // Example: NYC
    dateTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    ticketPrice: 30,
    ticketUrl: '#',
    description: 'Descend into the Abyss. A night of hard-hitting, dark techno.',
    imageUrl: 'https://picsum.photos/seed/darktechno4/600/400',
    giveawayActive: false,
  },
];

// Mock user giveaway entries (replace with actual user state/DB later)
const userGiveawayEntries = new Set<string>(); // Stores event IDs the user entered

/**
 * Asynchronously retrieves music events, optionally filtering by location.
 * In a real app, this would filter based on proximity to the provided location.
 * For now, it returns all mock events.
 *
 * @param location The location for which to retrieve music events (currently unused in mock).
 * @returns A promise that resolves to an array of MusicEvent objects.
 */
export async function getMusicEvents(location?: Location): Promise<MusicEvent[]> {
  // TODO: Implement actual location-based filtering by calling an API or querying a database.
  // For now, just return the mock data. Add a small delay to simulate network request.
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return mockEvents;
}

/**
 * Asynchronously retrieves a single music event by its ID.
 *
 * @param eventId The ID of the event to retrieve.
 * @returns A promise that resolves to the MusicEvent object or undefined if not found.
 */
export async function getMusicEventById(eventId: string): Promise<MusicEvent | undefined> {
  // TODO: Implement actual fetching by ID from an API or database.
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  return mockEvents.find(event => event.id === eventId);
}

/**
 * Asynchronously simulates entering a user into a giveaway.
 * In a real app, this would record the entry in a database associated with the user.
 *
 * @param userId The ID of the user entering the giveaway.
 * @param eventId The ID of the event giveaway being entered.
 * @returns A promise that resolves to true if entry was successful, false otherwise (e.g., already entered, giveaway closed).
 */
export async function enterGiveaway(userId: string, eventId: string): Promise<boolean> {
    // TODO: Implement actual giveaway entry logic (check dates, user limits, record entry).
    await new Promise(resolve => setTimeout(resolve, 400)); // Simulate network/DB operation

    const event = await getMusicEventById(eventId);
    if (!event || !event.giveawayActive) {
        console.error(`Giveaway not active or event not found for ${eventId}`);
        return false; // Giveaway not active or event doesn't exist
    }

    const now = new Date();
    const endDate = event.giveawayEndDate ? new Date(event.giveawayEndDate) : null;

    if (endDate && now > endDate) {
        console.error(`Giveaway ended for ${eventId}`);
        return false; // Giveaway has ended
    }

    // Check if user already entered (using simple mock set)
    const entryKey = `${userId}-${eventId}`;
    if (userGiveawayEntries.has(entryKey)) {
       console.warn(`User ${userId} already entered giveaway for ${eventId}`);
       return false; // Already entered
    }

    // Simulate successful entry
    userGiveawayEntries.add(entryKey);
    console.log(`User ${userId} successfully entered giveaway for ${eventId}`);
    return true;
}

/**
 * Checks if a user has entered a specific giveaway.
 * In a real app, this would query the database.
 *
 * @param userId The ID of the user.
 * @param eventId The ID of the event giveaway.
 * @returns A promise that resolves to true if the user has entered, false otherwise.
 */
export async function hasUserEnteredGiveaway(userId: string, eventId: string): Promise<boolean> {
    // TODO: Implement actual check against user's entries in a database.
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate quick check
    const entryKey = `${userId}-${eventId}`;
    return userGiveawayEntries.has(entryKey);
}

/**
 * Simulates checking for giveaway wins for a user.
 * In a real app, this would check a notifications or wins table.
 *
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of event IDs the user has won (mock implementation).
 */
export async function checkGiveawayWins(userId: string): Promise<string[]> {
    // TODO: Implement actual win checking logic.
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network delay

    // Mock logic: Randomly decide if the user won the first giveaway they entered (if any)
    const entries = Array.from(userGiveawayEntries)
                        .filter(key => key.startsWith(`${userId}-`))
                        .map(key => key.split('-')[1]);

    if (entries.length > 0 && Math.random() > 0.7) { // 30% chance to "win" the first entered event
       console.log(`User ${userId} "won" giveaway for event ${entries[0]}`);
       return [entries[0]];
    }

    return []; // No wins found
}
