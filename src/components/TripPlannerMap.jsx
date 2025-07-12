import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { useState, useEffect, useRef } from "react";

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const sourceIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="green" width="32" height="32">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const destinationIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red" width="32" height="32">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const chargingIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="blue" width="28" height="28">
      <path d="M14.5 11l-3 6v-4h-2l3-6v4h2z"/>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    </svg>
  `),
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const plannedChargingIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="orange" width="28" height="28">
      <path d="M14.5 11l-3 6v-4h-2l3-6v4h2z"/>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    </svg>
  `),
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

export default function TripPlannerMap({ tripData, tripPlan, onLocationSelect }) {
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // India center
  const [mapZoom, setMapZoom] = useState(5);
  const mapRef = useRef(null);

  // Cleanup effect to prevent map conflicts
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (tripPlan && tripPlan.route && tripPlan.route.length > 0) {
      // Calculate bounds to fit the entire route
      const lats = tripPlan.route.map(point => point[0]);
      const lngs = tripPlan.route.map(point => point[1]);
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
      setMapCenter([centerLat, centerLng]);
      setMapZoom(8);
    }
  }, [tripPlan]);

  return (
    <div className="p-3">
      <h5 className="mb-3">🗺️ Route Map</h5>
      
      <div style={{ height: "400px", width: "100%", borderRadius: "0.5rem", overflow: "hidden" }} className="trip-planner-map-container">
        <MapContainer 
          key="trip-planner-map-unique"
          center={mapCenter} 
          zoom={mapZoom} 
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {/* Source Marker */}
          {tripPlan?.sourceCoords && (
            <Marker position={tripPlan.sourceCoords} icon={sourceIcon}>
              <Popup>
                <strong>📍 Source</strong><br />
                {tripData.sourceText}
              </Popup>
            </Marker>
          )}

          {/* Destination Marker */}
          {tripPlan?.destinationCoords && (
            <Marker position={tripPlan.destinationCoords} icon={destinationIcon}>
              <Popup>
                <strong>🎯 Destination</strong><br />
                {tripData.destinationText}
              </Popup>
            </Marker>
          )}

          {/* Route Path */}
          {tripPlan?.route && tripPlan.route.length > 0 && (
            <Polyline 
              positions={tripPlan.route} 
              color="blue" 
              weight={4}
              opacity={0.7}
            />
          )}

          {/* Charging Stations Along Route */}
          {tripPlan?.nearbyChargers && tripPlan.nearbyChargers.map((charger, index) => (
            <Marker 
              key={`charger-${index}`} 
              position={[charger.AddressInfo.Latitude, charger.AddressInfo.Longitude]} 
              icon={chargingIcon}
            >
              <Popup>
                <div style={{ minWidth: "200px" }}>
                  <strong>{charger.AddressInfo.Title}</strong><br />
                  📍 {charger.AddressInfo.AddressLine1}<br />
                  ⚡ Power: {charger.Connections?.[0]?.PowerKW || "Unknown"} kW<br />
                  📏 Distance from route: {charger.distanceFromRoute?.toFixed(1)} km<br />
                  💡 Status: {charger.StatusType?.IsOperational ? "🟢 Available" : "🔴 Unavailable"}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Planned Charging Stops */}
          {tripPlan?.chargingStops && tripPlan.chargingStops.map((stop, index) => (
            <Marker 
              key={`stop-${index}`} 
              position={[stop.charger.AddressInfo.Latitude, stop.charger.AddressInfo.Longitude]} 
              icon={plannedChargingIcon}
            >
              <Popup>
                <div style={{ minWidth: "250px" }}>
                  <strong>🔋 Planned Charging Stop #{index + 1}</strong><br />
                  <strong>{stop.charger.AddressInfo.Title}</strong><br />
                  📍 {stop.charger.AddressInfo.AddressLine1}<br />
                  📏 Distance: {stop.distanceFromStart} km from start<br />
                  🔋 Battery on arrival: {stop.batteryOnArrival}%<br />
                  ⚡ Charging time: {stop.chargingTime} minutes<br />
                  💰 Charging cost: ₹{stop.chargingCost}<br />
                  🔋 Battery after charging: {stop.batteryAfterCharging}%
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Map Legend */}
      <div className="mt-3">
        <small className="text-muted">
          <strong>Legend:</strong>{" "}
          <span style={{ color: "green" }}>🟢 Source</span> | {" "}
          <span style={{ color: "red" }}>🔴 Destination</span> | {" "}
          <span style={{ color: "blue" }}>🔵 Available Chargers</span> | {" "}
          <span style={{ color: "orange" }}>🟠 Planned Stops</span>
        </small>
      </div>
    </div>
  );
}
