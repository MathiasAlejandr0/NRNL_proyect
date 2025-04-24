
import { db } from '@/lib/firebase/config';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    setDoc,
    query,
    where,
    Timestamp,
    serverTimestamp,
    deleteDoc, // Import deleteDoc
    writeBatch, // Import writeBatch for atomic deletes
} from 'firebase/firestore';

/**
 * Represents a geographical location with latitude and longitude coordinates.
 */
export interface Location {
  lat: number;
  lng: number;
}

/**
 * Represents details of a music event stored in Firestore.
 * Uses Firestore Timestamps for date fields.
 */
export interface MusicEvent {
  id: string; // Document ID from Firestore
  name: string;
  artist: string;
  artistBio: string;
  venue: string;
  venueDetails: string;
  location: Location;
  dateTime: Timestamp; // Use Firestore Timestamp
  ticketPrice: number | null;
  ticketUrl: string;
  description: string;
  imageUrl: string;
  giveawayActive: boolean;
  giveawayEndDate?: Timestamp; // Optional Firestore Timestamp
  giveawayTickets?: number;
  // creatorId?: string; // Optional: Link event to a creator (producer)
  createdAt: Timestamp; // Track creation time
}

/**
 * Represents a ticket held by a user (subcollection).
 */
export interface UserTicket {
  ticketId: string; // Document ID
  eventId: string;
  eventName: string;
  venue: string;
  dateTime: Timestamp; // Store event time for easy display
  type: 'purchased' | 'giveaway';
  qrCodeData: string; // Placeholder
  acquiredAt: Timestamp; // When the ticket was acquired
}

/**
 * Represents a giveaway entry (subcollection).
 */
export interface GiveawayEntry {
    entryId: string; // Document ID
    eventId: string;
    userId: string;
    enteredAt: Timestamp;
}

// --- Firestore Collection References ---
const eventsCollection = collection(db, 'events');
const getUserTicketsCollection = (userId: string) => collection(db, 'users', userId, 'tickets');
const getEventGiveawayEntriesCollection = (eventId: string) => collection(db, 'events', eventId, 'giveawayEntries');
const getUserGiveawayWinsCollection = (userId: string) => collection(db, 'users', userId, 'giveawayWins'); // To store won event IDs

// --- Helper Functions ---

/** Converts a Firestore document snapshot to a MusicEvent object. */
const snapshotToMusicEvent = (snapshot: any): MusicEvent => {
    const data = snapshot.data();
    return {
        id: snapshot.id,
        ...data,
        // Ensure Timestamps are correctly handled (they usually are by default)
        dateTime: data.dateTime,
        giveawayEndDate: data.giveawayEndDate,
        createdAt: data.createdAt,
    } as MusicEvent;
};

/** Converts a Firestore document snapshot to a UserTicket object. */
const snapshotToUserTicket = (snapshot: any): UserTicket => {
    const data = snapshot.data();
    return {
        ticketId: snapshot.id,
        ...data,
        dateTime: data.dateTime,
        acquiredAt: data.acquiredAt,
    } as UserTicket;
};


// --- Service Functions ---

/**
 * Seeds the database with initial mock event data if it's empty.
 */
export async function seedInitialEvents() {
    const eventsSnapshot = await getDocs(eventsCollection);
    if (eventsSnapshot.empty) {
        console.log('No events found in Firestore, seeding initial data...');
        const mockEventsData = getMockEvents(); // Get raw mock data
        const batch = writeBatch(db);

        mockEventsData.forEach(eventData => {
            const newEventRef = doc(eventsCollection); // Generate new ID automatically
            const eventWithTimestamps = {
                ...eventData,
                dateTime: Timestamp.fromDate(new Date(eventData.dateTime)),
                giveawayEndDate: eventData.giveawayEndDate ? Timestamp.fromDate(new Date(eventData.giveawayEndDate)) : undefined,
                createdAt: serverTimestamp(), // Use server timestamp for creation
            };
            delete (eventWithTimestamps as any).id; // Remove the mock ID
            batch.set(newEventRef, eventWithTimestamps);
        });

        try {
            await batch.commit();
            console.log('Successfully seeded initial events.');
        } catch (error) {
            console.error('Error seeding initial events:', error);
        }
    } else {
        console.log('Events collection already contains data, skipping seeding.');
    }
}


/**
 * Asynchronously retrieves music events from Firestore.
 * TODO: Implement location-based filtering and pagination.
 *
 * @returns A promise that resolves to an array of MusicEvent objects.
 */
export async function getMusicEvents(location?: Location): Promise<MusicEvent[]> {
    try {
        // TODO: Add location filtering (Geoqueries) and pagination later
        await seedInitialEventsIfNeeded(); // Ensure data exists
        const querySnapshot = await getDocs(eventsCollection);
        const events = querySnapshot.docs.map(snapshotToMusicEvent);
         // Sort events by date (soonest first) client-side for now
         events.sort((a, b) => a.dateTime.toMillis() - b.dateTime.toMillis());
        return events;
    } catch (error) {
        console.error("Error fetching music events: ", error);
        throw new Error("Could not fetch music events.");
    }
}

/**
 * Asynchronously retrieves a single music event by its ID from Firestore.
 *
 * @param eventId The ID of the event to retrieve.
 * @returns A promise that resolves to the MusicEvent object or undefined if not found.
 */
export async function getMusicEventById(eventId: string): Promise<MusicEvent | undefined> {
   try {
        await seedInitialEventsIfNeeded(); // Ensure data exists
        const eventRef = doc(db, 'events', eventId);
        const eventSnap = await getDoc(eventRef);

        if (eventSnap.exists()) {
            return snapshotToMusicEvent(eventSnap);
        } else {
            console.log(`Event with ID ${eventId} not found.`);
            return undefined;
        }
    } catch (error) {
        console.error("Error fetching event by ID: ", error);
        throw new Error("Could not fetch event details.");
    }
}

/**
 * Asynchronously enters a user into a giveaway in Firestore.
 * Checks if giveaway is active, not ended, and if user hasn't entered yet.
 *
 * @param userId The ID of the user entering the giveaway.
 * @param eventId The ID of the event giveaway being entered.
 * @returns A promise that resolves to true if entry was successful, false otherwise.
 */
export async function enterGiveaway(userId: string, eventId: string): Promise<boolean> {
    try {
        const event = await getMusicEventById(eventId);
        if (!event || !event.giveawayActive) {
            console.error(`Giveaway not active or event not found for ${eventId}`);
            return false;
        }

        const now = Timestamp.now();
        if (event.giveawayEndDate && now > event.giveawayEndDate) {
            console.error(`Giveaway ended for ${eventId}`);
            return false;
        }

        // Check if user already entered
        const entriesCollection = getEventGiveawayEntriesCollection(eventId);
        const q = query(entriesCollection, where('userId', '==', userId));
        const existingEntrySnapshot = await getDocs(q);

        if (!existingEntrySnapshot.empty) {
             console.warn(`User ${userId} already entered giveaway for ${eventId}`);
             return false; // Already entered
        }

        // Add entry
        const newEntryRef = doc(entriesCollection); // Auto-generate ID
        await setDoc(newEntryRef, {
            eventId: eventId,
            userId: userId,
            enteredAt: serverTimestamp(),
        });

        console.log(`User ${userId} successfully entered giveaway for ${eventId}`);

        // Mock win determination (for testing - REMOVE IN PRODUCTION)
        // This should be a separate backend process
        if (Math.random() < 0.3) { // 30% chance to "win" instantly for testing
             await markUserAsWinner(userId, eventId);
             console.log(`Mock Winner: User ${userId} marked as winner for ${eventId}.`);
        }

        return true;
    } catch (error) {
        console.error("Error entering giveaway: ", error);
        // Consider throwing error for more specific handling in component
        return false; // Indicate failure
    }
}

/**
 * Checks if a user has entered a specific giveaway in Firestore.
 *
 * @param userId The ID of the user.
 * @param eventId The ID of the event giveaway.
 * @returns A promise that resolves to true if the user has entered, false otherwise.
 */
export async function hasUserEnteredGiveaway(userId: string, eventId: string): Promise<boolean> {
     try {
        const entriesCollection = getEventGiveawayEntriesCollection(eventId);
        const q = query(entriesCollection, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error("Error checking giveaway entry status: ", error);
        // Default to false on error to prevent accidental multiple entries UI
        return false;
    }
}

/**
 * Retrieves the IDs of events for which a user has won a giveaway.
 * In a real app, this would be triggered by a secure backend process after drawing winners.
 * This mock function reads from a dedicated user subcollection.
 *
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of event IDs the user has won.
 */
export async function checkGiveawayWins(userId: string): Promise<string[]> {
    try {
        const winsCollection = getUserGiveawayWinsCollection(userId);
        const winsSnapshot = await getDocs(winsCollection);
        // The document ID in this subcollection IS the won event ID
        const wonEventIds = winsSnapshot.docs.map(doc => doc.id);
        console.log(`User ${userId} found wins for events:`, wonEventIds);
        return wonEventIds;
    } catch (error) {
        console.error("Error checking giveaway wins: ", error);
        return []; // Return empty array on error
    }
}

/**
 * Mock/Helper function to simulate marking a user as a winner.
 * In a real app, this logic belongs in a secure backend function.
 * Adds the event ID to the user's `giveawayWins` subcollection.
 *
 * @param userId The ID of the winning user.
 * @param eventId The ID of the event won.
 */
export async function markUserAsWinner(userId: string, eventId: string): Promise<void> {
    try {
        const winRef = doc(db, 'users', userId, 'giveawayWins', eventId);
        // Store minimal data, or perhaps details about the win if needed
        await setDoc(winRef, {
            wonAt: serverTimestamp(),
        });
        console.log(`Marked user ${userId} as winner for event ${eventId}`);

        // Also automatically add a giveaway ticket to their collection
        await addGiveawayTicketToUser(userId, eventId);

    } catch (error) {
        console.error(`Error marking user ${userId} as winner for ${eventId}:`, error);
    }
}

/**
 * Adds a giveaway ticket to the user's ticket collection.
 * Typically called after a user is confirmed as a winner.
 *
 * @param userId The ID of the user.
 * @param eventId The ID of the event.
 */
export async function addGiveawayTicketToUser(userId: string, eventId: string): Promise<void> {
    try {
        const event = await getMusicEventById(eventId);
        if (!event) {
            console.error(`Cannot add ticket: Event ${eventId} not found.`);
            return;
        }

        const ticketsCollection = getUserTicketsCollection(userId);
        const newTicketRef = doc(ticketsCollection); // Auto-generate ticket ID

        const newTicket: Omit<UserTicket, 'ticketId'> = { // Exclude ticketId as it's the doc ID
            eventId: event.id,
            eventName: event.name,
            venue: event.venue,
            dateTime: event.dateTime, // Store event time
            type: 'giveaway',
            qrCodeData: `GIVEAWAY-${userId}-${eventId}-${newTicketRef.id}`, // Mock QR data
            acquiredAt: serverTimestamp(),
        };

        await setDoc(newTicketRef, newTicket);
        console.log(`Giveaway ticket for event ${eventId} added to user ${userId}`);

    } catch (error) {
        console.error(`Error adding giveaway ticket for user ${userId}, event ${eventId}:`, error);
    }
}


/**
 * Simulates purchasing a ticket and adds it to the user's collection.
 * In a real app, this would follow successful payment processing.
 *
 * @param userId The ID of the user purchasing the ticket.
 * @param eventId The ID of the event.
 * @returns A promise that resolves to true if the ticket was successfully added.
 */
export async function purchaseTicket(userId: string, eventId: string): Promise<boolean> {
     try {
        const event = await getMusicEventById(eventId);
        if (!event || event.ticketPrice === null) {
            console.error(`Cannot purchase ticket for free or non-existent event ${eventId}`);
            return false;
        }

        // TODO: Integrate actual payment gateway logic here

        // If payment successful, add ticket to user's collection
        const ticketsCollection = getUserTicketsCollection(userId);
        const newTicketRef = doc(ticketsCollection); // Auto-generate ticket ID

        const newTicket: Omit<UserTicket, 'ticketId'> = {
            eventId: event.id,
            eventName: event.name,
            venue: event.venue,
            dateTime: event.dateTime, // Store event time
            type: 'purchased',
            qrCodeData: `PURCHASE-${userId}-${eventId}-${newTicketRef.id}`, // Mock QR data
            acquiredAt: serverTimestamp(),
        };

        await setDoc(newTicketRef, newTicket);
        console.log(`Purchased ticket for event ${eventId} added to user ${userId}`);
        return true;

    } catch (error) {
        console.error(`Error purchasing ticket for user ${userId}, event ${eventId}:`, error);
        return false;
    }
}


/**
 * Retrieves all tickets (purchased and won) for a specific user from Firestore.
 *
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of UserTicket objects.
 */
export async function getUserTickets(userId: string): Promise<UserTicket[]> {
   try {
        const ticketsCollection = getUserTicketsCollection(userId);
        const ticketsSnapshot = await getDocs(ticketsCollection);
        const tickets = ticketsSnapshot.docs.map(snapshotToUserTicket);

        // Sort tickets by event date (most recent first)
        tickets.sort((a, b) => b.dateTime.toMillis() - a.dateTime.toMillis());

        console.log(`Retrieved ${tickets.length} tickets for user ${userId}`);
        return tickets;
    } catch (error) {
        console.error(`Error fetching tickets for user ${userId}:`, error);
        return []; // Return empty array on error
    }
}


// --- Mock Data Generation (Keep for Seeding/Testing) ---

function getMockEvents(): Omit<MusicEvent, 'id' | 'createdAt' | 'dateTime' | 'giveawayEndDate'> & { dateTime: string; giveawayEndDate?: string }[] {
    // Returns the raw mock data structure with string dates
    return [
        {
            name: 'Warehouse Echoes',
            artist: 'Synth System',
            artistBio: 'Synth System is a pioneering duo known for their atmospheric techno soundscapes and driving rhythms. Formed in Berlin, they have played major festivals worldwide.',
            venue: 'The Steel Yard',
            venueDetails: '1 Industrial Way, Metro City. Capacity: 1500. Underground vibe, state-of-the-art sound system.',
            location: { lat: 40.7128, lng: -74.0060 },
            dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            ticketPrice: 35,
            ticketUrl: '#',
            description: 'Experience the depths of techno with Synth System. A night of hypnotic beats and immersive visuals.',
            imageUrl: 'https://picsum.photos/seed/techno1/600/400',
            giveawayActive: true,
            giveawayEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            giveawayTickets: 5,
          },
          {
            name: 'Neon Circuit',
            artist: 'Voltage Vixen',
            artistBio: 'Voltage Vixen electrifies crowds with her high-energy electro sets, blending classic sounds with futuristic bangers. A staple in the underground scene.',
            venue: 'Circuit Club',
            venueDetails: '25 Electric Ave, Metro City. Capacity: 800. Intimate venue with a focus on lighting and sound quality.',
            location: { lat: 40.7580, lng: -73.9855 },
            dateTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            ticketPrice: 28,
            ticketUrl: '#',
            description: 'Get charged up with Voltage Vixen! An unforgettable night of pure electro energy.',
            imageUrl: 'https://picsum.photos/seed/electro2/600/400',
            giveawayActive: false,
          },
          {
            name: 'Groove Sanctuary',
            artist: 'Rhythm Ritualist',
            artistBio: 'Bringing soulful house vibes, Rhythm Ritualist creates uplifting sets that make you move. Feel-good music for feel-good people.',
            venue: 'The Loft',
            venueDetails: 'Penthouse, 100 Skyline Dr, Metro City. Capacity: 300. Rooftop venue with city views.',
            location: { lat: 40.748817, lng: -73.985428 },
            dateTime: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
            ticketPrice: 40,
            ticketUrl: '#',
            description: 'Find your groove in the sanctuary. Uplifting house music all night long.',
            imageUrl: 'https://picsum.photos/seed/house3/600/400',
            giveawayActive: true,
            giveawayEndDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            giveawayTickets: 2,
          },
           {
            name: 'Abyss',
            artist: 'Shadow Code',
            artistBio: 'Shadow Code delves into the darker, industrial side of techno. Expect relentless beats and an intense atmosphere.',
            venue: 'The Bunker',
            venueDetails: 'Basement, 50 Deep St, Metro City. Capacity: 500. Raw, industrial space.',
            location: { lat: 40.7128, lng: -74.0060 },
            dateTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            ticketPrice: 30,
            ticketUrl: '#',
            description: 'Descend into the Abyss. A night of hard-hitting, dark techno.',
            imageUrl: 'https://picsum.photos/seed/darktechno4/600/400',
            giveawayActive: false,
          },
    ];
}

// Flag to ensure seeding only happens once per app lifecycle/server start
let hasSeeded = false;

async function seedInitialEventsIfNeeded() {
    if (!hasSeeded) {
        await seedInitialEvents();
        hasSeeded = true;
    }
}

// Initialize seeding check when module loads (optional, ensures seeding happens early)
// seedInitialEventsIfNeeded();
