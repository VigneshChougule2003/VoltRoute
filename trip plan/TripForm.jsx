import { useState, useEffect } from "react";

const carData = {
  "Tata Nexon": [
    { batterySize: 30, claimedRange: 310 },
    { batterySize: 40, claimedRange: 438 }
  ],
  "MG ZS EV": [
    { batterySize: 44.5, claimedRange: 461 }
  ],
  "Hyundai Kona": [
    { batterySize: 39.2, claimedRange: 452 }
  ],
};

export default function TripForm({ onSubmit, loading, onReset, initialData }) {
  const [formData, setFormData] = useState({
    sourceText: "",
    destinationText: "",
    selectedModel: "",
    selectedVariant: null,
    currentBattery: 80
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        selectedModel: initialData.selectedCar?.model || "",
        selectedVariant: initialData.selectedCar || null,
        currentBattery: initialData.currentBattery || 80
      }));
    }
  }, [initialData]);

  const handleModelChange = (e) => {
    const model = e.target.value;
    setFormData(prev => ({
      ...prev,
      selectedModel: model,
      selectedVariant: null
    }));
  };

  const handleVariantChange = (e) => {
    const selectedIndex = parseInt(e.target.value);
    const selectedVariant = carData[formData.selectedModel][selectedIndex];
    const realRange = Math.round(selectedVariant.claimedRange * 0.6);
    
    const carData_full = {
      model: formData.selectedModel,
      batterySize: selectedVariant.batterySize,
      claimedRange: selectedVariant.claimedRange,
      realRange: realRange
    };

    setFormData(prev => ({
      ...prev,
      selectedVariant: carData_full
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.sourceText || !formData.destinationText) {
      alert("Please enter both source and destination");
      return;
    }
    
    if (!formData.selectedVariant) {
      alert("Please select your car model and variant");
      return;
    }

    const tripData = {
      sourceText: formData.sourceText,
      destinationText: formData.destinationText,
      selectedCar: formData.selectedVariant,
      currentBattery: formData.currentBattery
    };

    onSubmit(tripData);
  };

  return (
    <div className="p-3">
      <h5 className="mb-4">🚗 Plan Your Trip</h5>
      
      <form onSubmit={handleSubmit}>
        {/* Source */}
        <div className="mb-3">
          <label className="form-label">📍 Source</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter starting location"
            value={formData.sourceText}
            onChange={(e) => setFormData(prev => ({ ...prev, sourceText: e.target.value }))}
            required
          />
        </div>

        {/* Destination */}
        <div className="mb-3">
          <label className="form-label">🎯 Destination</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter destination"
            value={formData.destinationText}
            onChange={(e) => setFormData(prev => ({ ...prev, destinationText: e.target.value }))}
            required
          />
        </div>

        {/* Car Model Selection */}
        <div className="mb-3">
          <label className="form-label">🚙 Car Model</label>
          <select 
            className="form-select" 
            value={formData.selectedModel} 
            onChange={handleModelChange}
            required
          >
            <option value="">-- Choose Model --</option>
            {Object.keys(carData).map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>

        {/* Battery Variant */}
        {formData.selectedModel && (
          <div className="mb-3">
            <label className="form-label">🔋 Battery Variant</label>
            <select 
              className="form-select" 
              value={formData.selectedVariant ? carData[formData.selectedModel].findIndex(v => 
                v.batterySize === formData.selectedVariant.batterySize
              ) : ""} 
              onChange={handleVariantChange}
              required
            >
              <option value="">-- Choose Battery Variant --</option>
              {carData[formData.selectedModel].map((variant, index) => {
                const realRange = Math.round(variant.claimedRange * 0.6);
                return (
                  <option key={index} value={index}>
                    {variant.batterySize} kWh - {variant.claimedRange}km claimed ({realRange}km real)
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Current Battery Level */}
        <div className="mb-3">
          <label className="form-label">⚡ Current Battery Level: {formData.currentBattery}%</label>
          <input
            type="range"
            className="form-range"
            min="5"
            max="100"
            value={formData.currentBattery}
            onChange={(e) => setFormData(prev => ({ ...prev, currentBattery: parseInt(e.target.value) }))}
          />
          <div className="d-flex justify-content-between small text-muted">
            <span>5%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Selected Car Info */}
        {formData.selectedVariant && (
          <div className="alert alert-info small">
            <strong>Selected:</strong> {formData.selectedVariant.model}<br/>
            <strong>Battery:</strong> {formData.selectedVariant.batterySize} kWh<br/>
            <strong>Real Range:</strong> {formData.selectedVariant.realRange} km<br/>
            <strong>Current Range:</strong> {Math.round((formData.selectedVariant.realRange * formData.currentBattery) / 100)} km
          </div>
        )}

        {/* Buttons */}
        <div className="d-grid gap-2">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "⏳ Planning..." : "🗺️ Plan Trip"}
          </button>
          
          <button 
            type="button" 
            className="btn btn-outline-secondary"
            onClick={onReset}
            disabled={loading}
          >
            🔄 Reset
          </button>
        </div>
      </form>
    </div>
  );
}
