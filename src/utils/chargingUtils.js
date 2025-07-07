// src/utils/chargingUtils.js

/**
 * Estimate time to full charge in hours.
 * @param {number} batterySize - in kWh
 * @param {number} batteryPercentage - from 0 to 100
 * @param {number} chargerPower - in kW (default 7kW if not provided)
 */
export function estimateChargingTime(batterySize, batteryPercentage, chargerPower = 7) {
  const remainingCapacity = batterySize * ((100 - batteryPercentage) / 100);
  const time = remainingCapacity / chargerPower;
  return time.toFixed(2);
}
