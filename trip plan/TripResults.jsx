export default function TripResults({ tripPlan }) {
  if (!tripPlan) return null;

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="p-3">
      <h5 className="mb-4">📊 Trip Summary</h5>

      {/* Trip Overview */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="alert alert-info">
            <h6 className="alert-heading">🛣️ Route Information</h6>
            <strong>Total Distance:</strong> {tripPlan.totalDistance} km<br/>
            <strong>Estimated Duration:</strong> {formatTime(tripPlan.totalDuration)}<br/>
            <strong>Energy Required:</strong> {tripPlan.totalEnergyRequired.toFixed(1)} kWh
          </div>
        </div>
        <div className="col-md-6">
          <div className="alert alert-success">
            <h6 className="alert-heading">💰 Cost Summary</h6>
            <strong>Total Charging Cost:</strong> ₹{tripPlan.totalChargingCost}<br/>
            <strong>Charging Stops:</strong> {tripPlan.chargingStops.length}<br/>
            <strong>Available Chargers:</strong> {tripPlan.nearbyChargers.length}
          </div>
        </div>
      </div>

      {/* Battery Status */}
      <div className="mb-4">
        <div className="alert alert-warning">
          <h6 className="alert-heading">🔋 Battery Analysis</h6>
          <div className="row">
            <div className="col-md-4">
              <strong>Starting Battery:</strong> {tripPlan.startingBattery}%
            </div>
            <div className="col-md-4">
              <strong>Battery at Destination:</strong> {tripPlan.batteryAtDestination}%
            </div>
            <div className="col-md-4">
              <strong>Safety Margin:</strong> {tripPlan.batteryAtDestination > 20 ? "✅ Safe" : "⚠️ Low"}
            </div>
          </div>
        </div>
      </div>

      {/* Charging Stops */}
      {tripPlan.chargingStops.length > 0 && (
        <div className="mb-4">
          <h6>🔌 Planned Charging Stops</h6>
          <div className="row">
            {tripPlan.chargingStops.map((stop, index) => (
              <div key={index} className="col-md-6 mb-3">
                <div className="card h-100">
                  <div className="card-body">
                    <h6 className="card-title">
                      Stop #{index + 1}: {stop.charger.AddressInfo.Title}
                    </h6>
                    <p className="card-text small">
                      📍 {stop.charger.AddressInfo.AddressLine1}<br/>
                      📏 {stop.distanceFromStart} km from start<br/>
                      🔋 Arrival: {stop.batteryOnArrival}% → After: {stop.batteryAfterCharging}%<br/>
                      ⚡ Charging: {stop.chargingTime} minutes<br/>
                      💰 Cost: ₹{stop.chargingCost}
                    </p>
                    <div className="progress mb-2" style={{ height: "10px" }}>
                      <div 
                        className="progress-bar bg-danger" 
                        style={{ width: `${stop.batteryOnArrival}%` }}
                      ></div>
                      <div 
                        className="progress-bar bg-success" 
                        style={{ width: `${stop.batteryAfterCharging - stop.batteryOnArrival}%` }}
                      ></div>
                    </div>
                    <small className="text-muted">
                      Power: {stop.charger.Connections?.[0]?.PowerKW || "Unknown"} kW
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nearby Chargers */}
      {tripPlan.nearbyChargers.length > 0 && (
        <div className="mb-4">
          <h6>🗺️ Chargers Along Route (within 15km)</h6>
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Station Name</th>
                  <th>Location</th>
                  <th>Distance from Route</th>
                  <th>Power</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tripPlan.nearbyChargers.slice(0, 10).map((charger, index) => (
                  <tr key={index}>
                    <td>{charger.AddressInfo.Title}</td>
                    <td>{charger.AddressInfo.AddressLine1}</td>
                    <td>{charger.distanceFromRoute?.toFixed(1)} km</td>
                    <td>{charger.Connections?.[0]?.PowerKW || "Unknown"} kW</td>
                    <td>
                      {charger.StatusType?.IsOperational ? (
                        <span className="badge bg-success">Available</span>
                      ) : (
                        <span className="badge bg-danger">Unavailable</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tripPlan.nearbyChargers.length > 10 && (
              <small className="text-muted">
                Showing 10 of {tripPlan.nearbyChargers.length} available chargers
              </small>
            )}
          </div>
        </div>
      )}

      {/* Trip Recommendations */}
      <div className="alert alert-light">
        <h6 className="alert-heading">💡 Recommendations</h6>
        <ul className="mb-0">
          {tripPlan.batteryAtDestination < 20 && (
            <li className="text-warning">
              ⚠️ Your battery will be below 20% at destination. Consider charging along the way.
            </li>
          )}
          {tripPlan.chargingStops.length === 0 && tripPlan.batteryAtDestination > 30 && (
            <li className="text-success">
              ✅ You can complete this trip without charging stops!
            </li>
          )}
          {tripPlan.nearbyChargers.length > 5 && (
            <li className="text-info">
              ℹ️ Multiple charging options available along your route for flexibility.
            </li>
          )}
          <li>
            🔋 Always maintain at least 20% battery for safety and optimal battery health.
          </li>
        </ul>
      </div>
    </div>
  );
}
