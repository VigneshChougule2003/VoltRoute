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
import { 
  estimateChargingTime, 
  estimateChargingCost, 
  getMaxPowerFromConnections, 
  getConnectorTypes, 
  formatChargingTime,
  estimateTravelTime,
  getChargingEfficiency
} from "../utils/chargingUtils";
import { bookSlot, isStationUnavailableDueToBooking, getUserActiveBooking } from "../utils/bookingUtils";
import { auth } from "../firebase";
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
  const [bookingStatus, setBookingStatus] = useState({});

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

  const handleBooking = async (station, chargingTimeMinutes) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Please log in to book a charging slot.");
        return;
      }

      // Try multiple ways to get station ID
      const stationId = station.ID?.toString() || 
                       station.AddressInfo?.ID?.toString() || 
                       station.id?.toString() || 
                       `${station.AddressInfo?.Latitude}_${station.AddressInfo?.Longitude}`;
      
      if (!stationId) {
        alert("Station ID not available. Cannot book this station.");
        return;
      }

      setBookingStatus(prev => ({ ...prev, [stationId]: "booking" }));

      const result = await bookSlot(
        stationId,
        user.uid,
        user.email,
        station.AddressInfo.Title,
        chargingTimeMinutes,
        batteryPercentage,
        batterySize
      );

      setBookingStatus(prev => ({ ...prev, [stationId]: "success" }));
      alert(`${result.message}\nStart: ${result.bookingDetails.startTime}\nEnd: ${result.bookingDetails.endTime}\nDuration: ${result.bookingDetails.duration} minutes`);

      // Clear success status after 3 seconds
      setTimeout(() => {
        setBookingStatus(prev => ({ ...prev, [stationId]: null }));
      }, 3000);

    } catch (error) {
      const stationId = station.ID?.toString() || 
                       station.AddressInfo?.ID?.toString() || 
                       station.id?.toString() || 
                       `${station.AddressInfo?.Latitude}_${station.AddressInfo?.Longitude}`;
      
      setBookingStatus(prev => ({ ...prev, [stationId]: "error" }));
      alert(`Booking failed: ${error.message}`);
      
      // Clear error status after 3 seconds
      setTimeout(() => {
        setBookingStatus(prev => ({ ...prev, [stationId]: null }));
      }, 3000);
    }
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
        
        // Get station ID for booking (consistent with booking function)
        const stationId = station.ID?.toString() || 
                         station.AddressInfo?.ID?.toString() || 
                         station.id?.toString() || 
                         `${station.AddressInfo?.Latitude}_${station.AddressInfo?.Longitude}`;
        
        // Check if station is booked or has operational issues
        const isBooked = station._isBookedUnavailable || bookingStatus[stationId] === 'success';
        const icon = isOperational && !isBooked ? greenIcon : redIcon;

        // Get maximum power from all connections
        const maxPowerKW = getMaxPowerFromConnections(station.Connections);
        
        // Get connector types
        const connectorTypes = getConnectorTypes(station.Connections);
        
        // Distance to station
        const distance = station.AddressInfo.Distance || 0;
        
        // Calculate travel time
        const travelTimeMinutes = estimateTravelTime(distance);
        const formattedTravelTime = formatChargingTime(travelTimeMinutes);
        
        // Calculate charging efficiency based on current battery level
        const chargingEfficiency = getChargingEfficiency(batteryPercentage);
        const effectivePower = maxPowerKW * chargingEfficiency;
        
        // Calculate charging time with efficiency factor
        const estimatedTimeMinutes = estimateChargingTime(
          batterySize,
          batteryPercentage,
          effectivePower
        );
        
        // Format charging time
        const formattedTime = formatChargingTime(estimatedTimeMinutes);
        
        // Calculate estimated cost
        const estimatedCost = estimateChargingCost(batterySize, batteryPercentage);
        
        // Calculate energy needed
        const energyNeeded = batterySize * ((100 - batteryPercentage) / 100);
        
        // Calculate total time (travel + charging)
        const totalTimeMinutes = travelTimeMinutes + estimatedTimeMinutes;
        const formattedTotalTime = formatChargingTime(totalTimeMinutes);
        
        // Get current booking status for this station
        const currentBookingStatus = bookingStatus[stationId];
        
        // Check if station has only one connection
        const singleConnection = station.Connections?.length === 1;
        
        return (
          <Marker key={index} position={pos} icon={icon}>
            <Popup>
              <div style={{ minWidth: '250px' }}>
                <strong>{station.AddressInfo.Title}</strong><br />
                📍 {station.AddressInfo.AddressLine1}<br />
                {station.AddressInfo.Town && `${station.AddressInfo.Town}, `}
                {station.AddressInfo.StateOrProvince}<br />
                <hr style={{ margin: '8px 0' }} />
                ⚡ Max Power: {maxPowerKW} kW<br />
                🔌 Connectors: {station.Connections?.length || 0} ({connectorTypes})<br />
                📏 Distance: {distance.toFixed(1)} km<br />
                💡 Status: {isBooked ? "🔴 Booked" : isOperational ? "🟢 Available" : "🔴 Unavailable"}<br />
                <hr style={{ margin: '8px 0' }} />
                <strong>Time Estimates:</strong><br />
                🚗 Travel time: {formattedTravelTime}<br />
                {batterySize > 0 ? (
                  <>
                    ⚡ Charging time: {formattedTime}<br />
                    ⏱ Total time: {formattedTotalTime}<br />
                  </>
                ) : (
                  <>
                    ⚡ Charging time: <span className="text-warning">Select car model</span><br />
                    ⏱ Total time: <span className="text-warning">Select car model</span><br />
                  </>
                )}
                <hr style={{ margin: '6px 0' }} />
                <strong>Charging Details:</strong><br />
                {batterySize > 0 ? (
                  <>
                    🔋 Energy needed: {energyNeeded.toFixed(1)} kWh<br />
                    💰 Estimated cost: ₹{estimatedCost}<br />
                    📊 Charging efficiency: {(chargingEfficiency * 100).toFixed(0)}%<br />
                  </>
                ) : (
                  <>
                    <span className="text-warning">⚠️ Select your car model to see charging details</span><br />
                  </>
                )}
                <div style={{ marginTop: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  <button 
                    className="btn btn-sm btn-primary" 
                    onClick={() => handleRoute(station)}
                    style={{ fontSize: '12px' }}
                  >
                    📍 Show Route
                  </button>
                  <button 
                    className="btn btn-sm btn-success" 
                    onClick={() => openInGoogleMaps(station)}
                    style={{ fontSize: '12px' }}
                  >
                    🧭 Navigate
                  </button>
                  {isOperational && !isBooked && (
                    batterySize > 0 ? (
                      <button 
                        className={`btn btn-sm ${
                          currentBookingStatus === 'booking' ? 'btn-warning' :
                          currentBookingStatus === 'success' ? 'btn-success' :
                          currentBookingStatus === 'error' ? 'btn-danger' :
                          'btn-info'
                        }`}
                        onClick={() => handleBooking(station, estimatedTimeMinutes)}
                        disabled={currentBookingStatus === 'booking' || isBooked}
                        style={{ fontSize: '12px' }}
                      >
                        {currentBookingStatus === 'booking' ? '⏳ Booking...' :
                         currentBookingStatus === 'success' ? '✅ Booked' :
                         currentBookingStatus === 'error' ? '❌ Failed' :
                         isBooked ? '🔴 Booked' :
                         '🔒 Book Slot'}
                      </button>
                    ) : (
                      <button 
                        className="btn btn-sm btn-secondary"
                        disabled
                        style={{ fontSize: '12px' }}
                        title="Please select your car model first"
                      >
                        🚗 Select Car First
                      </button>
                    )
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {routePath && <Polyline positions={routePath} color="blue" />}
    </MapContainer>
  );
}
