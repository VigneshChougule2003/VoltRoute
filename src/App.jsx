import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import './App.css';  // Import CSS here

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`voltroute-page ${darkMode ? "dark" : "light"}`}>
      {/* Theme Toggle Button */}
      <button
        className="theme-toggle"
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
      </button>

      <div className="animated-bg"></div>

      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center px-3">
        <motion.div
          className="voltroute-center-card shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <h1 className="display-4 fw-bold mb-3 text-gradient text-center">
            ⚡ VoltRoute
          </h1>
          <p className="lead mb-4 text-center">
            Revolutionizing electric mobility with real-time charging insights, AI-powered routing,
            and seamless battery swapping coordination.
          </p>
          <div className="d-flex flex-column gap-3">
            <Link to="/login" className="btn btn-glow btn-success btn-lg w-100">
              Log In
            </Link>
            <Link to="/signup" className="btn btn-glow btn-outline-light btn-lg w-100">
              Sign Up
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="position-absolute bottom-0 start-0 end-0 text-center py-3 small">
        ⚙️ Built for ChargeSmart Hackathon • SDG Goals: 7, 9, 11, 13, 17
      </footer>
    </div>
  );
}
