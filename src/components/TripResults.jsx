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
          <div className="section-header">
            <h6>🔌 Planned Charging Stops</h6>
          </div>
          <div className="row">
            {tripPlan.chargingStops.map((stop, index) => (
              <div key={index} className="col-md-6 mb-3">
                <div className="charging-stop-card h-100">
                  <div className="card-body">
                    <h6 className="card-title">
                      ⚡ Stop #{index + 1}: {stop.charger.AddressInfo.Title}
                    </h6>
                    <p className="card-text small">
                      📍 {stop.charger.AddressInfo.AddressLine1}<br/>
                      📏 <strong>{stop.distanceFromStart} km</strong> from start<br/>
                      🔋 Battery: <span className="text-warning">{stop.batteryOnArrival}%</span> → <span className="text-success">{stop.batteryAfterCharging}%</span><br/>
                      ⚡ Charging: <strong>{stop.chargingTime} minutes</strong><br/>
                      💰 Cost: <strong>₹{stop.chargingCost}</strong>
                    </p>
                    <div className="progress mb-2" style={{ height: "12px" }}>
                      <div 
                        className="progress-bar bg-danger" 
                        style={{ width: `${stop.batteryOnArrival}%` }}
                        title={`Battery on arrival: ${stop.batteryOnArrival}%`}
                      ></div>
                      <div 
                        className="progress-bar bg-success" 
                        style={{ width: `${stop.batteryAfterCharging - stop.batteryOnArrival}%` }}
                        title={`Charging: +${stop.batteryAfterCharging - stop.batteryOnArrival}%`}
                      ></div>
                    </div>
                    <small className="text-muted">
                      ⚡ Power: <strong>{stop.charger.Connections?.[0]?.PowerKW || "Unknown"} kW</strong>
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
        <div className="charging-stations-section">
          <div className="section-header">
            <h6>🗺️ Chargers Along Route</h6>
            <span className="badge bg-info">
              {tripPlan.nearbyChargers.length} stations within 15km
            </span>
          </div>
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>⚡ Station Name</th>
                  <th>📍 Location</th>
                  <th>📏 Distance</th>
                  <th>🔌 Power</th>
                  <th>🟢 Status</th>
                </tr>
              </thead>
              <tbody>
                {tripPlan.nearbyChargers.slice(0, 15).map((charger, index) => (
                  <tr key={index}>
                    <td>
                      <strong>{charger.AddressInfo.Title}</strong>
                      {charger.ID?.toString().startsWith('mock_') && (
                        <small className="d-block text-info">Demo Station</small>
                      )}
                    </td>
                    <td>
                      <small>{charger.AddressInfo.AddressLine1}</small>
                      {charger.AddressInfo.Town && (
                        <small className="d-block text-muted">{charger.AddressInfo.Town}</small>
                      )}
                    </td>
                    <td>
                      <strong>{charger.distanceFromRoute?.toFixed(1)} km</strong>
                    </td>
                    <td>
                      <span className="badge bg-secondary">
                        {charger.Connections?.[0]?.PowerKW || "?"} kW
                      </span>
                      <small className="d-block text-muted">
                        {charger.Connections?.[0]?.ConnectionType?.Title || "Unknown"}
                      </small>
                    </td>
                    <td>
                      {charger.StatusType?.IsOperational ? (
                        <span className="badge bg-success">
                          ✅ Available
                        </span>
                      ) : (
                        <span className="badge bg-danger">
                          ❌ Unavailable
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tripPlan.nearbyChargers.length > 15 && (
              <small className="text-muted">
                📊 Showing top 15 of {tripPlan.nearbyChargers.length} available chargers (sorted by distance)
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
