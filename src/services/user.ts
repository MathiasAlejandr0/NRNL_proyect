
import { prisma } from '@/lib/prisma'; // Use Prisma client
import type { UserProfile as PrismaUserProfile } from '@prisma/client';
import type { User as FirebaseUser } from 'firebase/auth'; // Keep Firebase Auth type

/**
 * Represents the user profile application interface. Directly uses the Prisma model structure.
 */
export type UserProfile = PrismaUserProfile;


/**
 * Creates or updates a user profile in Prisma when a user signs up or logs in.
 * Uses `upsert` for atomic create/update operation.
 *
 * @param user - The Firebase Auth User object.
 */
export const createUserProfileDocument = async (user: FirebaseUser): Promise<void> => {
  const { uid, email, displayName, photoURL } = user;

  try {
    await prisma.userProfile.upsert({
      where: { id: uid }, // Find user by Firebase UID
      update: {
        // Fields to update if the user exists
        email: email,
        displayName: displayName,
        photoURL: photoURL,
        // updatedAt is handled automatically by Prisma
      },
      create: {
        // Fields to set if the user is new
        id: uid, // Use Firebase UID as the primary key
        email: email,
        displayName: displayName,
        photoURL: photoURL,
        role: 'attendee', // Default role
        // createdAt and updatedAt are handled automatically by Prisma
      },
    });
    console.log('User profile created or updated in Prisma for:', uid);
  } catch (error) {
    console.error('Error creating/updating user profile in Prisma:', error);
    // Handle the error appropriately
  }
};


/**
 * Retrieves a user's profile from Prisma.
 *
 * @param uid - The user's unique identifier (Firebase Auth UID).
 * @returns A promise that resolves to the UserProfile object (Prisma type) or null if not found.
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
        const userProfile = await prisma.userProfile.findUnique({
            where: { id: uid },
        });

        if (userProfile) {
            // Return Prisma model directly
            return userProfile;
        } else {
            console.log('No user profile found for UID:', uid);
            return null;
        }
    } catch (error) {
        console.error('Error fetching user profile from Prisma:', error);
        throw error; // Re-throw to handle in the calling component
    }
};

/**
 * Updates the role of a user.
 *
 * @param uid The user's UID.
 * @param newRole The new role to assign.
 */
export const updateUserRole = async (uid: string, newRole: 'attendee' | 'producer'): Promise<UserProfile | null> => {
    try {
        const updatedUser = await prisma.userProfile.update({
            where: { id: uid },
            data: { role: newRole },
        });
         // Return updated Prisma model directly
         return updatedUser;
    } catch (error) {
        console.error(`Error updating role for user ${uid}:`, error);
         // Handle specific errors like P2025 (Record not found) if necessary
        return null;
    }
};
