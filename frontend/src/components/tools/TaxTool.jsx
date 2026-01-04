import { useMemo, useState } from "react";
import { Copy, RotateCcw } from "lucide-react";
import Button from "../ui/Button";
import toast from "react-hot-toast";
import ResultBox from "./ResultBox";
import FormulaBox from "./FormulaBox";
import { inputClasses } from "./styles";
import { formatNumber, parseAmount } from "./utils";

const TaxTool = () => {
  const [taxInput, setTaxInput] = useState({
    amount: "",
    rate: "",
  });

  const taxValues = useMemo(() => {
    const amount = parseAmount(taxInput.amount);
    const rate = parseAmount(taxInput.rate);
    const tax = (amount * rate) / 100;
    return { amount, tax, total: amount + tax };
  }, [taxInput]);

  const handleTaxReset = () => {
    setTaxInput({ amount: "", rate: "" });
  };

  const handleCopy = async (text) => {
    if (!navigator?.clipboard?.writeText) {
      toast.error("Copy not supported.");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard.");
    } catch (error) {
      toast.error("Failed to copy.");
    }
  };

  return (
    <div id="tax" className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
          <div>
            <label className="text-xs text-slate-500">Amount</label>
            <input
              type="number"
              min="0"
              placeholder="0.00"
              className={inputClasses}
              value={taxInput.amount}
              onChange={(event) =>
                setTaxInput((prev) => ({
                  ...prev,
                  amount: event.target.value,
                }))
              }
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Tax percent</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              className={inputClasses}
              value={taxInput.rate}
              onChange={(event) =>
                setTaxInput((prev) => ({
                  ...prev,
                  rate: event.target.value,
                }))
              }
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="small"
            variant="ghost"
            icon={RotateCcw}
            onClick={handleTaxReset}
          >
            Reset
          </Button>
          <Button
            size="small"
            variant="ghost"
            icon={Copy}
            onClick={() =>
              handleCopy(
                `Tax: ${formatNumber(taxValues.tax)}, Total: ${formatNumber(
                  taxValues.total
                )}`
              )
            }
          >
            Copy result
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <ResultBox title="Result" note="Estimate only.">
          <div className="flex justify-between">
            <span>Tax amount</span>
            <span className="font-semibold text-slate-900">
              {formatNumber(taxValues.tax)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total with tax</span>
            <span className="font-semibold text-slate-900">
              {formatNumber(taxValues.total)}
            </span>
          </div>
        </ResultBox>
        <FormulaBox
          lines={["tax = amount * (taxPercent / 100)", "total = amount + tax"]}
          variables={[
            {
              label: "amount",
              description: "base amount before tax.",
            },
            {
              label: "taxPercent",
              description: "tax rate percentage.",
            },
          ]}
        />
      </div>
    </div>
  );
};

export default TaxTool;
