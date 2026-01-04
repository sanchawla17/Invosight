import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  Mail,
  TrendingUp,
} from "lucide-react";
import { fetchClientDetail } from "../../api/clientsApi";
import { formatDateDisplay } from "../../utils/date";
import { formatMoney } from "../../utils/format";
import Button from "../../components/ui/Button";
import ReminderModal from "../../components/invoices/ReminderModal";

const ClientDetail = () => {
  const { clientKey } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [summary, setSummary] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetchClientDetail(clientKey);
        setClient(response.data.client);
        setSummary(response.data.summary);
        setInvoices(response.data.invoices || []);
      } catch (err) {
        setError("Failed to load client details.");
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientKey]);

  const overdueInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      if (invoice.status === "Paid") {
        return false;
      }
      if (!invoice.dueDate) {
        return false;
      }
      const dueDate = moment(invoice.dueDate);
      return dueDate.isValid() && dueDate.endOf("day").isBefore(moment());
    });
  }, [invoices]);

  useEffect(() => {
    if (overdueInvoices.length > 0) {
      setSelectedInvoiceId(overdueInvoices[0]._id);
    } else {
      setSelectedInvoiceId("");
    }
  }, [overdueInvoices]);

  const getComputedStatus = (invoice) => {
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
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error || !client || !summary) {
    return (
      <div className="p-6 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
        {error || "Client not found."}
      </div>
    );
  }

  const summaryCards = [
    {
      label: "Total billed",
      value: formatMoney(summary.totalBilled),
      icon: FileText,
      color: "blue",
    },
    {
      label: "Total paid",
      value: formatMoney(summary.totalPaid),
      icon: CheckCircle2,
      color: "emerald",
    },
    {
      label: "Outstanding",
      value: formatMoney(summary.totalOutstanding),
      icon: AlertTriangle,
      color: "amber",
    },
    {
      label: "Avg invoice value",
      value: formatMoney(summary.averageInvoiceValue),
      icon: TrendingUp,
      color: "indigo",
    },
  ];

  const colorClasses = {
    blue: { bg: "bg-emerald-100", text: "text-emerald-700" },
    emerald: { bg: "bg-emerald-100", text: "text-emerald-700" },
    amber: { bg: "bg-amber-100", text: "text-amber-700" },
    indigo: { bg: "bg-indigo-100", text: "text-indigo-700" },
  };

  return (
    <div className="space-y-6">
      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        invoiceId={selectedInvoiceId}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {client.name}
          </h1>
          <p className="text-sm text-slate-600">{client.email || "-"}</p>
        </div>
        <Button
          variant="secondary"
          onClick={() =>
            navigate("/invoices/new", {
              state: { clientPrefill: { clientName: client.name, email: client.email } },
            })
          }
        >
          Create Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm shadow-gray-100"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`h-11 w-11 rounded-lg flex items-center justify-center ${
                    colorClasses[card.color].bg
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${colorClasses[card.color].text}`}
                  />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {card.label}
                  </p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">
                    {card.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm shadow-gray-100 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Quick actions
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Generate reminders for overdue invoices.
            </p>
          </div>
          {overdueInvoices.length === 0 ? (
            <p className="text-sm text-slate-600">
              No overdue invoices for this client.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Overdue invoice
                  </label>
                  <select
                    className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={selectedInvoiceId}
                    onChange={(e) => setSelectedInvoiceId(e.target.value)}
                  >
                    {overdueInvoices.map((invoice) => (
                      <option key={invoice._id} value={invoice._id}>
                        {invoice.invoiceNumber} Â· {formatMoney(invoice.total)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  icon={Mail}
                  onClick={() => setIsReminderModalOpen(true)}
                  disabled={!selectedInvoiceId}
                >
                  Generate Reminder
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm shadow-gray-100">
          <h3 className="text-base font-semibold text-slate-900 mb-2">
            Client stats
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Overdue invoices
              </p>
              <p className="text-lg font-semibold text-slate-900 mt-1">
                {summary.overdueCount}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Invoice count
              </p>
              <p className="text-lg font-semibold text-slate-900 mt-1">
                {summary.invoiceCount}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Last invoice
              </p>
              <p className="text-sm font-medium text-slate-900 mt-1">
                {formatDateDisplay(summary.lastInvoiceDate)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            Invoices for this client
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Due date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {invoices.map((invoice) => {
                const status = getComputedStatus(invoice);
                return (
                  <tr
                    key={invoice._id}
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => navigate(`/invoices/${invoice._id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatMoney(invoice.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          status === "Paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : status === "Overdue"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatDateDisplay(invoice.dueDate)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientDetail;
