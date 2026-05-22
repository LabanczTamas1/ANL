import React, { useState } from "react";
import { FiInfo, FiX } from "react-icons/fi";

interface AddMoneyModalProps {
  username: string;
  isOpen: boolean;
  onClose: () => void;
  onAddMoney: (amount: number) => void;
}

const AddMoneyModal: React.FC<AddMoneyModalProps> = ({
  username,
  isOpen,
  onClose,
  onAddMoney,
}) => {
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState("RON");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^-?\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError(null);
    }
  };

  const fetchExchangeRate = async (targetCurrency: string) => {
    if (targetCurrency.toUpperCase() === "RON") {
      setExchangeRate(1);
      return;
    }
    try {
      const response = await fetch("https://api.exchangerate-api.com/v4/latest/RON");
      const data = await response.json();
      setExchangeRate(data.rates?.[targetCurrency.toUpperCase()] || 1);
    } catch {
      setExchangeRate(1);
    }
  };

  const handleCurrencyChange = (currencyType: string) => {
    setCurrency(currencyType.toUpperCase());
    fetchExchangeRate(currencyType.toUpperCase());
  };

  const convertToRON = (val: number): number => {
    if (currency === "RON") return val;
    return Number((val / exchangeRate).toFixed(2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount.trim());
    if (isNaN(numericAmount) || numericAmount === 0) {
      setError("Please enter a valid non-zero number.");
      return;
    }
    onAddMoney(convertToRON(numericAmount));
    setAmount("");
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Add Money for {username}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="amount">
              Amount
              <div className="relative group">
                <FiInfo className="w-4 h-4 text-gray-400" />
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block bg-gray-800 dark:bg-gray-700 text-white text-xs rounded-lg py-1.5 px-3 w-56 z-10 shadow-lg">
                  Add a '-' before the number to subtract from the total.
                </div>
              </div>
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                id="amount"
                placeholder="Enter amount"
                value={amount}
                onChange={handleChange}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#65558F] text-sm"
              />
              <select
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#65558F] text-sm appearance-auto"
              >
                <option value="RON">RON</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="HUF">HUF</option>
              </select>
            </div>
            {error && <p className="text-red-500 dark:text-red-400 text-sm mt-1.5">{error}</p>}
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#65558F] hover:bg-[#4e4070] text-white text-sm font-medium transition-colors"
            >
              Add Money
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMoneyModal;
