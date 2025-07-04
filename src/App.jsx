import { Link } from "react-router-dom";

export default function App() {
  return (
    <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center px-3">
      <div className="row align-items-center">
        {/* Left Content */}
        <div className="col-md-6 text-center text-md-start">
          <h1 className="display-3 fw-bold text-primary mb-3">
            ⚡ VoltRoute
          </h1>
          <p className="lead text-secondary mb-4">
            Revolutionizing electric mobility with real-time charging insights, AI-powered routing, and seamless battery swapping coordination.
          </p>
          <div className="d-flex gap-3 justify-content-center justify-content-md-start">
            <Link to="/login" className="btn btn-success btn-lg px-4">
              Log In
            </Link>
            <Link to="/signup" className="btn btn-outline-primary btn-lg px-4">
              Sign Up
            </Link>
          </div>
        </div>

        {/* Right Illustration */}
        <div className="col-md-6 d-none d-md-block">
          <img
            src="https://cdn.dribbble.com/users/1191194/screenshots/14972964/media/60fbc1125f8c48f9dc7d398bd9467741.png" // Example EV image
            alt="EV Illustration"
            className="img-fluid"
            style={{ maxHeight: "450px", borderRadius: "1rem" }}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="position-absolute bottom-0 start-0 end-0 text-center py-3 small text-muted">
        ⚙️ Built for ChargeSmart Hackathon • SDG Goals: 7, 9, 11, 13, 17
      </footer>
    </div>
  );
}
