import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const bookingsRef = collection(db, "bookings");
      const q = query(
        bookingsRef,
        where("userId", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);
      const userBookings = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => {
          // Sort by createdAt in descending order (newest first)
          const aTime = a.createdAt?.toMillis() || 0;
          const bTime = b.createdAt?.toMillis() || 0;
          return bTime - aTime;
        });

      setBookings(userBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return timestamp?.toDate?.()?.toLocaleString() || "N/A";
  };

  if (loading) {
    return (
      <div className="card p-3">
        <h5>📅 Your Bookings</h5>
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="card p-3">
      <h5>📅 Your Bookings</h5>
      {bookings.length === 0 ? (
        <p className="text-muted">No bookings found</p>
      ) : (
        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
          {bookings.map((booking) => (
            <div key={booking.id} className="mb-3 p-2 border rounded">
              <strong>{booking.stationTitle}</strong>
              <br />
              <small className="text-muted">
                📅 {formatDate(booking.startTime)} - {formatDate(booking.endTime)}
              </small>
              <br />
              <small>
                ⚡ {booking.chargingTimeMinutes} min charging + 15 min buffer
              </small>
              <br />
              <small>
                🔋 {booking.batteryPercentage}% → 100% ({booking.batterySize} kWh)
              </small>
              <br />
              <span className={`badge ${booking.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                {booking.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
