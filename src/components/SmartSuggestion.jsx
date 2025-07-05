// src/components/SmartSuggestion.jsx
export default function SmartSuggestion({ selectedCar, batteryPercentage }) {
  if (!selectedCar || !batteryPercentage) return null;

  const chargerPower = 22; // kW (fast charger example)
  const neededKWh = selectedCar.batterySize * (1 - batteryPercentage / 100);
  const chargeTime = neededKWh / chargerPower;

  // Mock distance & travel time
  const distanceKm = 6.5;
  const avgSpeed = 30;
  const travelTime = distanceKm / avgSpeed;
  const totalTime = chargeTime + travelTime;

  return (
    <div className="alert alert-info mt-3">
      <h5>⚡ Smart Suggestion</h5>
      <p>
        Based on your <strong>{selectedCar.model} ({selectedCar.batterySize} kWh)</strong> at {batteryPercentage}% battery:
      </p>
      <ul>
        <li><strong>Charge needed:</strong> {neededKWh.toFixed(1)} kWh</li>
        <li><strong>Charger type:</strong> 22 kW Fast</li>
        <li><strong>Estimated charging time:</strong> {chargeTime.toFixed(1)} hrs</li>
        <li><strong>Distance to station:</strong> 6.5 km (~{Math.ceil(travelTime * 60)} min)</li>
        <li><strong>Total time (travel + charge):</strong> {totalTime.toFixed(1)} hrs</li>
      </ul>
    </div>
  );
}
