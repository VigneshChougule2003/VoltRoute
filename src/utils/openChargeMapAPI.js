// src/utils/openChargeMapAPI.js

const BASE_URL = "http://localhost:5000/api/openchargemap"; // your proxy server

/**
 * Fetch EV charging stations from OpenChargeMap based on filters and location.
 * @param {number} lat - Latitude of user location
 * @param {number} lng - Longitude of user location
 * @param {Object} filters - Filters like connector type and availability
 * @returns {Promise<Array>} - Array of stations
 */
export async function fetchStations(lat, lng, filters = {}) {
  const params = new URLSearchParams({
    output: "json",
    countrycode: "IN",
    latitude: lat,
    longitude: lng,
    distance: 25,
    maxresults: 50
  });

  if (filters.connector && filters.connector !== "All") {
    params.append("connectiontypeid", filters.connector);
  }

  if (filters.available === "Available") {
    params.append("statusTypeId", 50); // Only operational
  } else if (filters.available === "Unavailable") {
    params.append("statusTypeId", 75); // Faulted/Offline
  }

  const url = `${BASE_URL}?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Invalid response format from API");
    }

    return data;
  } catch (err) {
    console.error("❌ Fetch stations error:", err.message);
    return [];
  }
}
