// ✅ src/utils/chargingUtils.js

/**
 * Estimate charging time based on battery size and percentage remaining.
 */
export function estimateChargingTime(batterySizeKWh, batteryPercentage, chargerPowerKW) {
  const chargeNeeded = batterySizeKWh * (1 - batteryPercentage / 100);
  const timeHours = chargeNeeded / chargerPowerKW;
  return Math.round(timeHours * 60);
}

/**
 * Estimate cost based on power and battery size (assumes ₹12/kWh).
 */
export function estimateChargingCost(batterySizeKWh, batteryPercentage, chargerPowerKW, rate = 24) {
  const energyToCharge = batterySizeKWh * (1 - batteryPercentage / 100);
  return Math.round(energyToCharge * rate);
}
