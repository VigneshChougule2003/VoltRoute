// src/components/Filters.jsx
import React from "react";

export default function Filters({ filters, setFilters }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card p-3">
      <h5 className="text-secondary mb-3">🔄 Filters</h5>

      <div className="mb-2">
        <label className="form-label">Connector Type</label>
        <select
          className="form-select"
          name="connector"
          value={filters.connector}
          onChange={handleChange}
        >
          <option value="">All</option>
          <option value="CHAdeMO">CHAdeMO</option>
          <option value="CCS">CCS</option>
          <option value="Type 2">Type 2</option>
        </select>
      </div>

      <div>
        <label className="form-label">Availability</label>
        <select
          className="form-select"
          name="available"
          value={filters.available}
          onChange={handleChange}
        >
          <option value="">All</option>
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
      </div>
    </div>
  );
}