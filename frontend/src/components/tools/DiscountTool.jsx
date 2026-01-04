import { useMemo, useState } from "react";
import { Copy, RotateCcw } from "lucide-react";
import Button from "../ui/Button";
import toast from "react-hot-toast";
import ResultBox from "./ResultBox";
import FormulaBox from "./FormulaBox";
import { inputClasses, selectClasses } from "./styles";
import { formatNumber, parseAmount } from "./utils";

const DiscountTool = () => {
  const [discountInput, setDiscountInput] = useState({
    amount: "",
    type: "percent",
    value: "",
  });

  const discountValues = useMemo(() => {
    const amount = parseAmount(discountInput.amount);
    const value = parseAmount(discountInput.value);
    const discount =
      discountInput.type === "percent" ? (amount * value) / 100 : value;
    const finalAmount = Math.max(amount - discount, 0);
    return { amount, discount, finalAmount };
  }, [discountInput]);

  const handleDiscountReset = () => {
    setDiscountInput({ amount: "", type: "percent", value: "" });
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
    <div id="discount" className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="text-xs text-slate-500">Amount</label>
            <input
              type="number"
              min="0"
              placeholder="0.00"
              className={inputClasses}
              value={discountInput.amount}
              onChange={(event) =>
                setDiscountInput((prev) => ({
                  ...prev,
                  amount: event.target.value,
                }))
              }
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Type</label>
            <select
              className={selectClasses}
              value={discountInput.type}
              onChange={(event) =>
                setDiscountInput((prev) => ({
                  ...prev,
                  type: event.target.value,
                }))
              }
            >
              <option value="percent">Percent</option>
              <option value="flat">Flat</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500">Value</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              className={inputClasses}
              value={discountInput.value}
              onChange={(event) =>
                setDiscountInput((prev) => ({
                  ...prev,
                  value: event.target.value,
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
            onClick={handleDiscountReset}
          >
            Reset
          </Button>
          <Button
            size="small"
            variant="ghost"
            icon={Copy}
            onClick={() =>
              handleCopy(
                `Discount: ${formatNumber(
                  discountValues.discount
                )}, Final: ${formatNumber(discountValues.finalAmount)}`
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
            <span>Discount</span>
            <span className="font-semibold text-slate-900">
              {formatNumber(discountValues.discount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Final amount</span>
            <span className="font-semibold text-slate-900">
              {formatNumber(discountValues.finalAmount)}
            </span>
          </div>
        </ResultBox>
        <FormulaBox
          lines={[
            "discount = amount * (percent / 100)",
            "discount = flat",
            "final = max(amount - discount, 0)",
          ]}
          variables={[
            {
              label: "amount",
              description: "original invoice amount.",
            },
            {
              label: "percent",
              description: "discount percent when type is percent.",
            },
            {
              label: "flat",
              description: "flat discount when type is flat.",
            },
          ]}
        />
      </div>
    </div>
  );
};

export default DiscountTool;
