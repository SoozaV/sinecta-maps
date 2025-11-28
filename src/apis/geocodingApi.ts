import axios from "axios";
import { setupErrorInterceptor } from "../interceptors";

const geocodingApi = axios.create({
  baseURL: "https://api.mapbox.com/geocoding/v5/mapbox.places",
  timeout: 10000,
  params: {
    limit: 1,
    types: "place,postcode,address",
    // Use dedicated geocoding token if available, otherwise fallback to main access token
    access_token: import.meta.env.VITE_MAPBOX_GEOCODING_TOKEN || import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
  },
});

// Solo error handling (no loading para geocoding - operaciones rápidas)
setupErrorInterceptor(geocodingApi);

export default geocodingApi;
