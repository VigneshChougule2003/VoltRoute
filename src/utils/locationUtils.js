// src/utils/locationUtils.js
import { useState, useEffect } from "react";

// Default location (India center) as fallback
const DEFAULT_LOCATION = { lat: 20.5937, lng: 78.9629 };

export function useCurrentLocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Set default location immediately to show map
    setLocation(DEFAULT_LOCATION);

    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      setError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Got user location:", latitude, longitude);
        setLocation({ lat: latitude, lng: longitude });
        setError(null);
      },
      (error) => {
        console.error("Error getting location:", error);
        setError(error.message);
        // Keep default location on error
        console.log("Using default location due to error:", DEFAULT_LOCATION);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 } // Cache for 10 minutes
    );
  }, []);

  return location;
}
