// src/components/BatteryInput.jsx
export default function BatteryInput({ batteryPercentage, setBatteryPercentage }) {
  return (
    <div className="card p-3">
      <h5>Battery Percentage</h5>
      <input
        type="range"
        className="form-range"
        min="1"
        max="100"
        value={batteryPercentage}
        onChange={(e) => setBatteryPercentage(e.target.value)}
      />
      <p className="mt-2 text-muted">Remaining: {batteryPercentage}%</p>
    </div>
  );
}
