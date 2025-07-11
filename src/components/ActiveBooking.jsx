import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { getUserActiveBooking, cancelBooking } from "../utils/bookingUtils";
import { useNavigate } from "react-router-dom";

export default function ActiveBooking({ onBookingUpdate }) {
  const [activeBooking, setActiveBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveBooking();
  }, []);
  
  useEffect(() => {
    // Refresh every 30 seconds to check for updates
    const interval = setInterval(fetchActiveBooking, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveBooking = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log("No user logged in");
        return;
      }

      const booking = await getUserActiveBooking(user.uid);
      setActiveBooking(booking);
    } catch (error) {
      console.error("Error fetching active booking:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchActiveBooking();
  };

  const handleCancelBooking = async () => {
    if (!activeBooking || !window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setCancelling(true);
    try {
      await cancelBooking(activeBooking.id);
      setActiveBooking(null);
      alert("Booking cancelled successfully");
      
      // Notify parent component to refresh data
      if (onBookingUpdate) {
        onBookingUpdate();
      }
    } catch (error) {
      alert(`Failed to cancel booking: ${error.message}`);
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (timestamp) => {
    return timestamp?.toDate?.()?.toLocaleString() || "N/A";
  };

  const getTimeRemaining = () => {
    if (!activeBooking || !activeBooking.endTime) return "N/A";
    
    const now = new Date();
    const endTime = activeBooking.endTime.toDate();
    const timeDiff = endTime - now;
    
    if (timeDiff <= 0) return "Expired";
    
    const minutes = Math.floor(timeDiff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  if (loading) {
    return (
      <div className="card p-3">
        <div className="d-flex justify-content-between align-items-center">
          <h5>🔄 Your Bookings</h5>
          <button 
            className="btn btn-sm btn-outline-primary" 
            onClick={handleManualRefresh}
            disabled={refreshing}
          >
            {refreshing ? "⏳" : "🔄"}
          </button>
        </div>
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  if (!activeBooking) {
    return (
      <div className="card p-3">
        <div className="d-flex justify-content-between align-items-center">
          <h5>📅 Your Bookings</h5>
          <button 
            className="btn btn-sm btn-outline-primary" 
            onClick={handleManualRefresh}
            disabled={refreshing}
          >
            {refreshing ? "⏳" : "🔄"}
          </button>
        </div>
        <p className="text-muted">No active booking</p>
        <small className="text-success">✅ You can book a new charging slot</small>
        
        <div className="mt-3">
          <button 
            className="btn btn-sm btn-outline-primary w-100"
            onClick={() => navigate("/history")}
          >
            📅 View Booking History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-3">
      <div className="d-flex justify-content-between align-items-center">
        <h5>🔋 Your Bookings</h5>
        <button 
          className="btn btn-sm btn-outline-primary" 
          onClick={handleManualRefresh}
          disabled={refreshing}
        >
          {refreshing ? "⏳" : "🔄"}
        </button>
      </div>
      <div className="mb-3">
        <strong>{activeBooking.stationTitle}</strong>
        <br />
        <small className="text-muted">
          📅 {formatDate(activeBooking.startTime)} - {formatDate(activeBooking.endTime)}
        </small>
        <br />
        <small>
          ⏱ Time remaining: <span className="text-warning">{getTimeRemaining()}</span>
        </small>
        <br />
        <small>
          🔋 {activeBooking.batteryPercentage}% → 100% ({activeBooking.batterySize} kWh)
        </small>
        <br />
        <small>
          ⚡ {activeBooking.chargingTimeMinutes}m charging + 15m buffer
        </small>
        <br />
        <span className="badge bg-success">Active</span>
      </div>
      
      <div className="d-flex gap-2">
        <button
          className="btn btn-sm btn-danger"
          onClick={handleCancelBooking}
          disabled={cancelling}
        >
          {cancelling ? "Cancelling..." : "Cancel Booking"}
        </button>
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={fetchActiveBooking}
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>
      
      <div className="mt-2">
        <small className="text-warning">
          ⚠️ You cannot book another slot until this one is completed or cancelled.
        </small>
      </div>
    </div>
  );
}
