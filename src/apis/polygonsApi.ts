import axios from "axios";
import { setupErrorInterceptor, setupLoadingInterceptor } from "../interceptors";

const polygonsApi = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Setup interceptors
// Orden crítico: loading se ejecuta último, error primero
setupLoadingInterceptor(polygonsApi);
setupErrorInterceptor(polygonsApi);

export default polygonsApi;
 