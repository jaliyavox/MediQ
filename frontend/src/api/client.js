// LOCKED FILE - shared by all four members. Tell the team before changing it.
import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
});

// Attach the doctor's JWT to every request once they are logged in.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('mediq_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Turn any backend error into a predictable shape the pages can render:
// { message, errors } - where errors is the per-field map from validateInput.js
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const data = err.response?.data;
    return Promise.reject({
      message: data?.message || 'Could not reach the server. Is the backend running?',
      errors: data?.errors || {},
      status: err.response?.status,
    });
  }
);

export default client;
