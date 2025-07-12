import React, { useState } from 'react';
import './EvCalculator.css';

const EvCalculator = () => {
    const [distance, setDistance] = useState('');
    const [efficiency, setEfficiency] = useState('15');
    const [customEfficiency, setCustomEfficiency] = useState('');
    const [gridFactor, setGridFactor] = useState('820');
    const [customGridFactor, setCustomGridFactor] = useState('');
    const [results, setResults] = useState(null);

    const handleEfficiencyChange = (e) => {
        setEfficiency(e.target.value);
        if (e.target.value !== 'custom') {
            setCustomEfficiency('');
        }
    };

    const handleGridFactorChange = (e) => {
        setGridFactor(e.target.value);
        if (e.target.value !== 'custom') {
            setCustomGridFactor('');
        }
    };

    const calculateCarbonFootprint = (e) => {
        e.preventDefault();

        const parsedDistance = parseFloat(distance);
        let parsedEfficiency = efficiency === 'custom' ? parseFloat(customEfficiency) : parseFloat(efficiency);
        let parsedGridFactor = gridFactor === 'custom' ? parseFloat(customGridFactor) : parseFloat(gridFactor);

        if (!parsedDistance || !parsedEfficiency || !parsedGridFactor) {
            alert('Please fill in all fields');
            return;
        }

        const energyConsumption = (parsedDistance * parsedEfficiency) / 100;
        const co2EmissionsKg = (energyConsumption * parsedGridFactor) / 1000;

        const petrolCar = parsedDistance * 180;
        const dieselCar = parsedDistance * 160;

        setResults({
            distance: parsedDistance,
            energyConsumption,
            co2EmissionsKg,
            comparisons: {
                petrol: petrolCar / 1000,
                diesel: dieselCar / 1000
            }
        });
    };

    return (
        <div className="container">
            <button className="back-btn" onClick={() => window.location.href = '/'}>← Back to Main</button>
            <h1>🌱 EV Carbon Footprint Calculator</h1>
            <div className="calculator-section">
                <form onSubmit={calculateCarbonFootprint}>
                    <div className="form-group">
                        <label htmlFor="distance">Distance (km)</label>
                        <input type="number" id="distance" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="Enter distance in kilometers" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="efficiency">Vehicle Efficiency (kWh/100km)</label>
                        <select id="efficiency" value={efficiency} onChange={handleEfficiencyChange}>
                            <option value="15">Compact EV (15 kWh/100km)</option>
                            <option value="18">Mid-size EV (18 kWh/100km)</option>
                            <option value="22">Large EV (22 kWh/100km)</option>
                            <option value="25">SUV/Truck EV (25 kWh/100km)</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>
                    {efficiency === 'custom' &&
                        <div className="form-group">
                            <label htmlFor="customEfficiency">Custom Efficiency (kWh/100km)</label>
                            <input type="number" id="customEfficiency" value={customEfficiency} onChange={(e) => setCustomEfficiency(e.target.value)} placeholder="Enter custom efficiency" />
                        </div>
                    }
                    <div className="form-group">
                        <label htmlFor="gridFactor">Grid Carbon Intensity (g CO2/kWh)</label>
                        <select id="gridFactor" value={gridFactor} onChange={handleGridFactorChange}>
                            <option value="820">India Average (820 g CO2/kWh)</option>
                            <option value="400">EU Average (400 g CO2/kWh)</option>
                            <option value="500">USA Average (500 g CO2/kWh)</option>
                            <option value="200">France (200 g CO2/kWh)</option>
                            <option value="50">Norway (50 g CO2/kWh)</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>
                    {gridFactor === 'custom' &&
                        <div className="form-group">
                            <label htmlFor="customGridFactor">Custom Grid Factor (g CO2/kWh)</label>
                            <input type="number" id="customGridFactor" value={customGridFactor} onChange={(e) => setCustomGridFactor(e.target.value)} placeholder="Enter custom grid factor" />
                        </div>
                    }
                    <button type="submit" className="calculate-btn">🔋 Calculate Carbon Footprint</button>
                </form>
                {results && (
                    <div id="result" className="result show">
                        <div className="resultContent">
                            <h4>🔋 Your Trip Analysis</h4>
                            <p><strong>Distance:</strong> {results.distance} km</p>
                            <p><strong>Energy Consumption:</strong> {results.energyConsumption.toFixed(2)} kWh</p>
                            <p><strong>CO2 Emissions:</strong> <span className="highlight">{results.co2EmissionsKg.toFixed(3)} kg CO2</span></p>
                            <p><strong>CO2 per km:</strong> {(results.co2EmissionsKg/results.distance).toFixed(3)} kg CO2/km</p>
                        </div>
                        <div className="comparison">
                            <div className="comparison-item">
                                <h4>🚗 Your EV</h4>
                                <p><strong>{results.co2EmissionsKg.toFixed(3)} kg CO2</strong></p>
                                <p>Clean & Efficient!</p>
                            </div>
                            <div className="comparison-item">
                                <h4>⛽ Petrol Car</h4>
                                <p><strong>{results.comparisons.petrol.toFixed(3)} kg CO2</strong></p>
                                <p>{(results.comparisons.petrol/results.co2EmissionsKg).toFixed(1)}x more emissions</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EvCalculator;

