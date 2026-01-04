import { useState } from "react";
import { ArrowRightLeft, Copy, RotateCcw } from "lucide-react";
import { convertCurrency } from "../../api/toolsApi";
import Button from "../ui/Button";
import toast from "react-hot-toast";
import ResultBox from "./ResultBox";
import FormulaBox from "./FormulaBox";
import { inputClasses, selectClasses } from "./styles";
import { formatNumber, parseAmount } from "./utils";

const currencyOptions = ["USD", "EUR", "GBP", "INR", "CAD", "AUD", "JPY"];

const CurrencyTool = () => {
  const [fxInput, setFxInput] = useState({
    amount: "",
    from: "USD",
    to: "INR",
  });
  const [fxResult, setFxResult] = useState(null);
  const [fxLoading, setFxLoading] = useState(false);
  const [fxError, setFxError] = useState("");

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

  const handleFxSwap = () => {
    setFxInput((prev) => ({ ...prev, from: prev.to, to: prev.from }));
    setFxResult(null);
    setFxError("");
  };

  const handleFxReset = () => {
    setFxInput({ amount: "", from: "USD", to: "INR" });
    setFxResult(null);
    setFxError("");
  };

  const handleFxConvert = async () => {
    setFxError("");
    const amount = parseAmount(fxInput.amount);
    if (!fxInput.from || !fxInput.to || amount <= 0) {
      setFxError("Enter a valid amount and currencies.");
      return;
    }

    setFxLoading(true);
    try {
      const response = await convertCurrency(amount, fxInput.from, fxInput.to);
      setFxResult(response.data);
    } catch (error) {
      setFxError("Failed to fetch rates.");
    } finally {
      setFxLoading(false);
    }
  };

  return (
    <div id="currency" className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div className="sm:col-span-2">
            <label className="text-xs text-slate-500">Amount</label>
            <input
              type="number"
              min="0"
              placeholder="0.00"
              className={inputClasses}
              value={fxInput.amount}
              onChange={(event) =>
                setFxInput((prev) => ({
                  ...prev,
                  amount: event.target.value,
                }))
              }
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">From</label>
            <select
              className={selectClasses}
              value={fxInput.from}
              onChange={(event) =>
                setFxInput((prev) => ({
                  ...prev,
                  from: event.target.value,
                }))
              }
            >
              {currencyOptions.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFxSwap}
              className="h-10 w-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              aria-label="Swap currencies"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </button>
            <div className="flex-1">
              <label className="text-xs text-slate-500">To</label>
              <select
                className={selectClasses}
                value={fxInput.to}
                onChange={(event) =>
                  setFxInput((prev) => ({
                    ...prev,
                    to: event.target.value,
                  }))
                }
              >
                {currencyOptions.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {fxError && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {fxError}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            size="small"
            variant="secondary"
            onClick={handleFxConvert}
            isLoading={fxLoading}
          >
            Convert
          </Button>
          <Button
            size="small"
            variant="ghost"
            icon={RotateCcw}
            onClick={handleFxReset}
          >
            Reset
          </Button>
          <Button
            size="small"
            variant="ghost"
            icon={Copy}
            onClick={() => {
              if (!fxResult) {
                toast.error("Convert first to copy the result.");
                return;
              }
              handleCopy(
                `${fxResult.amount} ${fxResult.from} = ${formatNumber(
                  fxResult.converted
                )} ${fxResult.to} (rate ${fxResult.rate})`
              );
            }}
          >
            Copy result
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <ResultBox title="Result" note="For reference only; rates may vary.">
          {fxResult ? (
            <>
              <div className="flex justify-between">
                <span>
                  {fxResult.amount} {fxResult.from}
                </span>
                <span className="font-semibold text-slate-900">
                  {formatNumber(fxResult.converted)} {fxResult.to}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                Rate used: {fxResult.rate} ({fxResult.timestamp})
              </div>
            </>
          ) : (
            <span className="text-slate-500 text-sm">
              Enter an amount and convert to see results.
            </span>
          )}
        </ResultBox>
        <FormulaBox
          lines={["converted = amount * rate"]}
          variables={[
            {
              label: "amount",
              description: "value entered in the source currency.",
            },
            {
              label: "rate",
              description: "exchange rate from the FX API.",
            },
          ]}
        />
      </div>
    </div>
  );
};

export default CurrencyTool;

