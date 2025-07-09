// ✅ src/components/MapView.jsx
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
import { estimateChargingTime, estimateChargingCost } from "../utils/chargingUtils";
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
  const [routePath, setRoutePath] = useState(null);

  const center = userLocation ? [userLocation.lat, userLocation.lng] : [15.85, 74.5];

  const handleRoute = (station) => {
    const dest = [station.AddressInfo.Latitude, station.AddressInfo.Longitude];
    setRoutePath([center, dest]);
  };

  const openInGoogleMaps = (station) => {
    const origin = `${userLocation.lat},${userLocation.lng}`;
    const dest = `${station.AddressInfo.Latitude},${station.AddressInfo.Longitude}`;
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`, "_blank");
  };

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

        const estimatedTime = estimateChargingTime(
          batterySize,
          batteryPercentage,
          station.AddressInfo.Distance || 0
        );

        const powerKW = station.Connections?.[0]?.PowerKW || 22;
        const estimatedCost = estimateChargingCost(batterySize, batteryPercentage, powerKW);

        return (
          <Marker key={index} position={pos} icon={icon}>
            <Popup>
              <strong>{station.AddressInfo.Title}</strong><br />
              {station.AddressInfo.AddressLine1}<br />
              ⚡ Power: {powerKW} kW<br />
              🔌 Connectors: {station.Connections?.length || 0}<br />
              💡 Status: {isOperational ? "🟢 Available" : "🔴 Unavailable"}<br />
              ⏱ Time to full charge: {estimatedTime} mins<br />
              💰 Estimated cost: ₹{estimatedCost}<br />
              <button className="btn btn-sm btn-primary mt-1" onClick={() => handleRoute(station)}>📍 Show Route</button>
              <button className="btn btn-sm btn-success mt-1 ms-2" onClick={() => openInGoogleMaps(station)}>🧭 Open in Google Maps</button>
            </Popup>
          </Marker>
        );
      })}

      {routePath && <Polyline positions={routePath} color="blue" />}
    </MapContainer>
  );
}
