import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, FileText, Loader2 } from "lucide-react";
import { fetchStats } from "../../api/statsApi";
import Button from "../../components/ui/Button";
import { formatMoney } from "../../utils/format";
import LineChart from "../../components/stats/LineChart";
import DonutChart from "../../components/stats/DonutChart";
import BarChart from "../../components/stats/BarChart";
import StatsInsightsCard from "../../components/stats/StatsInsightsCard";

const rangeOptions = [
  { value: 7, label: "Last 7" },
  { value: 30, label: "Last 30" },
  { value: 90, label: "Last 90" },
];

const intervalOptions = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

const metricOptions = [
  { value: "totalPaid", label: "Total Paid" },
  { value: "totalInvoiced", label: "Total Invoiced" },
];

const statusColors = {
  Sent: "#93c5fd",
  Paid: "#34d399",
  Overdue: "#fca5a5",
};

const Stats = () => {
  const [rangeDays, setRangeDays] = useState(30);
  const [interval, setInterval] = useState("day");
  const [metric, setMetric] = useState("totalPaid");
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetchStats(rangeDays, interval);
        setStats(response.data);
      } catch (err) {
        setError("Failed to fetch stats.");
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [rangeDays, interval]);

  const revenueData = useMemo(
    () => stats?.revenueSeries || [],
    [stats?.revenueSeries]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Stats</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Range</span>
            <div className="flex items-center gap-1">
              {rangeOptions.map((option) => (
                <Button
                  key={option.value}
                  size="small"
                  variant={rangeDays === option.value ? "secondary" : "ghost"}
                  onClick={() => setRangeDays(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Interval</span>
            <div className="flex items-center gap-1">
              {intervalOptions.map((option) => (
                <Button
                  key={option.value}
                  size="small"
                  variant={interval === option.value ? "secondary" : "ghost"}
                  onClick={() => setInterval(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Metric</span>
            <select
              className="h-8 px-2 border border-slate-200 rounded-lg bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
            >
              {metricOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <StatsInsightsCard rangeDays={rangeDays} interval={interval} />

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                label: "Total invoiced",
                value: formatMoney(stats.totals.totalInvoiced),
                icon: FileText,
                color: "blue",
              },
              {
                label: "Total paid",
                value: formatMoney(stats.totals.totalPaid),
                icon: CheckCircle2,
                color: "emerald",
              },
              {
                label: "Outstanding",
                value: formatMoney(stats.totals.totalOutstanding),
                icon: AlertTriangle,
                color: "amber",
              },
            ].map((card) => {
              const colorClasses = {
                blue: { bg: "bg-blue-100", text: "text-blue-700" },
                emerald: { bg: "bg-emerald-100", text: "text-emerald-700" },
                amber: { bg: "bg-amber-100", text: "text-amber-700" },
              };
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
                        className={`h-5 w-5 ${
                          colorClasses[card.color].text
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        {card.label}
                      </p>
                      <p className="text-xl font-semibold text-slate-900 mt-1">
                        {card.value}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm shadow-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Revenue over time
                  </h3>
                  <p className="text-xs text-slate-500">
                    {metric === "totalPaid" ? "Paid invoices" : "All invoices"}
                  </p>
                </div>
                <p className="text-xs text-slate-500">
                  {interval.charAt(0).toUpperCase() + interval.slice(1)}
                </p>
              </div>
              <LineChart
                data={revenueData}
                interval={interval}
                valueKey={metric}
              />
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm shadow-gray-100">
              <h3 className="text-base font-semibold text-slate-900 mb-4">
                Invoice status breakdown
              </h3>
              <DonutChart data={stats.statusBreakdown} colors={statusColors} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm shadow-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Top clients
                </h3>
                <p className="text-xs text-slate-500">
                  Based on total billed in this range
                </p>
              </div>
            </div>
            <BarChart data={stats.topClients} />
          </div>
        </>
      )}
    </div>
  );
};

export default Stats;




