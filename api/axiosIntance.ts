import axios from 'axios';

const api = axios.create({
  baseURL: 'http://10.252.69.223:3000/ridepay', 
  timeout: 10000,
});

export default api;
