import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const convertCurrency = (amount, from, to) =>
  axiosInstance.get(API_PATHS.TOOLS.CONVERT(amount, from, to));

export { convertCurrency };
