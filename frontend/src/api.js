import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

export async function fetchData() {
  const response = await axios.get(`${BASE_URL}/data`, { withCredentials: true });
  return response.data;
}

export async function fetchAnalysis() {
  const response = await axios.post(`${BASE_URL}/analyze`, null, { withCredentials: true });
  return response.data;
}

// Alias to match existing imports in App.js
export function runAnalysis() {
  return fetchAnalysis();
}
