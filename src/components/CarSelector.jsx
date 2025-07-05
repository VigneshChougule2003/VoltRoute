// src/components/CarSelector.jsx
import { useState } from "react";

const carData = {
  "Tata Nexon": [30, 40],
  "MG ZS EV": [44.5],
  "Hyundai Kona": [39.2],
};

export default function CarSelector({ selectedCar, setSelectedCar }) {
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedBattery, setSelectedBattery] = useState(null);

  const handleModelChange = (e) => {
    const model = e.target.value;
    setSelectedModel(model);
    setSelectedBattery(null);
    setSelectedCar(null);
  };

  const handleBatteryChange = (e) => {
    const battery = parseFloat(e.target.value);
    setSelectedBattery(battery);
    setSelectedCar({ model: selectedModel, batterySize: battery });
  };

  return (
    <div className="card p-3">
      <h5>Select Your EV Model</h5>

      <select className="form-select mb-2" value={selectedModel} onChange={handleModelChange}>
        <option value="">-- Choose Model --</option>
        {Object.keys(carData).map((model) => (
          <option key={model} value={model}>{model}</option>
        ))}
      </select>

      {selectedModel && (
        <select className="form-select" value={selectedBattery || ""} onChange={handleBatteryChange}>
          <option value="">-- Choose Battery Variant --</option>
          {carData[selectedModel].map((battery) => (
            <option key={battery} value={battery}>{battery} kWh</option>
          ))}
        </select>
      )}
    </div>
  );
}
