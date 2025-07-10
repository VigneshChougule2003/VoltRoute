// ✅ src/utils/chargingUtils.js

/**
 * Estimate charging time based on battery size and percentage remaining.
 */
export function estimateChargingTime(batterySizeKWh, batteryPercentage, chargerPowerKW) {
  // Handle missing or invalid charger power
  if (!chargerPowerKW || typeof chargerPowerKW !== 'number') {
    return "N/A";
  }
  
  const chargeNeeded = batterySizeKWh * (1 - batteryPercentage / 100);
  const timeHours = chargeNeeded / chargerPowerKW;
  return Math.round(timeHours * 60);
}

/**
 * Estimate cost based on power and battery size (assumes ₹24/kWh).
 */
export function estimateChargingCost(batterySizeKWh, batteryPercentage, chargerPowerKW, rate = 24) {
  // Handle missing or invalid charger power
  if (!chargerPowerKW || typeof chargerPowerKW !== 'number') {
    return "N/A";
  }
  
  const energyToCharge = batterySizeKWh * (1 - batteryPercentage / 100);
  return Math.round(energyToCharge * rate);
}

/**
 * Get estimated power for charging level when PowerKW is not available
 */
export function getEstimatedPowerFromLevel(levelTitle) {
  if (!levelTitle) return 22; // Default fallback
  
  const level = levelTitle.toLowerCase();
  
  if (level.includes('level 1') || level.includes('slow')) {
    return 3.7; // Level 1: Slow charging
  } else if (level.includes('level 2') || level.includes('medium')) {
    return 22; // Level 2: Medium charging
  } else if (level.includes('level 3') || level.includes('fast') || level.includes('rapid')) {
    return 50; // Level 3: Fast charging
  }
  
  return 22; // Default to Level 2
}
