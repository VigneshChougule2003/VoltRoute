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
import { useCurrentLocation } from "../utils/locationUtils";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedCar, setSelectedCar] = useState(null);
  const [batteryPercentage, setBatteryPercentage] = useState(50);
  const [stations, setStations] = useState([]);
  const [filters, setFilters] = useState({ connector: "", available: "" });
  const [selectedStation, setSelectedStation] = useState(null);

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
      <div className="dashboard-page">
        <div className="dashboard-content">
          <h4 className="text-center locating-text">📍 Locating your position...</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <button className="logout-btn" onClick={handleLogout}>
        🚪 Logout
      </button>

      <div className="dashboard-content">
        <h2 className="dashboard-title">⚡ VoltRoute Dashboard</h2>

        <div className="dashboard-cards">
          <div className="dashboard-card">
            <CarSelector selectedCar={selectedCar} setSelectedCar={setSelectedCar} />
          </div>
          <div className="dashboard-card">
            <BatteryInput batteryPercentage={batteryPercentage} setBatteryPercentage={setBatteryPercentage} />
          </div>
          <div className="dashboard-card">
            <Filters filters={filters} setFilters={setFilters} />
          </div>
        </div>

        <div className="dashboard-map">
          <MapView
            stations={stations}
            userLocation={location}
            batterySize={selectedCar?.batterySize || 40}
            batteryPercentage={batteryPercentage}
            selectedStation={selectedStation}
            setSelectedStation={setSelectedStation}
          />
        </div>
      </div>
    </div>
  );
}
