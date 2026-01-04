const apiPathsMock = {
  BASE_URL: "http://localhost:8000",
  API_PATHS: {
    AUTH: {
      REGISTER: "/api/auth/register",
      LOGIN: "/api/auth/login",
      LOGOUT: "/api/auth/logout",
      GET_PROFILE: "/api/auth/me",
      UPDATE_PROFILE: "/api/auth/me",
    },
    INVOICE: {
      CREATE: "/api/invoices/",
      GET_ALL_INVOICES: "/api/invoices/",
      GET_INVOICE_BY_ID: (id) => `/api/invoices/${id}`,
      UPDATE_INVOICE: (id) => `/api/invoices/${id}`,
      DELETE_INVOICE: (id) => `/api/invoices/${id}`,
      CREATE_SHARE: (id) => `/api/invoices/${id}/share`,
      DISABLE_SHARE: (id) => `/api/invoices/${id}/share/disable`,
      GET_SHARE: (token) => `/api/invoices/share/${token}`,
    },
    STATS: {
      GET: (range, interval) => `/api/stats?range=${range}&interval=${interval}`,
    },
    CLIENTS: {
      LIST: "/api/clients",
      DETAIL: (clientKey) => `/api/clients/${clientKey}`,
    },
    TOOLS: {
      CONVERT: (amount, from, to) =>
        `/api/tools/convert?amount=${amount}&from=${from}&to=${to}`,
    },
    AI: {
      PARSE_INVOICE_TEXT: "/api/ai/parse-text",
      PARSE_INVOICE_IMAGE: "/api/ai/parse-image",
      GENERATE_REMINDER: "/api/ai/generate-reminder",
      GET_DASHBOARD_SUMMARY: "/api/ai/dashboard-summary",
      GET_STATS_INSIGHTS: (range, interval) =>
        `/api/ai/stats-insights?range=${range}&interval=${interval}`,
    },
  },
};

module.exports = apiPathsMock;
