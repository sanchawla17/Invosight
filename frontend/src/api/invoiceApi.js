import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const fetchInvoices = () => axiosInstance.get(API_PATHS.INVOICE.GET_ALL_INVOICES);

const fetchInvoiceById = (id) =>
  axiosInstance.get(API_PATHS.INVOICE.GET_INVOICE_BY_ID(id));

const createInvoice = (payload) =>
  axiosInstance.post(API_PATHS.INVOICE.CREATE, payload); 

// payload contains invoice data

const updateInvoice = (id, payload) =>
  axiosInstance.put(API_PATHS.INVOICE.UPDATE_INVOICE(id), payload);

const deleteInvoice = (id) =>
  axiosInstance.delete(API_PATHS.INVOICE.DELETE_INVOICE(id));

const createShareLink = (id) =>
  axiosInstance.post(API_PATHS.INVOICE.CREATE_SHARE(id));

const disableShareLink = (id) =>
  axiosInstance.post(API_PATHS.INVOICE.DISABLE_SHARE(id));

const fetchSharedInvoice = (token) =>
  axiosInstance.get(API_PATHS.INVOICE.GET_SHARE(token));

export {
  fetchInvoices,
  fetchInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  createShareLink,
  disableShareLink,
  fetchSharedInvoice,
};
