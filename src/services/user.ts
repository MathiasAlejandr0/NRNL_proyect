
import type { User as FirebaseUser } from 'firebase/auth'; // Keep Firebase Auth type
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs if needed

/**
 * Represents the user profile application interface.
 */
export interface UserProfile {
  id: string; // Corresponds to Firebase UID
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'attendee' | 'producer'; // User roles
  createdAt: Date;
  updatedAt: Date;
}

// In-memory store for mock user profiles
let mockUserProfiles: UserProfile[] = [];

/**
 * Creates or updates a user profile in the mock data store when a user signs up or logs in.
 *
 * @param user - The Firebase Auth User object.
 */
export const createUserProfileDocument = async (user: FirebaseUser): Promise<void> => {
  const { uid, email, displayName, photoURL } = user;

  try {
    const existingProfileIndex = mockUserProfiles.findIndex(profile => profile.id === uid);
    const now = new Date();

    if (existingProfileIndex !== -1) {
      // Update existing profile
      mockUserProfiles[existingProfileIndex] = {
        ...mockUserProfiles[existingProfileIndex],
        email: email,
        displayName: displayName,
        photoURL: photoURL,
        updatedAt: now,
      };
      console.log('Mock user profile updated for:', uid);
    } else {
      // Create new profile
      const newUserProfile: UserProfile = {
        id: uid,
        email: email,
        displayName: displayName,
        photoURL: photoURL,
        role: 'attendee', // Default role
        createdAt: now,
        updatedAt: now,
      };
      mockUserProfiles.push(newUserProfile);
      console.log('Mock user profile created for:', uid);
    }
  } catch (error) {
    console.error('Error creating/updating mock user profile:', error);
    // Handle the error appropriately in a real application
  }
};


/**
 * Retrieves a user's profile from the mock data store.
 *
 * @param uid - The user's unique identifier (Firebase Auth UID).
 * @returns A promise that resolves to the UserProfile object or null if not found.
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
        const userProfile = mockUserProfiles.find(profile => profile.id === uid);

        if (userProfile) {
            return { ...userProfile }; // Return a copy
        } else {
            console.log('No mock user profile found for UID:', uid);
            return null;
        }
    } catch (error) {
        console.error('Error fetching mock user profile:', error);
        throw error; // Re-throw for handling in the calling component
    }
};

/**
 * Updates the role of a user in the mock data store.
 *
 * @param uid The user's UID.
 * @param newRole The new role to assign.
 */
export const updateUserRole = async (uid: string, newRole: 'attendee' | 'producer'): Promise<UserProfile | null> => {
    try {
        const profileIndex = mockUserProfiles.findIndex(profile => profile.id === uid);
        if (profileIndex !== -1) {
             mockUserProfiles[profileIndex].role = newRole;
             mockUserProfiles[profileIndex].updatedAt = new Date();
             console.log(`Mock user role updated for ${uid} to ${newRole}`);
             return { ...mockUserProfiles[profileIndex] }; // Return a copy
        } else {
             console.error(`Mock user ${uid} not found for role update.`);
             return null;
        }
    } catch (error) {
        console.error(`Error updating mock role for user ${uid}:`, error);
        return null;
    }
};

// Example function to get all mock users (for debugging/testing)
export const getAllMockUserProfiles = async (): Promise<UserProfile[]> => {
    return [...mockUserProfiles]; // Return a copy
}
