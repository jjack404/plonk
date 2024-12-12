import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.DEV ? 'http://localhost:3001' : import.meta.env.VITE_API_URL,
  withCredentials: true
});

export { api };
