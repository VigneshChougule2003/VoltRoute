// src/components/Filters.jsx
export default function Filters({ filters, setFilters, onRefresh }) {
  const connectorTypes = [
    { id: "", name: "All" },
    { id: 1, name: "Type 1 (J1772)" },
    { id: 2, name: "CHAdeMO" },
    { id: 25, name: "Type 2 (Mennekes)" },
    { id: 33, name: "CCS (Type 1)" },
    { id: 1036, name: "CCS (Type 2)" },
  ];

  return (
    <div>
      <label>🔌 Connector Type:</label>
      <select
        className="form-select mb-2"
        value={filters.connector}
        onChange={(e) =>
          setFilters({ ...filters, connector: e.target.value })
        }
      >
        {connectorTypes.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </select>

      <label>⚡ Availability:</label>
      <select
        className="form-select mb-2"
        value={filters.available}
        onChange={(e) =>
          setFilters({ ...filters, available: e.target.value })
        }
      >
        <option value="">All</option>
        <option value="Available">Only Available</option>
        <option value="Unavailable">Only Unavailable</option>
      </select>

      <button className="btn btn-outline-primary w-100" onClick={onRefresh}>
        🔄 Refresh Stations
      </button>
    </div>
  );
}
