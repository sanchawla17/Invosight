import React, { useEffect, useState, useMemo, useCallback } from "react";
import { deleteInvoice, fetchInvoices, updateInvoice } from "../../api/invoiceApi";
import {
  Loader2,
  Trash2,
  Edit,
  Search,
  FileText,
  Plus,
  AlertCircle,
  Mail,
} from "lucide-react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import ReminderModal from "../../components/invoices/ReminderModal";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import {
  INVOICE_STATUS_FILTERS,
  INVOICE_SORT_FIELDS,
} from "../../constants/invoiceOptions";
import { formatDateDisplay } from "../../utils/date";
import { formatMoney } from "../../utils/format";

const AllInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusChangeLoading, setStatusChangeLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("invoiceDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const navigate = useNavigate();

  const getComputedStatus = useCallback((invoice) => {
    if (invoice.status === "Paid") {
      return "Paid";
    }
    if (invoice.dueDate) {
      const dueDate = moment(invoice.dueDate);
      if (dueDate.isValid() && dueDate.endOf("day").isBefore(moment())) {
        return "Overdue";
      }
    }
    return "Unpaid";
  }, []);

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const response = await fetchInvoices();
        setInvoices(
          response.data.sort(
            (a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate)
          )
        );
      } catch (err) {
        setError("Failed to fetch invoices.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await deleteInvoice(id);
        setInvoices((prev) => prev.filter((invoice) => invoice._id !== id));
      } catch (err) {
        setError("Failed to delete invoice.");
        console.error(err);
      }
    }
  };

  const handleStatusChange = async (invoice) => {
    setStatusChangeLoading(invoice._id);
    try {
      const newStatus = invoice.status === "Paid" ? "Unpaid" : "Paid";
      const updatedInvoice = { ...invoice, status: newStatus };

      const response = await updateInvoice(invoice._id, updatedInvoice);

      setInvoices((prev) =>
        prev.map((inv) => (inv._id === invoice._id ? response.data : inv))
      );
    } catch (err) {
      setError("Failed to update invoice status.");
      console.error(err);
    } finally {
      setStatusChangeLoading(null);
    }
  };

  const handleOpenReminderModal = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
    setIsReminderModalOpen(true);
  };

  const filteredInvoices = useMemo(() => {
    const filtered = invoices
      .filter(
        (invoice) =>
          statusFilter === "All" ||
          getComputedStatus(invoice) === statusFilter
      )
      .filter(
        (invoice) =>
          invoice.invoiceNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          invoice.billTo.clientName
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    const getSortValue = (invoice) => {
      switch (sortBy) {
        case "invoiceNumber":
          return invoice.invoiceNumber || "";
        case "client":
          return invoice.billTo?.clientName || "";
        case "amount":
          return Number(invoice.total || 0);
        case "status":
          return getComputedStatus(invoice) || "";
        case "dueDate": {
          const time = new Date(invoice.dueDate).getTime();
          return Number.isNaN(time) ? null : time;
        }
        case "invoiceDate":
        default: {
          const time = new Date(invoice.invoiceDate).getTime();
          return Number.isNaN(time) ? null : time;
        }
      }
    };

    const compareValues = (a, b) => {
      const aValue = getSortValue(a);
      const bValue = getSortValue(b);
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      let result = 0;
      if (typeof aValue === "number" && typeof bValue === "number") {
        result = aValue - bValue;
      } else {
        result = String(aValue).localeCompare(String(bValue), undefined, {
          numeric: true,
          sensitivity: "base",
        });
      }
      return sortOrder === "asc" ? result : -result;
    };

    return filtered.slice().sort(compareValues);
  }, [invoices, searchTerm, statusFilter, sortBy, sortOrder, getComputedStatus]);

  if (loading) {
    return (
      <div className="flex justify-center itw-8 h-8 animate-spin text-emerald-600">
        <Loader2 className="" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        invoiceId={selectedInvoiceId}
      />
      <PageHeader
        title="All Invoices"
        subtitle="Manage all your invoices in one place."
        actions={
          <Button onClick={() => navigate("/invoices/new")} icon={Plus}>
            Create Invoice
          </Button>
        }
      />

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 mb-1">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="p-4 sm:p-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by invoice # or client..."
                className="w-full h-10 pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex-shrink-0">
              <select
                className="w-full sm:w-auto h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {INVOICE_STATUS_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
              <select
                className="w-full sm:w-auto h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {INVOICE_SORT_FIELDS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                onClick={() =>
                  setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                }
              >
                {sortOrder === "asc" ? "Asc" : "Desc"}
              </button>
            </div>
          </div>
        </div>

        {filteredInvoices.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No invoices found"
            description="Your search or filter criteria did not match any invoices. Try adjusting your search."
            action={
              invoices.length === 0 ? (
                <Button onClick={() => navigate("/invoices/new")} icon={Plus}>
                  Create First Invoice
                </Button>
              ) : null
            }
          />
        ) : (
          <div className="w-[90vw] md:w-auto overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-slate-200">
                {filteredInvoices.map((invoice) => {
                  const computedStatus = getComputedStatus(invoice);
                  return (
                    <tr key={invoice._id} className="hover:bg-slate-50">
                      <td
                        onClick={() => navigate(`/invoices/${invoice._id}`)}
                        className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 cursor-pointer"
                      >
                        {invoice.invoiceNumber}
                      </td>
                      <td
                        onClick={() => navigate(`/invoices/${invoice._id}`)}
                        className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 cursor-pointer"
                      >
                        {invoice.billTo.clientName}
                      </td>
                      <td
                        onClick={() => navigate(`/invoices/${invoice._id}`)}
                        className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 cursor-pointer"
                      >
                        {formatMoney(invoice.total)}
                      </td>
                      <td
                        onClick={() => navigate(`/invoices/${invoice._id}`)}
                        className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 cursor-pointer"
                      >
                        {formatDateDisplay(invoice.dueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            computedStatus === "Paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : computedStatus === "Overdue"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {computedStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div
                          className="flex items-center justify-end gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="small"
                            variant="secondary"
                            onClick={() => handleStatusChange(invoice)}
                            isLoading={statusChangeLoading === invoice._id}
                          >
                            {invoice.status === "Paid"
                              ? "Mark Unpaid"
                              : "Mark Paid"}
                          </Button>
                          <Button
                            size="small"
                            variant="ghost"
                            onClick={() => navigate(`/invoices/${invoice._id}`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="small"
                            variant="ghost"
                            onClick={() => handleDelete(invoice._id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                          {invoice.status !== "Paid" ? (
                            <Button
                              size="small"
                              variant="ghost"
                              onClick={() => handleOpenReminderModal(invoice._id)}
                              title="Generate Reminder"
                            >
                              <Mail className="w-4 h-4 text-blue-500" />
                            </Button>
                          ) : (
                            <span
                              className="inline-flex items-center justify-center h-8 px-3 py-1 rounded-lg"
                              title="Already paid"
                            >
                              <Mail className="w-4 h-4 text-slate-900" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllInvoices;
