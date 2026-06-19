import React, { useState, useEffect } from "react";
import { FiX, FiCalendar, FiInfo } from "react-icons/fi";
import { useLanguage } from "../../hooks/useLanguage";

const CURRENCIES = ["RON", "EUR", "USD", "GBP", "HUF", "CHF"] as const;

interface PendingPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  onSuccess: () => void;
}

const PendingPaymentModal: React.FC<PendingPaymentModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
  onSuccess,
}) => {
  const { t } = useLanguage();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("RON");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewRate, setPreviewRate] = useState<number | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Set default due date to 30 days from now
  useEffect(() => {
    if (isOpen && !dueDate) {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setDueDate(d.toISOString().split("T")[0]);
    }
  }, [isOpen, dueDate]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError(t("userMgmt.validPositiveAmount"));
      return;
    }
    if (!dueDate) {
      setError(t("userMgmt.selectDueDate"));
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError(t("userMgmt.authRequired"));
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/finance/pending`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          amount: numericAmount,
          currency,
          description,
          dueDate,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || t("userMgmt.failCreateExpected"));

      setAmount("");
      setDescription("");
      setDueDate("");
      setCurrency("RON");
      setError(null);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || t("userMgmt.somethingWrong"));
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate days until due
  const daysUntilDue = dueDate
    ? Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {t("userMgmt.expectedPayment")}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* User info */}
        <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t("userMgmt.creatingExpectedFor")}{" "}
            <span className="font-medium text-gray-900 dark:text-white">{userName}</span>
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
            <FiInfo className="w-3.5 h-3.5" />
            {t("userMgmt.notCreditWarning")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount + Currency */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
              {t("userMgmt.expectedAmount")}
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

            {currency !== "RON" && ronEquivalent !== null && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                ≈ {ronEquivalent.toFixed(2)} RON
                {previewRate && (
                  <span className="ml-1">(1 {currency} = {previewRate.toFixed(4)} RON)</span>
                )}
              </p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              <FiCalendar className="w-3.5 h-3.5" />
              {t("userMgmt.expectedPaymentDate")}
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#65558F] text-sm"
            />
            {daysUntilDue !== null && daysUntilDue > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {daysUntilDue} {daysUntilDue !== 1 ? t("userMgmt.days") : t("userMgmt.day")} {t("userMgmt.fromNow")}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
              {t("userMgmt.description")}
            </label>
            <input
              type="text"
              placeholder={t("userMgmt.descPlaceholderContract")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#65558F] text-sm"
            />
          </div>

          {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}

          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 text-sm font-medium transition-colors"
            >
              {t("userMgmt.cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? t("userMgmt.creating") : t("userMgmt.createExpectedPayment")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PendingPaymentModal;
