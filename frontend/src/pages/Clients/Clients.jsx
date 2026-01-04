import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Loader2, Plus, Users } from "lucide-react";
import { fetchClients } from "../../api/clientsApi";
import { formatDateDisplay } from "../../utils/date";
import { formatMoney } from "../../utils/format";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadClients = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetchClients();
        setClients(response.data || []);
      } catch (err) {
        setError("Failed to fetch clients.");
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        subtitle="Track totals, overdue balances, and invoice history."
        actions={
          <Button onClick={() => navigate("/invoices/new")} icon={Plus}>
            Create Invoice
          </Button>
        }
      />

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients yet"
          description="Clients appear once you create invoices with billing details."
          action={
            <Button onClick={() => navigate("/invoices/new")} icon={Plus}>
              Create your first invoice
            </Button>
          }
          className="bg-white border border-slate-200 rounded-lg"
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Total billed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Outstanding
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Overdue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Last invoice
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {clients.map((client) => (
                  <tr key={client.clientKey} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {client.clientName || "Unknown"}
                      </div>
                      <div className="text-sm text-slate-500">
                        {client.clientEmail || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatMoney(client.totalBilled)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatMoney(client.totalOutstanding)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          client.overdueCount > 0
                            ? "bg-red-100 text-red-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {client.overdueCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatDateDisplay(client.lastInvoiceDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() =>
                            navigate("/invoices/new", {
                              state: {
                                clientPrefill: {
                                  clientName: client.clientName,
                                  email: client.clientEmail,
                                },
                              },
                            })
                          }
                        >
                          Create Invoice
                        </Button>
                        <Button
                          size="small"
                          variant="ghost"
                          onClick={() =>
                            navigate(
                              `/clients/${encodeURIComponent(client.clientKey)}`
                            )
                          }
                          icon={Eye}
                        >
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
