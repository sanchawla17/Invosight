import { useMemo, useState } from "react";
import { Copy, RotateCcw } from "lucide-react";
import Button from "../ui/Button";
import toast from "react-hot-toast";
import ResultBox from "./ResultBox";
import FormulaBox from "./FormulaBox";
import { inputClasses } from "./styles";
import { formatNumber, parseAmount } from "./utils";

const LateFeeTool = () => {
  const [lateFeeInput, setLateFeeInput] = useState({
    amount: "",
    rate: "",
    days: "",
  });

  const lateFeeValues = useMemo(() => {
    const amount = parseAmount(lateFeeInput.amount);
    const rate = parseAmount(lateFeeInput.rate);
    const days = parseAmount(lateFeeInput.days);
    const dailyRate = (rate / 100) / 30;
    const fee = amount * dailyRate * days;
    return { amount, fee, total: amount + fee, dailyRate };
  }, [lateFeeInput]);

  const handleLateFeeReset = () => {
    setLateFeeInput({ amount: "", rate: "", days: "" });
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
    <div id="late-fee" className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="text-xs text-slate-500">Amount due</label>
            <input
              type="number"
              min="0"
              placeholder="0.00"
              className={inputClasses}
              value={lateFeeInput.amount}
              onChange={(event) =>
                setLateFeeInput((prev) => ({
                  ...prev,
                  amount: event.target.value,
                }))
              }
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Monthly rate (%)</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              className={inputClasses}
              value={lateFeeInput.rate}
              onChange={(event) =>
                setLateFeeInput((prev) => ({
                  ...prev,
                  rate: event.target.value,
                }))
              }
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Days overdue</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              className={inputClasses}
              value={lateFeeInput.days}
              onChange={(event) =>
                setLateFeeInput((prev) => ({
                  ...prev,
                  days: event.target.value,
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
            onClick={handleLateFeeReset}
          >
            Reset
          </Button>
          <Button
            size="small"
            variant="ghost"
            icon={Copy}
            onClick={() =>
              handleCopy(
                `Late fee: ${formatNumber(
                  lateFeeValues.fee
                )}, Total: ${formatNumber(lateFeeValues.total)}`
              )
            }
          >
            Copy result
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <ResultBox
          title="Result"
          note="Estimate only; terms vary by contract."
        >
          <div className="flex justify-between">
            <span>Estimated late fee</span>
            <span className="font-semibold text-slate-900">
              {formatNumber(lateFeeValues.fee)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>New total</span>
            <span className="font-semibold text-slate-900">
              {formatNumber(lateFeeValues.total)}
            </span>
          </div>
          <div className="text-xs text-slate-500">
            Daily rate used: {formatNumber(lateFeeValues.dailyRate * 100)}%
          </div>
        </ResultBox>
        <FormulaBox
          lines={[
            "dailyRate = (monthlyRate / 100) / 30",
            "fee = amount * dailyRate * daysOverdue",
            "newTotal = amount + fee",
          ]}
          variables={[
            {
              label: "amount",
              description: "invoice amount due.",
            },
            {
              label: "monthlyRate",
              description: "late fee percent per month.",
            },
            {
              label: "daysOverdue",
              description: "number of days past due.",
            },
          ]}
        />
      </div>
    </div>
  );
};

export default LateFeeTool;
