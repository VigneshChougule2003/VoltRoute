const API_KEY = "18ec7b67-9e4e-457f-8bab-11a22eebcc1a"; // Use your actual key
const proxyUrl = "http://localhost:5000/proxy";

export const fetchStations = async (lat, lng, filters = {}) => {
  const baseUrl = `https://api.openchargemap.io/v3/poi/?output=json&countrycode=IN&latitude=${lat}&longitude=${lng}&distance=20&maxresults=50&key=${API_KEY}`;
  const fullProxyUrl = `${proxyUrl}?target=${encodeURIComponent(baseUrl)}`;

  try {
    const response = await fetch(fullProxyUrl);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch stations error:", error.message);
    return [];
  }
};
