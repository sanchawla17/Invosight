import { useState } from "react";
import { Sparkles } from "lucide-react";
import { fetchDashboardSummary } from "../api/aiApi";
import Button from "./ui/Button";

const AIInsightsCard = () => {
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const response = await fetchDashboardSummary();
      setInsights(response.data.insights || []);
    } catch (error) {
      console.error("Failed to fetch AI insights", error);
      setInsights([]);
    } finally {
      setHasGenerated(true);
      setIsLoading(false);
    }
  };

  return <div className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm shadow-gray-100 transition-colors hover:border-blue-200 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-blue-600 transition-colors group-hover:text-purple-600" />
          <h3 className="text-lg font-semibold text-slate-900">AI Insights</h3>
        </div>
        <Button
          variant="ai"
          size="small"
          onClick={fetchInsights}
          isLoading={isLoading}
        >
          {hasGenerated ? "Refresh Insights" : "Generate Insights"}
        </Button>
      </div>
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
      ) : !hasGenerated ? (
        <p className="text-sm text-slate-600">
          Click generate to get AI insights for your invoices.
        </p>
      ) : insights.length > 0 ? (
        <ul className="space-y-3 list-disc list-inside text-slate-600 ml-3">
          {insights.map((insight, index) => (
            <li key={index} className="text-sm">{insight}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-600">No insights available yet.</p>
      )}
    </div>
};

export default AIInsightsCard;

