import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const parseInvoiceText = (text) =>
  axiosInstance.post(API_PATHS.AI.PARSE_INVOICE_TEXT, { text });

const parseInvoiceImage = (imageBase64, mimeType, contextText) =>
  axiosInstance.post(API_PATHS.AI.PARSE_INVOICE_IMAGE, {
    imageBase64,
    mimeType,
    contextText,
  });

const generateReminder = (invoiceId, tone) =>
  axiosInstance.post(API_PATHS.AI.GENERATE_REMINDER, { invoiceId, tone });

const fetchDashboardSummary = () =>
  axiosInstance.get(API_PATHS.AI.GET_DASHBOARD_SUMMARY);

const fetchStatsInsights = (range, interval) =>
  axiosInstance.get(API_PATHS.AI.GET_STATS_INSIGHTS(range, interval));

export {
  parseInvoiceText,
  parseInvoiceImage,
  generateReminder,
  fetchDashboardSummary,
  fetchStatsInsights,
};
