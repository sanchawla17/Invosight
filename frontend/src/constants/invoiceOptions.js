const INVOICE_STATUS_FILTERS = [
  { value: "All", label: "All Statuses" },
  { value: "Paid", label: "Paid" },
  { value: "Overdue", label: "Overdue" },
  { value: "Unpaid", label: "Unpaid" },
];

const INVOICE_SORT_FIELDS = [
  { value: "invoiceDate", label: "Invoice Date" },
  { value: "dueDate", label: "Due Date" },
  { value: "amount", label: "Amount" },
  { value: "client", label: "Client" },
  { value: "status", label: "Status" },
  { value: "invoiceNumber", label: "Invoice #" },
];

export { INVOICE_STATUS_FILTERS, INVOICE_SORT_FIELDS };
