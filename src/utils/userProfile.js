// src/utils/userProfile.js
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

// Default user preferences
export const defaultPreferences = {
  preferredVehicle: null,
  chargingPreferences: {
    preferredConnectorTypes: [],
    maxChargingTime: 60, // minutes
    preferredChargingSpeed: "fast", // slow, fast, rapid
    costThreshold: 50, // rupees per session
  },
  routePreferences: {
    avoidTolls: false,
    preferScenicRoutes: false,
    maxDetourForCheapCharging: 10, // km
    preferredStopDuration: 30, // minutes
  },
  notifications: {
    batteryLowAlert: true,
    chargingCompleteAlert: true,
    trafficUpdates: true,
    newStationsNearby: true,
  },
  privacy: {
    shareLocation: true,
    allowAnalytics: true,
    publicProfile: false,
  },
  favoriteLocations: [],
  savedRoutes: [],
};

// Create or update user profile
export const createUserProfile = async (userId, profileData = {}) => {
  try {
    const userProfile = {
      ...defaultPreferences,
      ...profileData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await setDoc(doc(db, "userProfiles", userId), userProfile);
    return userProfile;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const docRef = doc(db, "userProfiles", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // Create default profile if doesn't exist
      return await createUserProfile(userId);
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

// Update user preferences
export const updateUserPreferences = async (userId, preferences) => {
  try {
    const docRef = doc(db, "userProfiles", userId);
    await updateDoc(docRef, {
      ...preferences,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    throw error;
  }
};

// Save favorite location
export const saveFavoriteLocation = async (userId, location) => {
  try {
    const profile = await getUserProfile(userId);
    const updatedFavorites = [...(profile.favoriteLocations || []), {
      id: Date.now(),
      ...location,
      savedAt: new Date().toISOString(),
    }];
    
    await updateUserPreferences(userId, {
      favoriteLocations: updatedFavorites
    });
  } catch (error) {
    console.error("Error saving favorite location:", error);
    throw error;
  }
};

// Save route
export const saveRoute = async (userId, route) => {
  try {
    const profile = await getUserProfile(userId);
    const updatedRoutes = [...(profile.savedRoutes || []), {
      id: Date.now(),
      ...route,
      savedAt: new Date().toISOString(),
    }];
    
    await updateUserPreferences(userId, {
      savedRoutes: updatedRoutes
    });
  } catch (error) {
    console.error("Error saving route:", error);
    throw error;
  }
};
