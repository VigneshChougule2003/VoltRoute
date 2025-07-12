// Trip planning utilities

/**
 * Calculate haversine distance between two points
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Common city name corrections for India
 */
const cityCorrections = {
  'benglore': 'bangalore',
  'bangaluru': 'bangalore',
  'bombay': 'mumbai',
  'calcutta': 'kolkata',
  'madras': 'chennai',
  'poona': 'pune',
  'mysore': 'mysuru',
  'trivandrum': 'thiruvananthapuram'
};

/**
 * Geocode location using Nominatim API with better error handling
 */
async function geocodeLocation(locationText) {
  try {
    // Apply city corrections
    let correctedLocation = locationText.toLowerCase();
    for (const [wrong, correct] of Object.entries(cityCorrections)) {
      if (correctedLocation.includes(wrong)) {
        correctedLocation = correctedLocation.replace(wrong, correct);
        console.log(`Corrected location: ${locationText} → ${correctedLocation}`);
      }
    }
    
    // Try original location first
    let response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationText)}&countrycodes=in&limit=3`
    );
    let data = await response.json();
    
    // If no results, try corrected location
    if (!data || data.length === 0) {
      response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(correctedLocation)}&countrycodes=in&limit=3`
      );
      data = await response.json();
    }
    
    // If still no results, try with "India" appended
    if (!data || data.length === 0) {
      response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationText + ', India')}&limit=3`
      );
      data = await response.json();
    }
    
    if (data && data.length > 0) {
      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        display_name: result.display_name
      };
    }
    
    // Provide helpful error message with suggestions
    let suggestions = '';
    if (locationText.toLowerCase().includes('bangalore') || locationText.toLowerCase().includes('bengaluru')) {
      suggestions = ' Try "Bangalore" or "Bengaluru, Karnataka, India"';
    } else if (locationText.toLowerCase().includes('mumbai') || locationText.toLowerCase().includes('bombay')) {
      suggestions = ' Try "Mumbai, Maharashtra, India"';
    } else if (locationText.toLowerCase().includes('delhi')) {
      suggestions = ' Try "New Delhi, India" or "Delhi, India"';
    } else {
      suggestions = ` Try adding the state name like "${locationText}, [State], India"`;
    }
    
    throw new Error(`Location "${locationText}" not found.${suggestions}`);
  } catch (error) {
    console.error("Geocoding error:", error);
    throw error;
  }
}

/**
 * Get route between two points using OSRM
 */
async function getRoute(sourceCoords, destCoords) {
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${sourceCoords.lng},${sourceCoords.lat};${destCoords.lng},${destCoords.lat}?overview=full&geometries=geojson`
    );
    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]); // Convert to [lat, lng]
      
      return {
        coordinates,
        distance: Math.round(route.distance / 1000), // Convert to km
        duration: Math.round(route.duration / 60) // Convert to minutes
      };
    }
    throw new Error("No route found");
  } catch (error) {
    console.error("Routing error:", error);
    throw error;
  }
}

/**
 * Check if local server is available
 */
async function checkServerAvailability() {
  try {
    const response = await fetch('http://localhost:5000/api/openchargemap?latitude=20&longitude=77&distance=10&maxresults=1', {
      method: 'GET',
      timeout: 5000
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Generate mock charging stations along a route for demonstration
 */
function generateMockStationsAlongRoute(routeCoordinates, maxDistance) {
  const mockStations = [];
  const routeLength = routeCoordinates.length;
  
  // Generate 3-5 mock stations along the route
  const stationCount = Math.min(5, Math.max(3, Math.floor(routeLength / 50)));
  
  for (let i = 0; i < stationCount; i++) {
    const routeIndex = Math.floor((routeLength / (stationCount + 1)) * (i + 1));
    const routePoint = routeCoordinates[routeIndex] || routeCoordinates[Math.floor(routeLength / 2)];
    
    // Offset the station slightly from the route
    const offsetLat = routePoint[0] + (Math.random() - 0.5) * 0.1;
    const offsetLng = routePoint[1] + (Math.random() - 0.5) * 0.1;
    
    const station = {
      ID: `mock_${i + 1}`,
      AddressInfo: {
        ID: `mock_${i + 1}`,
        Title: `Demo Charging Station ${i + 1}`,
        AddressLine1: `Highway Service Area ${i + 1}`,
        Town: "Demo City",
        StateOrProvince: "Demo State",
        Latitude: offsetLat,
        Longitude: offsetLng,
        Distance: calculateDistance(routePoint[0], routePoint[1], offsetLat, offsetLng)
      },
      StatusType: { IsOperational: true },
      Connections: [{ 
        PowerKW: [22, 50, 150][Math.floor(Math.random() * 3)], 
        ConnectionType: { Title: ["Type 2", "CCS", "CHAdeMO"][Math.floor(Math.random() * 3)] }
      }],
      distanceFromRoute: Math.random() * maxDistance * 0.8
    };
    
    mockStations.push(station);
  }
  
  return mockStations.sort((a, b) => a.distanceFromRoute - b.distanceFromRoute);
}

/**
 * Find charging stations near route
 */
async function findChargersNearRoute(routeCoordinates, maxDistance = 15) {
  try {
    // Check if server is available
    const serverAvailable = await checkServerAvailability();
    
    if (!serverAvailable) {
      console.warn("Local server not available, using fallback charging stations");
      // Generate mock stations along the route
      const mockStations = generateMockStationsAlongRoute(routeCoordinates, maxDistance);
      return mockStations;
    }
    
    // Get bounding box of the route
    const lats = routeCoordinates.map(coord => coord[0]);
    const lngs = routeCoordinates.map(coord => coord[1]);
    const minLat = Math.min(...lats) - 0.2;
    const maxLat = Math.max(...lats) + 0.2;
    const minLng = Math.min(...lngs) - 0.2;
    const maxLng = Math.max(...lngs) + 0.2;
    
    // Fetch chargers in the bounding box
    const response = await fetch(
      `http://localhost:5000/api/openchargemap?` +
      `latitude=${(minLat + maxLat) / 2}&longitude=${(minLng + maxLng) / 2}&` +
      `distance=${Math.max(calculateDistance(minLat, minLng, maxLat, maxLng), 50)}&` +
      `maxresults=100`,
      { timeout: 10000 }
    );
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    const chargers = await response.json();
    
    if (!Array.isArray(chargers)) {
      throw new Error("Invalid response format from charging station API");
    }
    
    // Filter chargers that are within maxDistance km of the route
    const nearbyChargers = chargers.filter(charger => {
      const chargerLat = charger.AddressInfo?.Latitude;
      const chargerLng = charger.AddressInfo?.Longitude;
      
      if (!chargerLat || !chargerLng) return false;
      
      // Find minimum distance from charger to any point on the route
      let minDistanceToRoute = Infinity;
      
      for (const routePoint of routeCoordinates) {
        const distance = calculateDistance(
          chargerLat, chargerLng,
          routePoint[0], routePoint[1]
        );
        minDistanceToRoute = Math.min(minDistanceToRoute, distance);
      }
      
      charger.distanceFromRoute = minDistanceToRoute;
      return minDistanceToRoute <= maxDistance;
    });
    
    return nearbyChargers.sort((a, b) => a.distanceFromRoute - b.distanceFromRoute);
  } catch (error) {
    console.error("Error finding chargers:", error);
    console.warn("Falling back to mock charging stations");
    return generateMockStationsAlongRoute(routeCoordinates, maxDistance);
  }
}

/**
 * Calculate energy consumption for the trip
 */
function calculateEnergyConsumption(distance, batterySize) {
  // Assume average consumption of 0.2 kWh per km
  const energyPerKm = 0.2;
  return distance * energyPerKm;
}

/**
 * Plan charging stops based on battery level and range
 */
function planChargingStops(routeDistance, car, currentBattery, nearbyChargers) {
  const chargingStops = [];
  const currentRange = (car.realRange * currentBattery) / 100;
  const safetyBuffer = 20; // Always keep 20% battery
  
  // If we can complete the trip with current battery (keeping 20% buffer), no stops needed
  if (currentRange - (routeDistance * 1.2) > (car.realRange * 0.2)) {
    return chargingStops;
  }
  
  let remainingDistance = routeDistance;
  let currentBatteryLevel = currentBattery;
  let distanceFromStart = 0;
  
  while (remainingDistance > 0) {
    // Calculate how far we can go with current battery (keeping 20% buffer)
    const usableBattery = currentBatteryLevel - 20;
    const rangeWithCurrentBattery = (car.realRange * usableBattery) / 100;
    
    // If we can't complete the remaining distance, we need a charging stop
    if (rangeWithCurrentBattery < remainingDistance) {
      // Find charging stop at optimal distance
      const optimalStopDistance = distanceFromStart + (rangeWithCurrentBattery * 0.8);
      
      // Find nearest charger to optimal stop point
      const availableChargers = nearbyChargers.filter(charger => 
        charger.StatusType?.IsOperational && 
        charger.Connections?.[0]?.PowerKW >= 22 // At least 22kW
      );
      
      if (availableChargers.length === 0) {
        break; // No suitable chargers found
      }
      
      const selectedCharger = availableChargers[0]; // Choose first available charger
      
      // Calculate charging details
      const batteryOnArrival = Math.max(20, currentBatteryLevel - ((rangeWithCurrentBattery / car.realRange) * 100));
      const chargingTime = Math.round(((80 - batteryOnArrival) / 100) * car.batterySize * (60 / (selectedCharger.Connections[0].PowerKW || 22)));
      const chargingCost = Math.round(((80 - batteryOnArrival) / 100) * car.batterySize * 12); // ₹12 per kWh
      
      chargingStops.push({
        charger: selectedCharger,
        distanceFromStart: Math.round(optimalStopDistance),
        batteryOnArrival: Math.round(batteryOnArrival),
        batteryAfterCharging: 80,
        chargingTime,
        chargingCost
      });
      
      // Update for next iteration
      distanceFromStart = optimalStopDistance;
      remainingDistance = routeDistance - distanceFromStart;
      currentBatteryLevel = 80;
    } else {
      // We can complete the trip
      break;
    }
  }
  
  return chargingStops;
}

/**
 * Main trip planning function
 */
export async function calculateTripPlan(tripData) {
  try {
    // Geocode source and destination
    console.log("Geocoding locations...");
    const sourceCoords = await geocodeLocation(tripData.sourceText);
    const destCoords = await geocodeLocation(tripData.destinationText);
    
    // Get route
    console.log("Calculating route...");
    const route = await getRoute(sourceCoords, destCoords);
    
    // Find nearby chargers
    console.log("Finding nearby chargers...");
    const nearbyChargers = await findChargersNearRoute(route.coordinates);
    
    // Calculate energy requirements
    const totalEnergyRequired = calculateEnergyConsumption(route.distance, tripData.selectedCar.batterySize);
    
    // Plan charging stops
    console.log("Planning charging stops...");
    const chargingStops = planChargingStops(
      route.distance, 
      tripData.selectedCar, 
      tripData.currentBattery, 
      nearbyChargers
    );
    
    // Calculate final battery level at destination
    let batteryAtDestination = tripData.currentBattery;
    let totalChargingCost = 0;
    
    if (chargingStops.length > 0) {
      // With charging stops
      const lastStop = chargingStops[chargingStops.length - 1];
      const remainingDistance = route.distance - lastStop.distanceFromStart;
      const energyForRemainingDistance = (remainingDistance / tripData.selectedCar.realRange) * 100;
      batteryAtDestination = Math.max(0, lastStop.batteryAfterCharging - energyForRemainingDistance);
      totalChargingCost = chargingStops.reduce((sum, stop) => sum + stop.chargingCost, 0);
    } else {
      // No charging stops needed
      const energyForTrip = (route.distance / tripData.selectedCar.realRange) * 100;
      batteryAtDestination = Math.max(0, tripData.currentBattery - energyForTrip);
    }
    
    return {
      sourceCoords: [sourceCoords.lat, sourceCoords.lng],
      destinationCoords: [destCoords.lat, destCoords.lng],
      route: route.coordinates,
      totalDistance: route.distance,
      totalDuration: route.duration,
      totalEnergyRequired,
      startingBattery: tripData.currentBattery,
      batteryAtDestination: Math.round(batteryAtDestination),
      chargingStops,
      nearbyChargers,
      totalChargingCost
    };
    
  } catch (error) {
    console.error("Trip planning error:", error);
    throw new Error(`Trip planning failed: ${error.message}`);
  }
}
