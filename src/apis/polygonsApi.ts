import axios from "axios";

const polygonsApi = axios.create({
  baseURL: process.env.BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default polygonsApi;
