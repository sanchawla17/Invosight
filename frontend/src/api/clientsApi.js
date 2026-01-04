import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const fetchClients = () => axiosInstance.get(API_PATHS.CLIENTS.LIST);

const fetchClientDetail = (clientKey) =>
  axiosInstance.get(API_PATHS.CLIENTS.DETAIL(clientKey));

export { fetchClients, fetchClientDetail };
