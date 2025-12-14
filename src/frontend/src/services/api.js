import axios from 'axios';

// Pega o IP/Domínio que está na barra de endereço do navegador.
// Se você abrir como localhost, ele usa localhost.
// Se abrir como 192.168.1.X, ele usa 192.168.1.X.
const ipAtual = window.location.hostname; 

const api = axios.create({
    baseURL: `http://${ipAtual}:3001/api`, // Monta a URL dinamicamente
    timeout: 10000, 
});

export default api;