// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import CarSelector from "../components/CarSelector";
import BatteryInput from "../components/BatteryInput";
import SmartSuggestion from "../components/SmartSuggestion";
import MapView from "../components/MapView";
import Filters from "../components/Filters";
import { fetchStations } from "../utils/openChargeMapAPI";
import { estimateChargingTime } from "../utils/chargingUtils";
import { useCurrentLocation } from "../utils/locationUtils";

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedCar, setSelectedCar] = useState(null);
  const [batteryPercentage, setBatteryPercentage] = useState(50);
  const [stations, setStations] = useState([]);
  const [filters, setFilters] = useState({ connector: "", available: "" });

  const location = useCurrentLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  useEffect(() => {
    if (location?.lat && location?.lng) {
      fetchStations(location.lat, location.lng, filters).then(setStations);
    }
  }, [location, filters]);

  if (!location) {
    return (
      <div className="container py-4">
        <h4>📍 Locating your position...</h4>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">VoltRoute Dashboard ⚡</h2>
        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
      </div>

      <div className="row mb-4">
        <div className="col-md-4">
          <CarSelector selectedCar={selectedCar} setSelectedCar={setSelectedCar} />
        </div>
        <div className="col-md-4">
          <BatteryInput batteryPercentage={batteryPercentage} setBatteryPercentage={setBatteryPercentage} />
        </div>
        <div className="col-md-4">
          <Filters filters={filters} setFilters={setFilters} />
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <MapView 
            stations={stations} 
            userLocation={location} 
            batterySize={selectedCar?.batterySize || 40} 
            batteryPercentage={batteryPercentage} 
          />
        </div>
      </div>
    </div>
  );
}
