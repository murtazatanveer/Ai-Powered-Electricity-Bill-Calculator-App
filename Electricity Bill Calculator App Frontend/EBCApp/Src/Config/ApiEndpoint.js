// Base URL of the FastAPI backend
export const apiEndPoint = "http://127.0.0.1:8000";

// API endpoint paths
export const API_ENDPOINTS = {
  USER: {
    ADD_CREDENTIALS: "/user/add-credentials",
    CHECK_EMAIL: (email) => `/user/${encodeURIComponent(email)}`,
  },
  BILL: {
    BILL_DATA: "/bill-data",
    GET_BILL_DATA: "/bill-data/get-bill-data",
    CALCULATE: "/bill-calculation",
  },
  READINGS: {
    GET_ALL: "/bill-calculation/get-readings",
    GET_BY_ID: (docId) => `/bill-calculation/${docId}`,
    DELETE: (docId) => `/bill-calculation/${docId}`,
  },
  TARIFF: {
    GET_RATES: "/bill-calculation/get-tariffrates",
  },
};
