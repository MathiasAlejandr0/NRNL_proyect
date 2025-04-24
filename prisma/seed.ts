
import { PrismaClient } from '@prisma/client';
import { getMockEvents } from '../src/services/event'; // Adjust path if needed

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Check if events already exist
  const existingEventsCount = await prisma.musicEvent.count();
  if (existingEventsCount > 0) {
      console.log(`Database already seeded with ${existingEventsCount} events. Skipping seeding.`);
      return;
  }

  const mockEvents = getMockEvents();

  for (const eventData of mockEvents) {
    const { dateTime, giveawayEndDate, ...restData } = eventData;
    const createdEvent = await prisma.musicEvent.create({
      data: {
        ...restData,
        // Convert ISO string dates from mock data to JS Date objects
        dateTime: new Date(dateTime),
        giveawayEndDate: giveawayEndDate ? new Date(giveawayEndDate) : null,
        // Prisma handles createdAt/updatedAt automatically
      },
    });
    console.log(`Created event with id: ${createdEvent.id}`);
  }

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
