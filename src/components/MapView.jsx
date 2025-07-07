// src/components/MapView.jsx
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { estimateChargingTime } from "../utils/chargingUtils";

// Fix Leaflet marker icons (important!)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

export default function MapView({
  stations = [],
  userLocation,
  batterySize = 0,
  batteryPercentage = 0,
}) {
  if (!userLocation) return <p>Loading map...</p>;

  const center = [userLocation.lat, userLocation.lng];

  return (
    <MapContainer center={center} zoom={13} style={{ height: "60vh", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
      />

      {/* User location marker */}
      <Marker position={center}>
        <Popup>Your current location</Popup>
      </Marker>

      {/* Charging stations */}
      {stations.map((station, index) => {
        const pos = [
          station.AddressInfo.Latitude,
          station.AddressInfo.Longitude,
        ];

        const distanceKm = station.AddressInfo.Distance || 0;
        const estimatedTime = estimateChargingTime(
          batterySize,
          batteryPercentage,
          distanceKm
        );

        return (
          <Marker key={index} position={pos}>
            <Popup>
              <strong>{station.AddressInfo.Title}</strong>
              <br />
              Distance: {distanceKm.toFixed(1)} km
              <br />
              Est. Charge Time: {estimatedTime} mins
              <br />
              Connectors: {station.Connections?.length || 0}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
