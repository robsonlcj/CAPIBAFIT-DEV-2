import axios from 'axios';

// A mágica acontece aqui:
// Se existir uma variável de ambiente (na Vercel), usa ela.
// Se não (no seu PC), usa o localhost.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

export default api;
