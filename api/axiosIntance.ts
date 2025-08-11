import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api-ridepay-nodebackend.onrender.com/ridepay', 
  timeout: 10000,
});

export default api;
