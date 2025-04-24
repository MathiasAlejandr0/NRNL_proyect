
import { v4 as uuidv4 } from 'uuid'; // Use uuid for unique IDs in mock data

/**
 * Represents a geographical location with latitude and longitude coordinates.
 */
export interface Location {
  lat: number;
  lng: number;
}

/**
 * Represents details of a music event.
 */
export interface MusicEvent {
  id: string;
  name: string;
  artist: string;
  artistBio?: string | null;
  venue: string;
  venueDetails?: string | null;
  lat: number;
  lng: number;
  dateTime: Date;
  ticketPrice?: number | null;
  ticketUrl?: string | null;
  description?: string | null;
  imageUrl: string;
  giveawayActive: boolean;
  giveawayEndDate?: Date | null;
  giveawayTickets?: number | null;
  // Additional fields for relationships (not used directly in mock data)
  createdAt: Date;
  updatedAt: Date;
}


/**
 * Represents a ticket held by a user.
 */
export interface UserTicket {
  ticketId: string;
  userId: string;
  eventId: string;
  eventName: string;
  venue: string;
  dateTime: Date; // Changed from eventDateTime
  type: 'purchased' | 'giveaway';
  qrCodeData: string;
  acquiredAt: Date;
}

/**
 * Represents a giveaway entry.
 */
export interface GiveawayEntry {
    entryId: string; // Changed from id
    userId: string;
    eventId: string;
    enteredAt: Date;
}

/**
 * Represents a giveaway win record.
 */
export interface GiveawayWin {
    winId: string; // Changed from id
    userId: string;
    eventId: string;
    eventName: string;
    wonAt: Date;
}


// --- Mock Data ---

// Use the newly defined MusicEvent interface for mock data structure
const mockEvents: MusicEvent[] = getMockEvents().map((eventData, index) => ({
  ...eventData,
  id: `mock-event-${index + 1}`, // Generate simple mock ID
  dateTime: new Date(eventData.dateTime), // Convert string date to Date object
  giveawayEndDate: eventData.giveawayEndDate ? new Date(eventData.giveawayEndDate) : null,
  // Add missing fields required by the interface
  createdAt: new Date(),
  updatedAt: new Date(),
}));

// In-memory stores for mock data simulation
let mockUserTickets: UserTicket[] = [];
let mockGiveawayEntries: GiveawayEntry[] = [];
let mockGiveawayWins: GiveawayWin[] = [];


// --- Service Functions (using mock data) ---

/**
 * Asynchronously retrieves music events from mock data.
 * TODO: Implement location-based filtering and pagination if needed.
 *
 * @param location Optional location filter (not implemented yet).
 * @returns A promise that resolves to an array of MusicEvent objects.
 */
export async function getMusicEvents(location?: Location): Promise<MusicEvent[]> {
    try {
        // Return a deep copy of mock events sorted by date
        const sortedEvents = [...mockEvents].sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
        return sortedEvents;
    } catch (error) {
        console.error("Error fetching mock music events: ", error);
        throw new Error("Could not fetch music events.");
    }
}

/**
 * Asynchronously retrieves a single music event by its ID from mock data.
 *
 * @param eventId The ID of the event to retrieve.
 * @returns A promise that resolves to the MusicEvent object or null if not found.
 */
export async function getMusicEventById(eventId: string): Promise<MusicEvent | null> {
   try {
        const event = mockEvents.find(e => e.id === eventId);
        return event || null;
    } catch (error) {
        console.error("Error fetching mock event by ID: ", error);
        throw new Error("Could not fetch event details.");
    }
}

/**
 * Asynchronously enters a user into a giveaway using mock data.
 * Checks if giveaway is active, not ended, and if user hasn't entered yet.
 *
 * @param userId The ID of the user entering the giveaway.
 * @param eventId The ID of the event giveaway being entered.
 * @returns A promise that resolves to true if entry was successful, false otherwise.
 */
export async function enterGiveaway(userId: string, eventId: string): Promise<boolean> {
    try {
        const event = mockEvents.find(e => e.id === eventId);
        if (!event || !event.giveawayActive) {
            console.error(`Giveaway not active or event not found for ${eventId}`);
            return false;
        }

        const now = new Date();
        if (event.giveawayEndDate && now > event.giveawayEndDate) {
            console.error(`Giveaway ended for ${eventId}`);
            return false;
        }

        // Check if user already entered
        if (mockGiveawayEntries.some(entry => entry.userId === userId && entry.eventId === eventId)) {
            console.warn(`User ${userId} already entered giveaway for ${eventId}`);
            return false;
        }

        // Add entry
        const newEntry: GiveawayEntry = {
            entryId: uuidv4(),
            userId: userId,
            eventId: eventId,
            enteredAt: new Date(),
        };
        mockGiveawayEntries.push(newEntry);
        console.log(`User ${userId} successfully entered mock giveaway for ${eventId}`);

        // Mock win determination (for testing)
        if (Math.random() < 0.3) {
            await markUserAsWinner(userId, eventId);
            console.log(`Mock Winner: User ${userId} marked as winner for ${eventId}.`);
        }

        return true;
    } catch (error) {
        console.error("Error entering mock giveaway: ", error);
        return false; // Indicate failure
    }
}

/**
 * Checks if a user has entered a specific giveaway using mock data.
 *
 * @param userId The ID of the user.
 * @param eventId The ID of the event giveaway.
 * @returns A promise that resolves to true if the user has entered, false otherwise.
 */
export async function hasUserEnteredGiveaway(userId: string, eventId: string): Promise<boolean> {
     try {
        const entry = mockGiveawayEntries.find(e => e.userId === userId && e.eventId === eventId);
        return !!entry; // Returns true if entry exists, false otherwise
    } catch (error) {
        console.error("Error checking mock giveaway entry status: ", error);
        return false;
    }
}

/**
 * Retrieves the IDs of events for which a user has won a giveaway from mock data.
 *
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of event IDs the user has won.
 */
export async function checkGiveawayWins(userId: string): Promise<string[]> {
    try {
        const wins = mockGiveawayWins.filter(win => win.userId === userId);
        const wonEventIds = wins.map(win => win.eventId);
        console.log(`User ${userId} found mock wins for events:`, wonEventIds);
        return wonEventIds;
    } catch (error) {
        console.error("Error checking mock giveaway wins: ", error);
        return [];
    }
}

/**
 * Marks a user as a winner for a specific event in mock data.
 * Also adds a corresponding ticket to the mock UserTicket array.
 *
 * @param userId The ID of the winning user.
 * @param eventId The ID of the event won.
 */
export async function markUserAsWinner(userId: string, eventId: string): Promise<void> {
    try {
        const event = mockEvents.find(e => e.id === eventId);
        if (!event) {
            console.error(`Cannot mark mock winner: Event ${eventId} not found.`);
            return;
        }

        // Check if already a winner
        if (mockGiveawayWins.some(w => w.userId === userId && w.eventId === eventId)) {
             console.warn(`User ${userId} already marked as mock winner for ${eventId}.`);
             // Ensure ticket exists if win exists
             if (!mockUserTickets.some(t => t.userId === userId && t.eventId === eventId && t.type === 'giveaway')) {
                // Add missing ticket
                 const ticketId = uuidv4();
                 const newTicket: UserTicket = {
                     ticketId: ticketId,
                     userId: userId,
                     eventId: event.id,
                     eventName: event.name,
                     venue: event.venue,
                     dateTime: event.dateTime,
                     type: 'giveaway',
                     qrCodeData: `GIVEAWAY-${userId}-${eventId}-${ticketId}`,
                     acquiredAt: new Date(),
                 };
                 mockUserTickets.push(newTicket);
                 console.log(`Added missing mock giveaway ticket ${ticketId} for user ${userId} event ${eventId}`);
             }
             return;
        }

        // 1. Add win record
        const newWin: GiveawayWin = {
            winId: uuidv4(),
            userId: userId,
            eventId: eventId,
            eventName: event.name,
            wonAt: new Date(),
        };
        mockGiveawayWins.push(newWin);
        console.log(`Marked user ${userId} as mock winner for event ${eventId}`);

        // 2. Add the giveaway ticket
         const ticketId = uuidv4();
         const newTicket: UserTicket = {
             ticketId: ticketId,
             userId: userId,
             eventId: event.id,
             eventName: event.name,
             venue: event.venue,
             dateTime: event.dateTime,
             type: 'giveaway',
             qrCodeData: `GIVEAWAY-${userId}-${eventId}-${ticketId}`,
             acquiredAt: new Date(),
         };
         mockUserTickets.push(newTicket);
         console.log(`Giveaway mock ticket ${ticketId} for event ${eventId} added to user ${userId}`);

    } catch (error) {
        console.error(`Error marking mock user ${userId} as winner for ${eventId}:`, error);
        throw error; // Re-throw
    }
}


/**
 * Simulates purchasing a ticket and adds it to the mock user's collection.
 *
 * @param userId The ID of the user purchasing the ticket.
 * @param eventId The ID of the event.
 * @returns A promise that resolves to the created UserTicket or null on failure.
 */
export async function purchaseTicket(userId: string, eventId: string): Promise<UserTicket | null> {
     try {
        const event = mockEvents.find(e => e.id === eventId);
        if (!event || event.ticketPrice === null || event.ticketPrice === undefined) {
            console.error(`Cannot purchase mock ticket for free or non-existent event ${eventId}`);
            return null;
        }

        // Simulate successful payment
        console.log(`Simulating purchase for user ${userId}, event ${eventId}`);

        // Add ticket to user's collection
        const ticketId = uuidv4();
        const newTicket: UserTicket = {
            ticketId: ticketId,
            userId: userId,
            eventId: event.id,
            eventName: event.name,
            venue: event.venue,
            dateTime: event.dateTime,
            type: 'purchased',
            qrCodeData: `PURCHASE-${userId}-${eventId}-${ticketId}`,
            acquiredAt: new Date(),
        };

        mockUserTickets.push(newTicket);
        console.log(`Purchased mock ticket ${ticketId} for event ${eventId} added to user ${userId}`);
        return newTicket;

    } catch (error) {
        console.error(`Error purchasing mock ticket for user ${userId}, event ${eventId}:`, error);
        return null;
    }
}


/**
 * Retrieves all tickets (purchased and won) for a specific user from mock data.
 *
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of UserTicket objects.
 */
export async function getUserTickets(userId: string): Promise<UserTicket[]> {
   try {
        const userTickets = mockUserTickets.filter(ticket => ticket.userId === userId);
        // Sort by event date descending
        userTickets.sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());

        console.log(`Retrieved ${userTickets.length} mock tickets for user ${userId}`);
        return userTickets;
    } catch (error) {
        console.error(`Error fetching mock tickets for user ${userId}:`, error);
        return [];
    }
}


// --- Mock Data Generation Function ---
// This function provides data in the basic structure for the mockEvents array above.
export function getMockEvents(): Array<Omit<MusicEvent, 'id' | 'createdAt' | 'updatedAt'> & { dateTime: string; giveawayEndDate?: string | null }> {
    return [
        {
            name: 'Warehouse Echoes',
            artist: 'Synth System',
            artistBio: 'Synth System is a pioneering duo known for their atmospheric techno soundscapes and driving rhythms. Formed in Berlin, they have played major festivals worldwide.',
            venue: 'The Steel Yard',
            venueDetails: '1 Industrial Way, Metro City. Capacity: 1500. Underground vibe, state-of-the-art sound system.',
            lat: 40.7128, // New York City approx
            lng: -74.0060,
            dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
            ticketPrice: 35.00,
            ticketUrl: '#', // Placeholder URL
            description: 'Experience the depths of techno with Synth System. A night of hypnotic beats and immersive visuals.',
            imageUrl: 'https://picsum.photos/seed/techno1/600/400',
            giveawayActive: true,
            giveawayEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
            giveawayTickets: 5,
          },
          {
            name: 'Neon Circuit',
            artist: 'Voltage Vixen',
            artistBio: 'Voltage Vixen electrifies crowds with her high-energy electro sets, blending classic sounds with futuristic bangers. A staple in the underground scene.',
            venue: 'Circuit Club',
            venueDetails: '25 Electric Ave, Metro City. Capacity: 800. Intimate venue with a focus on lighting and sound quality.',
            lat: 34.0522, // Los Angeles approx
            lng: -118.2437,
            dateTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
            ticketPrice: 28.00,
            ticketUrl: '#',
            description: 'Get charged up with Voltage Vixen! An unforgettable night of pure electro energy.',
            imageUrl: 'https://picsum.photos/seed/electro2/600/400',
            giveawayActive: false,
            giveawayEndDate: null,
            giveawayTickets: null,
          },
          {
            name: 'Groove Sanctuary',
            artist: 'Rhythm Ritualist',
            artistBio: 'Bringing soulful house vibes, Rhythm Ritualist creates uplifting sets that make you move. Feel-good music for feel-good people.',
            venue: 'The Loft',
            venueDetails: 'Penthouse, 100 Skyline Dr, Metro City. Capacity: 300. Rooftop venue with city views.',
            lat: 41.8781, // Chicago approx
            lng: -87.6298,
            dateTime: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 3 weeks from now
            ticketPrice: 40.00,
            ticketUrl: '#',
            description: 'Find your groove in the sanctuary. Uplifting house music all night long.',
            imageUrl: 'https://picsum.photos/seed/house3/600/400',
            giveawayActive: true,
            giveawayEndDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
            giveawayTickets: 2,
          },
           {
            name: 'Abyss',
            artist: 'Shadow Code',
            artistBio: 'Shadow Code delves into the darker, industrial side of techno. Expect relentless beats and an intense atmosphere.',
            venue: 'The Bunker',
            venueDetails: 'Basement, 50 Deep St, Metro City. Capacity: 500. Raw, industrial space.',
            lat: 51.5074, // London approx
            lng: -0.1278,
            dateTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
            ticketPrice: 30.00,
            ticketUrl: '#',
            description: 'Descend into the Abyss. A night of hard-hitting, dark techno.',
            imageUrl: 'https://picsum.photos/seed/darktechno4/600/400',
            giveawayActive: false,
            giveawayEndDate: null,
            giveawayTickets: null,
          },
          {
            name: 'Future Sound',
            artist: 'Data Flow',
            artistBio: 'Data Flow merges intricate sound design with progressive techno rhythms, creating a journey for the listener.',
            venue: 'The Hub',
            venueDetails: 'Central Tech Park, Building 7, Metro City. Capacity: 1000. Modern venue with advanced AV.',
            lat: 37.7749, // San Francisco approx
            lng: -122.4194,
            dateTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 1 month from now
            ticketPrice: null, // Free Event
            ticketUrl: '#',
            description: 'Explore the future sound of techno with Data Flow. Free entry!',
            imageUrl: 'https://picsum.photos/seed/future5/600/400',
            giveawayActive: false, // No giveaway for free events usually
            giveawayEndDate: null,
            giveawayTickets: null,
          },
          {
            name: 'Retro Wave Rave',
            artist: '8-Bit Beats',
            artistBio: '8-Bit Beats throws it back with chiptune-infused electro house. Nostalgia meets the dance floor.',
            venue: 'Arcade Palace',
            venueDetails: '1984 Gamer St, Metro City. Capacity: 600. Retro arcade theme.',
            lat: 35.6895, // Tokyo approx
            lng: 139.6917,
            dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
            ticketPrice: 25.00,
            ticketUrl: '#',
            description: 'Power up! A retro wave rave featuring 8-Bit Beats.',
            imageUrl: 'https://picsum.photos/seed/retro6/600/400',
            giveawayActive: true,
            giveawayEndDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
            giveawayTickets: 10,
          },
           // Past event for testing filtering
            {
                name: 'Forgotten Frequency',
                artist: 'Lost Signal',
                artistBio: 'Lost Signal played a legendary set last month.',
                venue: 'The Void',
                venueDetails: 'Now closed.',
                lat: 0,
                lng: 0,
                dateTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 1 month ago
                ticketPrice: 20.00,
                ticketUrl: '#',
                description: 'An event from the past.',
                imageUrl: 'https://picsum.photos/seed/past7/600/400',
                giveawayActive: false,
                giveawayEndDate: null,
                giveawayTickets: null,
            },
    ];
}
