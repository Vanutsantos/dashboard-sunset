import axios from 'axios';

const api = axios.create({
  baseURL: 'https://integracao.nextfit.com.br/api/v1',
  headers: {
    'Accept': 'text/plain',
    'X-Api-Key': import.meta.env.VITE_NEXT_FIT_API_KEY,
  },
});

export default api;
