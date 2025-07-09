// ✅ src/utils/openChargeMapAPI.js

const BASE_URL = "http://localhost:5000/api/openchargemap"; // Your proxy server

/**
 * Compute a smart score based on charger power, status, distance & battery level.
 */
function scoreStation(station, userLat, userLng, batteryPercentage = 50) {
  const dist = station.AddressInfo.Distance || 0;
  const power = station.Connections?.[0]?.PowerKW || 22;
  const available = station.StatusType?.IsOperational ? 1 : 0;

  // Smart scoring formula
  const score = (available * 50) + (power * 2) - (dist * 3) + (batteryPercentage < 30 ? 10 : 0);
  return score;
}

/**
 * Fetch EV charging stations from OpenChargeMap via your proxy,
 * with filters for connector type and availability + smart scoring.
 *
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {Object} filters - { connector, available, batteryPercentage }
 * @returns {Promise<Array>} Sorted and filtered stations
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

  // 🔌 Connector type
  if (filters.connector && filters.connector !== "All") {
    params.append("connectiontypeid", filters.connector);
  }

  // 🚦 Status filter
  if (filters.available === "Available") {
    params.append("statustypeid", 50); // Operational
  } else if (filters.available === "Unavailable") {
    params.append("statustypeid", 75); // Offline
  }

  const url = `${BASE_URL}?${params.toString()}`;

  try {
    const res = await fetch(url);
    const contentType = res.headers.get("content-type");

    if (!res.ok || !contentType?.includes("application/json")) {
      throw new Error("Invalid response from OpenChargeMap API.");
    }

    const data = await res.json();

    if (!Array.isArray(data)) throw new Error("Invalid station data received");

    // 🔍 Add smart ranking score
    const battery = filters.batteryPercentage || 50;

    return data
      .map((station) => ({
        ...station,
        _score: scoreStation(station, lat, lng, battery),
      }))
      .sort((a, b) => b._score - a._score);
  } catch (error) {
    console.error("❌ Fetch stations error:", error.message);
    return [];
  }
}
