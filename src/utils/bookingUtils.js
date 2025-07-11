import { db } from "../firebase";
import { collection, addDoc, query, where, getDocs, Timestamp, doc, updateDoc } from "firebase/firestore";

/**
 * Check if a charging station is available for booking
 * @param {string} stationId - The ID of the charging station
 * @param {number} startTime - Start time in epoch
 * @param {number} duration - Duration of the booking in minutes
 * @returns {Promise<boolean>} True if available, false otherwise
 */
export async function isStationAvailable(stationId, startTime, duration) {
  try {
    const bookingsRef = collection(db, "bookings");
    const endTime = startTime + duration * 60 * 1000;

    // Use a simpler query that only filters on stationId
    const q = query(
      bookingsRef,
      where("stationId", "==", stationId)
    );

    const querySnapshot = await getDocs(q);
    
    // Check for overlapping bookings in JavaScript
    const hasOverlap = querySnapshot.docs.some(doc => {
      const booking = doc.data();
      const bookingStart = booking.startTime?.toMillis() || 0;
      const bookingEnd = booking.endTime?.toMillis() || 0;
      
      // Check if there's an overlap between requested time and existing booking
      return booking.status === "active" && 
             bookingEnd > startTime && 
             bookingStart < endTime;
    });
    
    return !hasOverlap;
  } catch (error) {
    console.error("Error checking station availability: ", error);
    return false;
  }
}

/**
 * Check if user has an active booking
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object|null>} Active booking object or null
 */
export async function getUserActiveBooking(userId) {
  try {
    const bookingsRef = collection(db, "bookings");
    const now = Timestamp.now();
    
    const q = query(
      bookingsRef,
      where("userId", "==", userId)
    );

    const querySnapshot = await getDocs(q);
    
    // Find active booking that hasn't ended yet
    const allBookings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const activeBooking = allBookings.find(booking => {
      const isActive = booking.status === "active";
      const hasEndTime = booking.endTime;
      const notExpired = hasEndTime && booking.endTime.toMillis() > now.toMillis();
      
      return isActive && hasEndTime && notExpired;
    });
    
    return activeBooking || null;
  } catch (error) {
    console.error("Error getting user active booking: ", error);
    return null;
  }
}

/**
 * Book a charging slot for the user
 * @param {string} stationId - The ID of the charging station
 * @param {string} userId - The ID of the logged-in user
 * @param {string} userEmail - The email of the logged-in user
 * @param {string} stationTitle - The title/name of the charging station
 * @param {number} chargingTimeMinutes - Duration of charging in minutes
 * @param {number} batteryPercentage - Current battery percentage
 * @param {number} batterySize - Battery size in kWh
 * @returns {Promise} Result of the booking
 */
export async function bookSlot(stationId, userId, userEmail, stationTitle, chargingTimeMinutes, batteryPercentage, batterySize) {
  try {
    // Check if user already has an active booking
    const existingBooking = await getUserActiveBooking(userId);
    if (existingBooking) {
      throw new Error(`You already have an active booking at ${existingBooking.stationTitle}. Please complete or cancel it first.`);
    }
    
    const bookingsRef = collection(db, "bookings");
    
    // Calculate total duration (charging time + 15 minutes buffer)
    const totalDuration = chargingTimeMinutes + 15;
    
    // Start time is current time
    const startTime = Date.now();
    const endTime = startTime + totalDuration * 60 * 1000;

    // Check availability - simplified check
    const available = await isStationAvailable(stationId, startTime, totalDuration);
    if (!available) {
      throw new Error("Station is not available for the requested time slot.");
    }

    // Create booking data
    const bookingData = {
      stationId,
      userId,
      userEmail,
      stationTitle,
      startTime: Timestamp.fromMillis(startTime),
      endTime: Timestamp.fromMillis(endTime),
      chargingTimeMinutes,
      totalDuration,
      batteryPercentage,
      batterySize,
      status: "active",
      createdAt: Timestamp.now()
    };

    await addDoc(bookingsRef, bookingData);
    return {
      success: true,
      message: "Booking successful!",
      bookingDetails: {
        startTime: new Date(startTime).toLocaleString(),
        endTime: new Date(endTime).toLocaleString(),
        duration: totalDuration
      }
    };
  } catch (error) {
    console.error("Error booking slot: ", error);
    throw error;
  }
}

/**
 * Get active bookings for a specific station
 * @param {string} stationId - The ID of the charging station
 * @returns {Promise<Array>} Array of active bookings
 */
export async function getActiveBookings(stationId) {
  try {
    const bookingsRef = collection(db, "bookings");
    const now = Timestamp.now();
    
    // Use a simpler query that only filters on stationId
    const q = query(
      bookingsRef,
      where("stationId", "==", stationId)
    );

    const querySnapshot = await getDocs(q);
    
    // Filter active bookings in JavaScript to avoid composite index requirement
    const activeBookings = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(booking => 
        booking.status === "active" && 
        booking.endTime && 
        booking.endTime.toMillis() > now.toMillis()
      );
      
    return activeBookings;
  } catch (error) {
    console.error("Error getting active bookings: ", error);
    return [];
  }
}

/**
 * Check if a station has only one connection and is currently booked
 * @param {Object} station - The charging station object
 * @returns {Promise<boolean>} True if station is unavailable due to booking
 */
export async function isStationUnavailableDueToBooking(station) {
  try {
    const connectionCount = station.Connections?.length || 0;
    
    // If station has more than 1 connection, it's likely available
    if (connectionCount > 1) {
      return false;
    }
    
    // Check for active bookings
    const activeBookings = await getActiveBookings(station.ID?.toString());
    return activeBookings.length > 0;
  } catch (error) {
    console.error("Error checking station booking status: ", error);
    return false;
  }
}

/**
 * Cancel a booking
 * @param {string} bookingId - The ID of the booking to cancel
 * @returns {Promise} Result of the cancellation
 */
export async function cancelBooking(bookingId) {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await updateDoc(bookingRef, {
      status: "cancelled",
      cancelledAt: Timestamp.now()
    });
    
    return { success: true, message: "Booking cancelled successfully" };
  } catch (error) {
    console.error("Error cancelling booking: ", error);
    throw error;
  }
}
