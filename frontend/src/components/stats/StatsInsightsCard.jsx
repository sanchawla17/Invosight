import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { fetchStatsInsights } from "../../api/aiApi";
import Button from "../ui/Button";

const StatsInsightsCard = ({ rangeDays, interval }) => {
  const [insights, setInsights] = useState([]);
  const [actions, setActions] = useState([]);
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await fetchStatsInsights(rangeDays, interval);
      setSummary(response.data.summary || "");
      setInsights(response.data.insights || []);
      setActions(response.data.actions || []);
    } catch (error) {
      setSummary("Not enough data");
      setInsights([]);
      setActions([]);
    } finally {
      setHasGenerated(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setInsights([]);
    setActions([]);
    setSummary("");
    setHasGenerated(false);
  }, [rangeDays, interval]);

  return (
    <div className="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm shadow-gray-100 transition-colors hover:border-blue-200 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600 transition-colors group-hover:text-purple-600" />
          <h3 className="text-base font-semibold text-slate-900">
            AI Insights
          </h3>
        </div>
        <Button
          size="small"
          variant="ai"
          onClick={handleGenerate}
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
          Generate insights to see a summary and recommended actions.
        </p>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-700">{summary || "Not enough data"}</p>
          {insights.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                Insights
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-600">
                {insights.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {actions.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                Recommended actions
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-600">
                {actions.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatsInsightsCard;

