
import { prisma } from '@/lib/prisma'; // Use Prisma client
import type { MusicEvent as PrismaMusicEvent, UserTicket as PrismaUserTicket, GiveawayEntry as PrismaGiveawayEntry, GiveawayWin as PrismaGiveawayWin } from '@prisma/client';
import { Prisma } from '@prisma/client';

/**
 * Represents a geographical location with latitude and longitude coordinates.
 * Kept for internal use within components, Prisma returns lat/lng directly.
 */
export interface Location {
  lat: number;
  lng: number;
}

/**
 * Represents details of a music event. Directly uses Prisma model structure.
 * No separate application interface needed as Prisma model is sufficient.
 */
export type MusicEvent = PrismaMusicEvent;

/**
 * Represents a ticket held by a user. Adapts Prisma model slightly for easier use.
 */
export interface UserTicket extends Omit<PrismaUserTicket, 'id' | 'eventDateTime'> {
  ticketId: string; // Use 'id' from Prisma model
  dateTime: Date; // Use 'eventDateTime' from Prisma model
  acquiredAt: Date;
}

/**
 * Represents a giveaway entry. Adapts Prisma model slightly.
 */
export interface GiveawayEntry extends Omit<PrismaGiveawayEntry, 'id'> {
    entryId: string; // Use 'id' from Prisma model
    enteredAt: Date;
}


// --- Helper Functions ---

// No longer needed: prismaToMusicEvent, as we use the Prisma type directly.

/** Converts a Prisma UserTicket object to the application's UserTicket interface. */
const prismaToUserTicket = (prismaTicket: PrismaUserTicket): UserTicket => {
    // Destructure id and eventDateTime, include the rest
    const { id, eventDateTime, ...rest } = prismaTicket;
    return {
        ...rest, // Spread remaining fields
        ticketId: id, // Map id to ticketId
        dateTime: eventDateTime, // Map eventDateTime to dateTime
        // acquiredAt is already a Date
    };
};


// --- Service Functions ---

// Seeding check removed, should be done via `prisma db seed`

/**
 * Asynchronously retrieves music events from Prisma.
 * TODO: Implement location-based filtering and pagination.
 *
 * @param location Optional location filter (not implemented yet).
 * @returns A promise that resolves to an array of MusicEvent objects (Prisma type).
 */
export async function getMusicEvents(location?: Location): Promise<MusicEvent[]> {
    try {
        // Removed seed check
        const prismaEvents = await prisma.musicEvent.findMany({
            orderBy: {
                dateTime: 'asc', // Order by date ascending
            },
            // TODO: Add where clause for location filtering if needed
        });
        // Return Prisma events directly
        return prismaEvents;
    } catch (error) {
        console.error("Error fetching music events from Prisma: ", error);
        throw new Error("Could not fetch music events.");
    }
}

/**
 * Asynchronously retrieves a single music event by its ID from Prisma.
 *
 * @param eventId The ID of the event to retrieve.
 * @returns A promise that resolves to the MusicEvent object (Prisma type) or null if not found.
 */
export async function getMusicEventById(eventId: string): Promise<MusicEvent | null> {
   try {
       // Removed seed check
        const prismaEvent = await prisma.musicEvent.findUnique({
            where: { id: eventId },
        });

        if (prismaEvent) {
            // Return Prisma event directly
            return prismaEvent;
        } else {
            console.log(`Event with ID ${eventId} not found.`);
            return null;
        }
    } catch (error) {
        console.error("Error fetching event by ID from Prisma: ", error);
        throw new Error("Could not fetch event details.");
    }
}

/**
 * Asynchronously enters a user into a giveaway using Prisma.
 * Checks if giveaway is active, not ended, and if user hasn't entered yet.
 *
 * @param userId The ID of the user entering the giveaway.
 * @param eventId The ID of the event giveaway being entered.
 * @returns A promise that resolves to true if entry was successful, false otherwise.
 */
export async function enterGiveaway(userId: string, eventId: string): Promise<boolean> {
    try {
        const event = await prisma.musicEvent.findUnique({
            where: { id: eventId },
        });

        if (!event || !event.giveawayActive) {
            console.error(`Giveaway not active or event not found for ${eventId}`);
            return false;
        }

        const now = new Date();
        if (event.giveawayEndDate && now > event.giveawayEndDate) {
            console.error(`Giveaway ended for ${eventId}`);
            return false;
        }

        // Check if user already entered using Prisma's unique constraint handling
        try {
            await prisma.giveawayEntry.create({
                data: {
                    userId: userId,
                    eventId: eventId,
                    // enteredAt is handled by @default(now())
                },
            });
            console.log(`User ${userId} successfully entered giveaway for ${eventId}`);

            // Mock win determination (for testing - REMOVE IN PRODUCTION)
            if (Math.random() < 0.3) {
                await markUserAsWinner(userId, eventId);
                console.log(`Mock Winner: User ${userId} marked as winner for ${eventId}.`);
            }

            return true;
        } catch (error) {
            // Handle unique constraint violation (user already entered)
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                console.warn(`User ${userId} already entered giveaway for ${eventId}`);
                return false; // Already entered
            }
            // Rethrow other errors
            throw error;
        }
    } catch (error) {
        console.error("Error entering giveaway: ", error);
        return false; // Indicate failure
    }
}

/**
 * Checks if a user has entered a specific giveaway using Prisma.
 *
 * @param userId The ID of the user.
 * @param eventId The ID of the event giveaway.
 * @returns A promise that resolves to true if the user has entered, false otherwise.
 */
export async function hasUserEnteredGiveaway(userId: string, eventId: string): Promise<boolean> {
     try {
        const entry = await prisma.giveawayEntry.findUnique({
            where: {
                userId_eventId: { userId, eventId },
            },
        });
        return !!entry; // Returns true if entry exists, false otherwise
    } catch (error) {
        console.error("Error checking giveaway entry status: ", error);
        return false;
    }
}

/**
 * Retrieves the IDs of events for which a user has won a giveaway from Prisma.
 *
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of event IDs the user has won.
 */
export async function checkGiveawayWins(userId: string): Promise<string[]> {
    try {
        const wins = await prisma.giveawayWin.findMany({
            where: { userId: userId },
            select: { eventId: true }, // Only select the event ID
        });
        const wonEventIds = wins.map(win => win.eventId);
        console.log(`User ${userId} found wins for events:`, wonEventIds);
        return wonEventIds;
    } catch (error) {
        console.error("Error checking giveaway wins from Prisma: ", error);
        return [];
    }
}

/**
 * Marks a user as a winner for a specific event in Prisma.
 * Also adds a corresponding ticket to the UserTicket table.
 * In a real app, this logic should be in a secure backend function.
 *
 * @param userId The ID of the winning user.
 * @param eventId The ID of the event won.
 */
export async function markUserAsWinner(userId: string, eventId: string): Promise<void> {
    try {
        const event = await prisma.musicEvent.findUnique({ where: { id: eventId } });
        if (!event) {
            console.error(`Cannot mark winner: Event ${eventId} not found.`);
            return;
        }

        // Use transaction to ensure both win record and ticket are created
        await prisma.$transaction(async (tx) => {
            // 1. Create the win record
            await tx.giveawayWin.upsert({ // Use upsert to avoid errors if called multiple times
                where: { userId_eventId: { userId, eventId } },
                update: {}, // No update needed if exists
                create: {
                    userId: userId,
                    eventId: eventId,
                    eventName: event.name, // Store event name
                    // wonAt handled by @default(now())
                },
            });
            console.log(`Marked user ${userId} as winner for event ${eventId}`);

            // 2. Add the giveaway ticket (only if win was just created or doesn't have a ticket yet)
            // Check if a giveaway ticket for this user/event already exists
            const existingTicket = await tx.userTicket.findFirst({
                 where: {
                     userId: userId,
                     eventId: eventId,
                     type: 'giveaway',
                 }
             });

             if (!existingTicket) {
                 const newTicket = await tx.userTicket.create({
                    data: {
                        userId: userId,
                        eventId: event.id,
                        eventName: event.name,
                        venue: event.venue,
                        eventDateTime: event.dateTime, // Store event time
                        type: 'giveaway',
                        // Generate a unique QR code based on ticket ID (available after creation)
                        // We'll use a placeholder for now and potentially update it later if needed
                        qrCodeData: `GIVEAWAY-${userId}-${eventId}-TEMP`,
                        // acquiredAt handled by @default(now())
                    },
                 });
                 // Update QR code with actual ticket ID
                 await tx.userTicket.update({
                     where: { id: newTicket.id },
                     data: { qrCodeData: `GIVEAWAY-${userId}-${eventId}-${newTicket.id}` }
                 });
                console.log(`Giveaway ticket ${newTicket.id} for event ${eventId} added to user ${userId}`);
             } else {
                 console.log(`Giveaway ticket already exists for user ${userId} and event ${eventId}`);
             }
        });

    } catch (error) {
        console.error(`Error marking user ${userId} as winner for ${eventId}:`, error);
         if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            // This might happen if the upsert finds an existing win but the transaction
            // tries to create a ticket that also exists due to race conditions outside the transaction.
            // Usually safe to ignore if the goal is idempotency.
             console.warn(`User ${userId} likely already marked as winner and has ticket for ${eventId}.`);
         } else {
            // Rethrow other errors
            throw error;
         }
    }
}


/**
 * Simulates purchasing a ticket and adds it to the user's collection using Prisma.
 * In a real app, this would follow successful payment processing.
 *
 * @param userId The ID of the user purchasing the ticket.
 * @param eventId The ID of the event.
 * @returns A promise that resolves to the created UserTicket or null on failure.
 */
export async function purchaseTicket(userId: string, eventId: string): Promise<UserTicket | null> {
     try {
        const event = await prisma.musicEvent.findUnique({ where: { id: eventId } });
        if (!event || event.ticketPrice === null) {
            console.error(`Cannot purchase ticket for free or non-existent event ${eventId}`);
            return null;
        }

        // TODO: Integrate actual payment gateway logic here

        // If payment successful, add ticket to user's collection
        const newTicketData = {
            userId: userId,
            eventId: event.id,
            eventName: event.name,
            venue: event.venue,
            eventDateTime: event.dateTime,
            type: 'purchased',
            qrCodeData: `PURCHASE-${userId}-${eventId}-TEMP`, // Placeholder
        };

        const newTicket = await prisma.userTicket.create({ data: newTicketData });

        // Update QR code with actual ID
        const finalTicket = await prisma.userTicket.update({
            where: { id: newTicket.id },
            data: { qrCodeData: `PURCHASE-${userId}-${eventId}-${newTicket.id}` }
        });


        console.log(`Purchased ticket ${finalTicket.id} for event ${eventId} added to user ${userId}`);
        return prismaToUserTicket(finalTicket);

    } catch (error) {
        console.error(`Error purchasing ticket for user ${userId}, event ${eventId}:`, error);
        return null;
    }
}


/**
 * Retrieves all tickets (purchased and won) for a specific user from Prisma.
 *
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of UserTicket objects.
 */
export async function getUserTickets(userId: string): Promise<UserTicket[]> {
   try {
        const prismaTickets = await prisma.userTicket.findMany({
            where: { userId: userId },
            orderBy: {
                eventDateTime: 'desc', // Order by event date descending
            },
        });
        const tickets = prismaTickets.map(prismaToUserTicket);

        console.log(`Retrieved ${tickets.length} tickets for user ${userId}`);
        return tickets;
    } catch (error) {
        console.error(`Error fetching tickets for user ${userId} from Prisma:`, error);
        return [];
    }
}


// --- Mock Data Generation (Keep for Seeding/Testing) ---
// This function provides data in the structure expected by prisma/seed.ts

// Return type adjusted to match the structure needed for seeding (before prisma transforms it)
export function getMockEvents(): Array<Omit<PrismaMusicEvent, 'id' | 'createdAt' | 'updatedAt' | 'giveawayEntries' | 'giveawayWins' | 'tickets'> & { dateTime: string; giveawayEndDate?: string | null }> {
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
            ticketPrice: 35.00, // Use float
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
            ticketPrice: 28.00, // Use float
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
            ticketPrice: 40.00, // Use float
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
            ticketPrice: 30.00, // Use float
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
            ticketPrice: 25.00, // Use float
            ticketUrl: '#',
            description: 'Power up! A retro wave rave featuring 8-Bit Beats.',
            imageUrl: 'https://picsum.photos/seed/retro6/600/400',
            giveawayActive: true,
            giveawayEndDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
            giveawayTickets: 10,
          },
    ];
}
