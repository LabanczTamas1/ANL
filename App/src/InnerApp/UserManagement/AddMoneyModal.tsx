import React, { useState, useEffect } from "react";
import { FiX, FiInfo } from "react-icons/fi";

const CURRENCIES = ["RON", "EUR", "USD", "GBP", "HUF", "CHF"] as const;

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  currentBalance: number;
  displayCurrency: string;
  displayRate: number;
  onSuccess: () => void;
}

const AddMoneyModal: React.FC<AddMoneyModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
  currentBalance,
  displayCurrency,
  displayRate,
  onSuccess,
}) => {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("RON");
  const [type, setType] = useState<"credit" | "debit">("credit");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewRate, setPreviewRate] = useState<number | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch conversion rate when currency changes
  useEffect(() => {
    if (!isOpen) return;
    if (currency === "RON") {
      setPreviewRate(1);
      return;
    }
    const token = localStorage.getItem("authToken");
    if (!token) return;

    fetch(`${API_BASE_URL}/api/v1/finance/rates`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const rate = data.rates?.[currency];
        // rate = how many currency units per 1 RON
        // to convert FROM currency TO RON: amount / rate
        setPreviewRate(rate ? 1 / rate : null);
      })
      .catch(() => setPreviewRate(null));
  }, [currency, isOpen, API_BASE_URL]);

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
      setError(null);
    }
  };

  const ronEquivalent =
    amount && parseFloat(amount) > 0 && previewRate
      ? parseFloat((parseFloat(amount) * previewRate).toFixed(2))
      : null;

  const displayEquivalent = (ronAmount: number) =>
    displayCurrency === "RON"
      ? `${ronAmount.toFixed(2)} RON`
      : `${(ronAmount * displayRate).toFixed(2)} ${displayCurrency}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Authentication required.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/finance/transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          amount: numericAmount,
          type,
          description,
          currency,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Transaction failed");

      setAmount("");
      setDescription("");
      setType("credit");
      setCurrency("RON");
      setError(null);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {type === "credit" ? "Add" : "Remove"} Money
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* User info */}
        <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-medium text-gray-900 dark:text-white">{userName}</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Current balance:{" "}
            <span className="font-mono font-medium">
              {displayEquivalent(currentBalance)}
            </span>
            {displayCurrency !== "RON" && (
              <span className="text-gray-400 dark:text-gray-500 ml-1">
                ({currentBalance.toFixed(2)} RON)
              </span>
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type selector */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
              Type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType("credit")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  type === "credit"
                    ? "bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-600 text-green-700 dark:text-green-300"
                    : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
              >
                + Add Money
              </button>
              <button
                type="button"
                onClick={() => setType("debit")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  type === "debit"
                    ? "bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-600 text-red-700 dark:text-red-300"
                    : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
              >
                − Remove Money
              </button>
            </div>
          </div>

          {/* Amount + Currency */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Amount
              <div className="relative group">
                <FiInfo className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block bg-gray-800 dark:bg-gray-700 text-white text-xs rounded-lg py-1.5 px-3 w-56 z-10 shadow-lg">
                  Enter the amount in the selected currency. It will be auto-converted to RON at the live exchange rate.
                </div>
              </div>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={handleAmountChange}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#65558F] text-sm"
                autoFocus
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#65558F] text-sm appearance-auto"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Live conversion preview */}
            {currency !== "RON" && ronEquivalent !== null && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                ≈ {ronEquivalent.toFixed(2)} RON
                {previewRate && (
                  <span className="ml-1">(1 {currency} = {previewRate.toFixed(4)} RON)</span>
                )}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
              Description (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Payment for service, Refund, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#65558F] text-sm"
            />
          </div>

          {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}

          {/* Preview */}
          {ronEquivalent !== null && (
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span>Balance after:</span>
                <span className="font-mono font-medium">
                  {(currentBalance + (type === "credit" ? ronEquivalent : -ronEquivalent)).toFixed(2)} RON
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50 ${
                type === "credit"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {submitting ? "Processing…" : type === "credit" ? "Add Money" : "Remove Money"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMoneyModal;
