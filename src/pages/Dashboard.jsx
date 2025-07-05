// src/pages/Dashboard.jsx
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase"; // Adjust path if needed
import { useNavigate } from "react-router-dom";
import CarSelector from "../components/CarSelector";
import BatteryInput from "../components/BatteryInput";
import SmartSuggestion from "../components/SmartSuggestion";
import MapView from "../components/MapView";

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedCar, setSelectedCar] = useState(null);
  const [batteryPercentage, setBatteryPercentage] = useState(50);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">VoltRoute Dashboard ⚡</h2>
        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <CarSelector selectedCar={selectedCar} setSelectedCar={setSelectedCar} />
        </div>
        <div className="col-md-6">
          <BatteryInput batteryPercentage={batteryPercentage} setBatteryPercentage={setBatteryPercentage} />
        </div>
      </div>

      <SmartSuggestion selectedCar={selectedCar} batteryPercentage={batteryPercentage} />

      <MapView selectedCar={selectedCar} batteryPercentage={batteryPercentage} />
    </div>
  );
}  
