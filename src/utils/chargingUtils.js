// ✅ src/utils/chargingUtils.js

/**
 * Estimate charging time based on battery size and percentage remaining.
 * @param {number} batterySizeKWh - Battery capacity in kWh
 * @param {number} batteryPercentage - Current battery percentage (0-100)
 * @param {number} chargerPowerKW - Charger power in kW
 * @returns {number} Estimated charging time in minutes
 */
export function estimateChargingTime(batterySizeKWh, batteryPercentage, chargerPowerKW) {
  if (!batterySizeKWh || !chargerPowerKW || batteryPercentage >= 100) {
    return 0;
  }
  const chargeNeeded = batterySizeKWh * ((100 - batteryPercentage) / 100);
  const timeHours = chargeNeeded / chargerPowerKW;
  return Math.round(timeHours * 60);
}

/**
 * Estimate charging cost based on remaining energy to charge.
 * @param {number} batterySizeKWh - Battery capacity in kWh
 * @param {number} batteryPercentage - Current battery percentage (0-100)
 * @param {number} ratePerKWh - Charging cost per kWh
 * @returns {number} Estimated cost in ₹
 */
export function estimateChargingCost(batterySizeKWh, batteryPercentage, ratePerKWh = 12) {
  if (!batterySizeKWh || batteryPercentage >= 100) {
    return 0;
  }
  const energyToCharge = batterySizeKWh * ((100 - batteryPercentage) / 100);
  return Math.round(energyToCharge * ratePerKWh);
}

/**
 * Get the maximum available power from station connections.
 * @param {Array} connections - Array of connection objects
 * @returns {number} Maximum power in kW
 */
export function getMaxPowerFromConnections(connections) {
  if (!connections || !Array.isArray(connections) || connections.length === 0) {
    return 7.4; // Default to 7.4kW for common chargers
  }
  const maxPower = Math.max(...connections.map(conn => conn.PowerKW || 7.4));
  return maxPower;
}

/**
 * Get a formatted string of connector types available.
 * @param {Array} connections - Array of connection objects
 * @returns {string} Formatted list of connector types
 */
export function getConnectorTypes(connections) {
  if (!connections || !Array.isArray(connections) || connections.length === 0) {
    return "Unknown";
  }
  const types = connections.map(conn => conn.ConnectionType?.Title || "Unknown");
  return [...new Set(types)].join(", ");
}

/**
 * Format charging time duration into a readable string.
 * @param {number} duration - Duration in minutes
 * @returns {string} Formatted duration string
 */
export function formatChargingTime(duration) {
  if (duration === 0) return "Already full";
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
}

/**
 * Estimate travel time to charging station.
 * @param {number} distanceKm - Distance in kilometers
 * @param {number} avgSpeedKmh - Average speed in km/h (default: 35 km/h for city driving)
 * @returns {number} Travel time in minutes
 */
export function estimateTravelTime(distanceKm, avgSpeedKmh = 35) {
  if (!distanceKm || distanceKm === 0) return 0;
  const timeHours = distanceKm / avgSpeedKmh;
  return Math.round(timeHours * 60);
}

/**
 * Get charging efficiency factor based on battery percentage.
 * Charging slows down as battery fills up.
 * @param {number} batteryPercentage - Current battery percentage
 * @returns {number} Efficiency factor (0.5 to 1.0)
 */
export function getChargingEfficiency(batteryPercentage) {
  if (batteryPercentage < 20) return 1.0; // Fast charging
  if (batteryPercentage < 50) return 0.9; // Still fast
  if (batteryPercentage < 80) return 0.7; // Moderate
  return 0.5; // Slow charging for battery protection
}
