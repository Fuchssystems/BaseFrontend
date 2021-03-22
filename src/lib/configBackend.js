// Main Backend (Laravel) configuration

import axios from 'axios';

const backendURL = 'http://192.168.178.55';
// const backendURL = 'http://localhost';
// const backendURL = 'https://fuchs.computer';
console.log(`backendURL: ${backendURL}`);
const backendAxios = axios.create({
  baseURL: backendURL,
});
backendAxios.defaults.headers.common['Content-Type'] = 'application/json';

export { backendURL, backendAxios };
