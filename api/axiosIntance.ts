import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.100.7:3000/ridepay', 
  timeout: 10000,
});

export default api;
