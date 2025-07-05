import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const mockStations = [
  {
    id: 1,
    name: "Tata Power Station",
    lat: 18.5204,
    lng: 73.8567,
    availableSlots: 3,
    type: "Fast Charger",
  },
  {
    id: 2,
    name: "Battery Swap Hub",
    lat: 18.528,
    lng: 73.849,
    availableSlots: 0,
    type: "Swap",
  },
];

export default function MapView() {
  return (
    <div className="mt-4">
      <h5 className="mb-2">Nearby Charging Stations</h5>
      <MapContainer
        center={[18.52, 73.85]}
        zoom={13}
        style={{ height: "400px", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {mockStations.map((station) => (
          <Marker key={station.id} position={[station.lat, station.lng]}>
            <Popup>
              <strong>{station.name}</strong>
              <br />
              Type: {station.type}
              <br />
              Slots: {station.availableSlots}
              <br />
              Charger: 22 kW
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
