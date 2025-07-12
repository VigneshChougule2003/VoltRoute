import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EvCalculator.css';

const EvCalculator = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    distance: '',
    efficiency: '18',
    customEfficiency: '',
    gridFactor: '820',
    customGridFactor: ''
  });
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateCarbonFootprint = (e) => {
    e.preventDefault();
    
    const distance = parseFloat(formData.distance);
    const efficiency = formData.efficiency === 'custom' ? parseFloat(formData.customEfficiency) : parseFloat(formData.efficiency);
    const gridFactor = formData.gridFactor === 'custom' ? parseFloat(formData.customGridFactor) : parseFloat(formData.gridFactor);

    if (!distance || !efficiency || !gridFactor) {
      alert('Please fill in all required fields');
      return;
    }

    // Calculate EV carbon footprint
    const energyConsumption = (distance * efficiency) / 100; // kWh
    const evCarbonFootprint = (energyConsumption * gridFactor) / 1000; // kg CO2

    // Calculate petrol car equivalent (assuming 180g CO2/km)
    const petrolCarFootprint = distance * 0.18; // kg CO2

    // Calculate savings
    const carbonSavings = petrolCarFootprint - evCarbonFootprint;
    const percentageSavings = ((carbonSavings / petrolCarFootprint) * 100).toFixed(1);

    const calculationResult = {
      distance,
      energyConsumption: energyConsumption.toFixed(2),
      evCarbonFootprint: evCarbonFootprint.toFixed(2),
      petrolCarFootprint: petrolCarFootprint.toFixed(2),
      carbonSavings: carbonSavings.toFixed(2),
      percentageSavings,
      gridFactor,
      efficiency
    };

    setResult(calculationResult);
    setShowResult(true);
  };

  const goBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="ev-calculator-container">
      <div className="container">
        <button className="back-btn" onClick={goBack}>
          ← Back to Dashboard
        </button>
        <h1>🌱 EV Carbon Footprint Calculator</h1>
        <div className="calculator-section">
          <h2>Calculate Your EV's Carbon Footprint</h2>
          <form onSubmit={calculateCarbonFootprint}>
            <div className="form-group">
              <label htmlFor="distance">Distance (km)</label>
              <input
                type="number"
                id="distance"
                name="distance"
                value={formData.distance}
                onChange={handleInputChange}
                placeholder="Enter distance in kilometers"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="efficiency">Vehicle Efficiency (kWh/100km)</label>
              <select id="efficiency" name="efficiency" value={formData.efficiency} onChange={handleInputChange}>
                <option value="15">Compact EV (15 kWh/100km)</option>
                <option value="18">Mid-size EV (18 kWh/100km)</option>
                <option value="22">Large EV (22 kWh/100km)</option>
                <option value="25">SUV/Truck EV (25 kWh/100km)</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            {formData.efficiency === 'custom' && (
              <div className="form-group">
                <label htmlFor="customEfficiency">Custom Efficiency (kWh/100km)</label>
                <input
                  type="number"
                  id="customEfficiency"
                  name="customEfficiency"
                  value={formData.customEfficiency}
                  onChange={handleInputChange}
                  placeholder="Enter custom efficiency"
                />
              </div>
            )}
            <div className="form-group">
              <label htmlFor="gridFactor">Grid Carbon Intensity (g CO2/kWh)</label>
              <select id="gridFactor" name="gridFactor" value={formData.gridFactor} onChange={handleInputChange}>
                <option value="820">India Average (820 g CO2/kWh)</option>
                <option value="400">EU Average (400 g CO2/kWh)</option>
                <option value="500">USA Average (500 g CO2/kWh)</option>
                <option value="200">France (200 g CO2/kWh)</option>
                <option value="50">Norway (50 g CO2/kWh)</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            {formData.gridFactor === 'custom' && (
              <div className="form-group">
                <label htmlFor="customGridFactor">Custom Grid Factor (g CO2/kWh)</label>
                <input
                  type="number"
                  id="customGridFactor"
                  name="customGridFactor"
                  value={formData.customGridFactor}
                  onChange={handleInputChange}
                  placeholder="Enter custom grid factor"
                />
              </div>
            )}
            <button type="submit" className="calculate-btn">
              🔋 Calculate Carbon Footprint
            </button>
          </form>
          {showResult && result && (
            <div className="result show">
              <h3>Your EV Carbon Footprint Results</h3>
              <div className="result-content">
                <p><strong>Trip Distance:</strong> {result.distance} km</p>
                <p><strong>Energy Consumption:</strong> {result.energyConsumption} kWh</p>
                <p><strong>EV CO2 Footprint:</strong> {result.evCarbonFootprint} kg</p>
                <p><strong>Petrol Car Equivalent:</strong> {result.petrolCarFootprint} kg</p>
                <p><strong>Carbon Savings:</strong> {result.carbonSavings} kg ({result.percentageSavings}%)</p>
              </div>
              <div className="comparison">
                <div className="comparison-item">
                  <h3>Electric Vehicle</h3>
                  <p>{result.evCarbonFootprint} kg CO2</p>
                </div>
                <div className="comparison-item">
                  <h3>Petrol Car</h3>
                  <p>{result.petrolCarFootprint} kg CO2</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="resources-section">
          <h2>🌍 Real-Time Sustainability Resources</h2>
          <div className="resources-grid">
            <div className="resource-card">
              <h3>🔌 Real-Time Grid Data</h3>
              <p>
                <strong>WattTime:</strong>{' '}
                <a href="https://www.watttime.org" target="_blank" rel="noopener noreferrer">
                  watttime.org
                </a>
              </p>
              <p>Track real-time carbon intensity of electricity grids worldwide</p>
              <p>
                <strong>ElectricityMap:</strong>{' '}
                <a href="https://electricitymaps.com" target="_blank" rel="noopener noreferrer">
                  electricitymaps.com
                </a>
              </p>
              <p>Live CO2 emissions of electricity consumption by country</p>
            </div>
            <div className="resource-card">
              <h3>🚗 EV Charging & Planning</h3>
              <p>
                <strong>PlugShare:</strong>{' '}
                <a href="https://www.plugshare.com" target="_blank" rel="noopener noreferrer">
                  plugshare.com
                </a>
              </p>
              <p>Find charging stations and plan sustainable routes</p>
              <p>
                <strong>ChargePoint:</strong>{' '}
                <a href="https://www.chargepoint.com" target="_blank" rel="noopener noreferrer">
                  chargepoint.com
                </a>
              </p>
              <p>Charging network with renewable energy tracking</p>
            </div>
            <div className="resource-card">
              <h3>📊 Carbon Tracking Apps</h3>
              <p>
                <strong>My Climate:</strong>{' '}
                <a href="https://www.myclimate.org" target="_blank" rel="noopener noreferrer">
                  myclimate.org
                </a>
              </p>
              <p>Calculate and offset your carbon footprint</p>
              <p>
                <strong>Joro:</strong>{' '}
                <a href="https://www.joro.tech" target="_blank" rel="noopener noreferrer">
                  joro.tech
                </a>
              </p>
              <p>Track your daily carbon footprint automatically</p>
            </div>
          </div>
        </div>
        <div className="tips-section">
          <h2>💡 Tips for Reducing Your EV Carbon Footprint</h2>
          <div className="tips-grid">
            <div className="tip-item">
              <div className="icon">🌞</div>
              <h3>Charge with Solar</h3>
              <p>Use solar panels or choose green energy providers to reduce grid carbon intensity</p>
            </div>
            <div className="tip-item">
              <div className="icon">⚡</div>
              <h3>Smart Charging</h3>
              <p>Charge during off-peak hours when the grid is cleaner</p>
            </div>
            <div className="tip-item">
              <div className="icon">🚗</div>
              <h3>Efficient Driving</h3>
              <p>Drive efficiently to maximize your EV's range and reduce energy consumption</p>
            </div>
            <div className="tip-item">
              <div className="icon">🔋</div>
              <h3>Battery Care</h3>
              <p>Maintain your battery properly to ensure optimal efficiency throughout its life</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvCalculator;
