import axios from "axios";

const geocodingApi = axios.create({
  baseURL: "https://api.mapbox.com/geocoding/v5/mapbox.places",
  params: {
    limit: 1,
    types: "place,postcode,address",
    access_token: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
  },
});

export default geocodingApi;
