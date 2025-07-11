import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { cancelBooking } from "../utils/bookingUtils";
import "./Dashboard.css";

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookingHistory();
  }, []);

  const fetchBookingHistory = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      const bookingsRef = collection(db, "bookings");
      const q = query(
        bookingsRef,
        where("userId", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);
      const userBookings = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => {
          const aTime = a.createdAt?.toMillis() || 0;
          const bTime = b.createdAt?.toMillis() || 0;
          return bTime - aTime;
        });

      setBookings(userBookings);
    } catch (error) {
      console.error("Error fetching booking history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setCancelling(prev => ({ ...prev, [bookingId]: true }));
    try {
      await cancelBooking(bookingId);
      await fetchBookingHistory(); // Refresh the list
      alert("Booking cancelled successfully");
    } catch (error) {
      alert(`Failed to cancel booking: ${error.message}`);
    } finally {
      setCancelling(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const formatDate = (timestamp) => {
    return timestamp?.toDate?.()?.toLocaleString() || "N/A";
  };

  const getTimeRemaining = (booking) => {
    if (!booking.endTime) return "N/A";
    
    const now = new Date();
    const endTime = booking.endTime.toDate();
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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success';
      case 'cancelled':
        return 'bg-warning';
      case 'completed':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  const isActiveBooking = (booking) => {
    return booking.status === 'active' && 
           booking.endTime && 
           booking.endTime.toDate() > new Date();
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-content">
          <h2 className="dashboard-title">📅 Booking History</h2>
          <div className="text-center">
            <p>Loading booking history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <button 
        className="btn btn-outline-light position-absolute" 
        style={{ top: '1rem', left: '1rem' }}
        onClick={() => navigate("/dashboard")}
      >
        ← Back to Dashboard
      </button>

      <div className="dashboard-content">
        <h2 className="dashboard-title">📅 Your Booking History</h2>

        {bookings.length === 0 ? (
          <div className="dashboard-card text-center">
            <h5>No bookings found</h5>
            <p className="text-muted">You haven't made any bookings yet.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard to Book
            </button>
          </div>
        ) : (
          <div className="row">
            {bookings.map((booking) => (
              <div key={booking.id} className="col-md-6 col-lg-4 mb-4">
                <div className="dashboard-card h-100">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h6 className="mb-0">{booking.stationTitle}</h6>
                    <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="mb-3">
                    <small className="text-muted d-block">
                      📅 Start: {formatDate(booking.startTime)}
                    </small>
                    <small className="text-muted d-block">
                      📅 End: {formatDate(booking.endTime)}
                    </small>
                    {isActiveBooking(booking) && (
                      <small className="text-warning d-block">
                        ⏱ Time remaining: {getTimeRemaining(booking)}
                      </small>
                    )}
                  </div>

                  <div className="mb-3">
                    <small className="d-block">
                      ⚡ Charging: {booking.chargingTimeMinutes} min
                    </small>
                    <small className="d-block">
                      🕒 Total: {booking.totalDuration} min (includes 15min buffer)
                    </small>
                    <small className="d-block">
                      🔋 Battery: {booking.batteryPercentage}% → 100%
                    </small>
                    <small className="d-block">
                      📊 Capacity: {booking.batterySize} kWh
                    </small>
                  </div>

                  <div className="mt-auto">
                    <small className="text-muted d-block mb-2">
                      Created: {formatDate(booking.createdAt)}
                    </small>
                    
                    {isActiveBooking(booking) && (
                      <button
                        className="btn btn-sm btn-danger w-100"
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={cancelling[booking.id]}
                      >
                        {cancelling[booking.id] ? "Cancelling..." : "Cancel Booking"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-4">
          <button 
            className="btn btn-outline-primary"
            onClick={fetchBookingHistory}
            style={{ marginRight: '1rem' }}
          >
            🔄 Refresh
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => navigate("/dashboard")}
          >
            📍 Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
