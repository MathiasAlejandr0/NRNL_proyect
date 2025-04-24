import { db } from '@/lib/firebase/config';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';

/**
 * Represents the user data stored in Firestore.
 */
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'attendee' | 'producer'; // Define user roles
  createdAt: Date; // Use Firestore Timestamp server-side ideally
  // Add other profile fields as needed
}

/**
 * Creates or updates a user profile in Firestore when a user signs up or logs in.
 * Uses `setDoc` with `merge: true` to avoid overwriting existing data unnecessarily.
 *
 * @param user - The Firebase Auth User object.
 */
export const createUserProfileDocument = async (user: FirebaseUser): Promise<void> => {
  const userRef = doc(db, 'users', user.uid);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    // User profile doesn't exist, create it
    const { uid, email, displayName, photoURL } = user;
    const createdAt = new Date(); // Use client-side date for simplicity, or serverTimestamp()

    try {
       // Assign 'attendee' role by default for new users
      const newUserProfile: UserProfile = {
        uid,
        email,
        displayName,
        photoURL,
        role: 'attendee',
        createdAt,
      };
      await setDoc(userRef, newUserProfile);
      console.log('New user profile created in Firestore for:', uid);
    } catch (error) {
      console.error('Error creating user profile in Firestore:', error);
      // Handle the error appropriately (e.g., show a message to the user)
    }
  } else {
    // User profile exists, potentially update fields if they've changed (e.g., display name, photoURL)
    // For simplicity, we won't automatically update here, but you could add logic
    // to compare `user` object fields with `userSnapshot.data()` and update if necessary.
    console.log('User profile already exists for:', user.uid);
  }
};


/**
 * Retrieves a user's profile from Firestore.
 *
 * @param uid - The user's unique identifier.
 * @returns A promise that resolves to the UserProfile object or null if not found.
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const userRef = doc(db, 'users', uid);
    try {
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
            // Convert Firestore Timestamp to Date if necessary
            const data = userSnapshot.data();
            // Note: Firestore Timestamps need conversion if fetched directly
            // For simplicity, assuming `createdAt` was stored as a standard Date or string initially
            // If using serverTimestamp(), you'd get a Timestamp object here.
            return {
                ...data,
                // Example conversion if createdAt is a Firestore Timestamp:
                // createdAt: data.createdAt.toDate(),
            } as UserProfile;
        } else {
            console.log('No user profile found for UID:', uid);
            return null;
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error; // Re-throw to handle in the calling component
    }
};

// TODO: Add functions for updating user profiles (e.g., changing role to 'producer')
// export const updateUserRole = async (uid: string, newRole: 'attendee' | 'producer'): Promise<void> => { ... }
