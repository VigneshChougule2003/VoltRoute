// ✅ src/utils/openChargeMapAPI.js

const BASE_URL = "http://localhost:5000/api/openchargemap"; // Your local proxy server

/**
 * Fetch EV charging stations from OpenChargeMap via your proxy,
 * supporting filters for connector type and availability.
 *
 * @param {number} lat - Latitude of user's location
 * @param {number} lng - Longitude of user's location
 * @param {Object} filters - { connector, available }
 * @returns {Promise<Array>} - Charging station array
 */
export async function fetchStations(lat, lng, filters = {}) {
  const params = new URLSearchParams({
    output: "json",
    countrycode: "IN",
    latitude: lat,
    longitude: lng,
    distance: 25,
    distanceunit: "KM",
    maxresults: 50,
  });

  // Connector filter (e.g. connectiontypeid=25)
  if (filters.connector && filters.connector !== "All") {
    params.append("connectiontypeid", filters.connector);
  }

  // Availability filter
  if (filters.available === "Available") {
    params.append("statusTypeId", 50); // Operational
  } else if (filters.available === "Unavailable") {
    params.append("statusTypeId", 75); // Offline
  }

  const url = `${BASE_URL}?${params.toString()}`;

  try {
    const res = await fetch(url);

    // Sometimes OpenChargeMap sends HTML on error
    const contentType = res.headers.get("content-type");
    if (!res.ok || !contentType.includes("application/json")) {
      throw new Error("Invalid response from OpenChargeMap API.");
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("Invalid station data received");
    }

    return data;
  } catch (error) {
    console.error("❌ Fetch stations error:", error.message);
    return [];
  }
}
