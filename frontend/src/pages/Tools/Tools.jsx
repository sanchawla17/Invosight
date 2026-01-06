import { useEffect, useState } from "react";
import { Calculator } from "lucide-react";
import { TOOL_CARDS } from "../../components/tools/constants";
import CurrencyTool from "../../components/tools/CurrencyTool";
import DiscountTool from "../../components/tools/DiscountTool";
import TaxTool from "../../components/tools/TaxTool";
import LateFeeTool from "../../components/tools/LateFeeTool";


// Mapping of tool IDs to their respective components for dynamic rendering
const TOOL_COMPONENTS = {
  currency: CurrencyTool,
  discount: DiscountTool,
  tax: TaxTool,
  "late-fee": LateFeeTool,
};

const Tools = () => {
  const [activeTool, setActiveTool] = useState("currency");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (TOOL_CARDS.some((tool) => tool.id === hash)) {
      setActiveTool(hash);
    }
  }, []);

  const handleToolSelect = (toolId) => {
    setActiveTool(toolId);
    if (window?.history?.replaceState) {
      window.history.replaceState(null, "", `#${toolId}`);
    } else {
      window.location.hash = toolId;
    }
  };

  const activeCard = TOOL_CARDS.find((tool) => tool.id === activeTool);
  const ActiveTool = TOOL_COMPONENTS[activeTool];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
          <Calculator className="h-5 w-5 text-emerald-700" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Tools</h2>
          <p className="text-sm text-slate-500">
            Choose a tool to run quick, clean calculations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {TOOL_CARDS.map((tool) => {
          const Icon = tool.icon;
          const isActive = tool.id === activeTool;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => handleToolSelect(tool.id)}
              className={`text-left rounded-xl border p-4 transition-all ${
                isActive
                  ? "border-emerald-200 bg-emerald-50/80 shadow-sm"
                  : "border-slate-200 bg-white hover:border-emerald-200 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    isActive ? "bg-white" : "bg-slate-50"
                  }`}
                >
                  <Icon className="h-5 w-5 text-slate-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {tool.title}
                  </p>
                  <p className="text-xs text-slate-500">{tool.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {activeCard && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm shadow-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {activeCard.title}
              </h3>
              <p className="text-xs text-slate-500">{activeCard.description}</p>
            </div>
          </div>

          {ActiveTool && <ActiveTool />}
        </div>
      )}
    </div>
  );
};

export default Tools;
