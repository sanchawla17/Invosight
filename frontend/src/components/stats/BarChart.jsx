import { useState } from "react";
import { formatMoney } from "../../utils/format";

const BarChart = ({ data }) => {
  const [activeClient, setActiveClient] = useState(null);
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-500">
        No client data available.
      </div>
    );
  }

  const maxValue = Math.max(...data.map((item) => item.totalBilled), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          Total billed
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Total paid
        </span>
      </div>
      {data.map((client) => (
        <div
          key={client.clientName}
          className="space-y-2 rounded-lg p-2 -mx-2 hover:bg-slate-50 transition-colors"
          onMouseEnter={() => setActiveClient(client.clientName)}
          onMouseLeave={() => setActiveClient(null)}
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-900 font-medium">
              {client.clientName}
            </span>
            <span className="text-slate-500">
              {formatMoney(client.totalBilled)}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{
                width: `${(client.totalBilled / maxValue) * 100}%`,
              }}
            />
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{
                width: `${(client.totalPaid / maxValue) * 100}%`,
              }}
            />
          </div>
          {activeClient === client.clientName && (
            <div className="text-xs text-slate-500 flex gap-4">
              <span>Total billed: {formatMoney(client.totalBilled)}</span>
              <span>Total paid: {formatMoney(client.totalPaid)}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BarChart;
