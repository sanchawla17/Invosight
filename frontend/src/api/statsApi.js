import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const fetchStats = (rangeDays, interval) =>
  axiosInstance.get(API_PATHS.STATS.GET(rangeDays, interval));

export { fetchStats };
