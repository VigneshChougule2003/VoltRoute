import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import App from "./App";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from './pages/Dashboard';
import EvCalculatorPage from './pages/EvCalculator';
import BookingHistory from "./pages/BookingHistory";
import TripPlanner from "./pages/TripPlanner";


ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/history" element={<BookingHistory />} />
      <Route path="/trip-planner" element={<TripPlanner />} />
      <Route path="/ev-calculator" element={<EvCalculatorPage />} />
    </Routes>
  </BrowserRouter>
);
