// src/components/MapView.jsx
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { estimateChargingTime, estimateChargingCost, getEstimatedPowerFromLevel } from "../utils/chargingUtils";
import greenIconUrl from "../assets/marker-green.png";
import redIconUrl from "../assets/marker-red.png";

const greenIcon = new L.Icon({
  iconUrl: greenIconUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
const redIcon = new L.Icon({
  iconUrl: redIconUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function FlyToLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 13);
  }, [position, map]);
  return null;
}

export default function MapView({
  stations = [],
  userLocation,
  batterySize = 0,
  batteryPercentage = 0,
}) {
  const [routePath, setRoutePath] = useState([]);

  const center = userLocation ? [userLocation.lat, userLocation.lng] : [15.85, 74.5];

  const handleAddStop = (station) => {
    const dest = [station.AddressInfo.Latitude, station.AddressInfo.Longitude];
    setRoutePath(prev => [...prev, dest]);
  };

  const openInGoogleMaps = (station) => {
    const origin = `${userLocation.lat},${userLocation.lng}`;
    const dest = `${station.AddressInfo.Latitude},${station.AddressInfo.Longitude}`;
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`, "_blank");
  };

  useEffect(() => {
    // Polling mechanism for real-time updates every 5 minutes
    const interval = setInterval(() => {
      // Fetch stations status and updates here (pseudo-code)
      // fetchStationsStatus().then(updatedStations => setStations(updatedStations));
    }, 300000);

    return () => clearInterval(interval);
  }, []);

  return (
    <MapContainer center={center} zoom={13} style={{ height: "60vh", width: "100%" }}>
      <FlyToLocation position={center} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {/* User marker */}
      <Marker position={center}>
        <Popup>📍 You are here</Popup>
      </Marker>

      {/* Charging station markers */}
      {stations.map((station, index) => {
        const pos = [station.AddressInfo.Latitude, station.AddressInfo.Longitude];
        const isOperational = station.StatusType?.IsOperational;
        const icon = isOperational ? greenIcon : redIcon;

        const connection = station.Connections?.[0];
        const powerKW = connection?.PowerKW || getEstimatedPowerFromLevel(connection?.Level?.Title);
        const connectionType = connection?.ConnectionType?.Title || "Unknown";
        const level = connection?.Level?.Title || "Unknown";
        const operator = station.OperatorInfo?.Title || "Unknown Operator";
        const usageType = station.UsageType?.Title || "Unknown";
        const distance = station.AddressInfo?.Distance;
        
        // Calculate cost and time with estimated or actual power
        const estimatedCost = estimateChargingCost(batterySize, batteryPercentage, powerKW);
        const chargingTime = estimateChargingTime(batterySize, batteryPercentage, powerKW);

        return (
          <Marker key={index} position={pos} icon={icon}>
            <Popup>
              <div style={{ minWidth: '250px' }}>
                <strong>{station.AddressInfo.Title}</strong><br />
                📍 {station.AddressInfo.AddressLine1}<br />
                {station.AddressInfo.Town && <span>🏙️ {station.AddressInfo.Town}<br /></span>}
                📏 Distance: {distance ? `${distance.toFixed(1)} km` : 'N/A'}<br />
                <hr style={{ margin: '8px 0' }} />
                ⚡ Power: {powerKW === "N/A" ? powerKW : `${powerKW} kW`}<br />
                🔌 Type: {connectionType}<br />
                📊 Level: {level}<br />
                🏢 Operator: {operator}<br />
                🚪 Access: {usageType}<br />
                💡 Status: {isOperational ? "🟢 Available" : "🔴 Unavailable"}<br />
                {typeof powerKW === 'number' && (
                  <>
                    ⏱ Time to charge: {chargingTime} mins<br />
                    💰 Est. cost: ₹{estimatedCost}<br />
                  </>
                )}
                <div className="mt-2">
                  <button className="btn btn-sm btn-primary me-1" onClick={() => handleAddStop(station)}>➕ Add Stop</button>
                  <button className="btn btn-sm btn-success" onClick={() => openInGoogleMaps(station)}>🧭 Navigate</button>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {routePath.length > 1 && <Polyline positions={[center, ...routePath]} color="blue" />}
    </MapContainer>
  );
}
