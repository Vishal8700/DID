// API Configuration with fallback to localhost
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function for API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, options);
  return response;
};

export default API_URL;
