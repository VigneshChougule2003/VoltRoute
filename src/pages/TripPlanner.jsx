import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import TripPlannerMap from "../components/TripPlannerMap";
import TripForm from "../components/TripForm";
import TripResults from "../components/TripResults";
import { calculateTripPlan } from "../utils/tripPlanningUtils";
import "./TripPlanner.css";

export default function TripPlanner() {
  const navigate = useNavigate();
  const [tripData, setTripData] = useState({
    sourceText: "",
    destinationText: "",
    selectedCar: null,
    currentBattery: 80,
  });
  const [tripPlan, setTripPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Check authentication
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  const handleTripFormSubmit = async (formData) => {
    setLoading(true);
    setError(null);

    if (!navigator.onLine) {
      setError("No internet connection. Please check your network and try again.");
      setLoading(false);
      return;
    }

    try {
      const plan = await calculateTripPlan(formData);
      setTripPlan(plan);
      setTripData(formData);
    } catch (err) {
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        setError("Network error. Please check your internet connection and try again.");
      } else if (err.message.includes("not found")) {
        setError(err.message);
      } else {
        setError(`Trip planning failed: ${err.message}`);
      }
      console.error("Trip planning error:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetTrip = () => {
    setTripPlan(null);
    setTripData({
      sourceText: "",
      destinationText: "",
      selectedCar: null,
      currentBattery: 80,
    });
    setError(null);
  };

  return (
    <div className="dashboard-page">
      <button
        className="btn btn-outline-light position-absolute"
        style={{ top: "1rem", left: "1rem", zIndex: 1000 }}
        onClick={() => navigate("/dashboard")}
      >
        ← Back to Dashboard
      </button>

      <div className="dashboard-content">
        <h2 className="dashboard-title">🗺️ Trip Planner</h2>

        <div className={`badge ${isOnline ? "bg-success" : "bg-danger"}`}>
          {isOnline ? "🟢 Online" : "🔴 Offline"}
        </div>

        {error && (
          <div className="alert alert-danger mx-auto mt-3" style={{ maxWidth: "600px" }}>
            <strong>Error:</strong> {error}
            <button
              className="btn btn-sm btn-outline-danger ms-2"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="dashboard-card">
          <TripForm
            onSubmit={handleTripFormSubmit}
            loading={loading}
            onReset={resetTrip}
            initialData={tripData}
          />
        </div>

        <div className="trip-map-container">
          <TripPlannerMap
            tripData={tripData}
            tripPlan={tripPlan}
            onLocationSelect={(type, location) => {
              setTripData((prev) => ({ ...prev, [type]: location }));
            }}
          />
        </div>

        {tripPlan && (
          <div className="dashboard-card">
            <TripResults tripPlan={tripPlan} />
          </div>
        )}

        {loading && (
          <div className="text-center mt-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Calculating trip plan...</span>
            </div>
            <p className="mt-2">Planning your trip...</p>
          </div>
        )}
      </div>
    </div>
  );
}
