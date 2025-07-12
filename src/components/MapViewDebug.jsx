import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useEffect, useRef } from "react";

// Fix for default markers
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

export default function MapViewDebug({ userLocation, stations = [] }) {
  const mapRef = useRef(null);
  
  // Always use a valid center
  const center = userLocation && userLocation.lat && userLocation.lng 
    ? [userLocation.lat, userLocation.lng] 
    : [20.5937, 78.9629]; // India center

  console.log('MapViewDebug rendering with:', { userLocation, center, stationsCount: stations.length });

  useEffect(() => {
    console.log('MapViewDebug mounted');
    const timer = setTimeout(() => {
      if (mapRef.current) {
        console.log('Invalidating map size in debug component');
        mapRef.current.invalidateSize();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ 
      height: "60vh", 
      width: "100%", 
      background: "#e9ecef",
      border: "3px solid #28a745",
      borderRadius: "0.5rem",
      position: "relative"
    }}>
      <div style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        background: "rgba(0,0,0,0.7)",
        color: "white",
        padding: "5px 10px",
        borderRadius: "3px",
        fontSize: "12px",
        zIndex: 1000
      }}>
        Debug Map - Center: {center[0].toFixed(4)}, {center[1].toFixed(4)}
      </div>
      
      <MapContainer 
        key={`debug-map-${Date.now()}`}
        center={center} 
        zoom={10} 
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
        scrollWheelZoom={true}
        whenReady={() => {
          console.log('Debug map is ready!');
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        
        {/* Always show a marker at the center */}
        <Marker position={center}>
          <Popup>
            <div>
              <strong>Map Center</strong><br/>
              Lat: {center[0]}<br/>
              Lng: {center[1]}<br/>
              Stations: {stations.length}
            </div>
          </Popup>
        </Marker>
        
        {/* Show stations if available */}
        {stations.slice(0, 5).map((station, index) => {
          const pos = [station.AddressInfo?.Latitude, station.AddressInfo?.Longitude];
          if (!pos[0] || !pos[1]) return null;
          
          return (
            <Marker key={index} position={pos}>
              <Popup>
                <strong>{station.AddressInfo?.Title || `Station ${index + 1}`}</strong><br/>
                {station.AddressInfo?.AddressLine1}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
