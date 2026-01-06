import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

// Range Days: number of days to look back for stats
// Interval: period for stats (e.g., 'daily', 'weekly', 'monthly')
const fetchStats = (rangeDays, interval) =>
  axiosInstance.get(API_PATHS.STATS.GET(rangeDays, interval));

export { fetchStats };
