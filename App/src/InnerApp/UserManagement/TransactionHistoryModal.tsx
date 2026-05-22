import { Fragment, useState, useEffect, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  FiX,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  originalAmount: number;
  originalCurrency: string;
  exchangeRate: number;
  amount: number;
  type: "credit" | "debit";
  description: string;
  performedBy: string;
  performedByName: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

const TransactionHistoryModal = ({
  isOpen,
  onClose,
  userId,
  userName,
}: TransactionHistoryModalProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchHistory = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/v1/finance/history/${userId}?page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error("Failed to fetch history");

      const data = await response.json();
      setTransactions(data.transactions || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, userId, page]);

  useEffect(() => {
    if (isOpen) {
      setPage(1);
    }
  }, [isOpen, userId]);

  useEffect(() => {
    if (isOpen) fetchHistory();
  }, [isOpen, fetchHistory]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl rounded-xl bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 p-6 shadow-2xl transition-all max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white">
                      Transaction History
                    </Dialog.Title>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {userName} · {total} transaction{total !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto min-h-0">
                  {loading ? (
                    <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Loading…
                    </div>
                  ) : transactions.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                      No transactions yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div
                              className={`mt-0.5 p-1.5 rounded-full flex-shrink-0 ${
                                tx.type === "credit"
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                  : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                              }`}
                            >
                              {tx.type === "credit" ? (
                                <FiArrowDownLeft className="w-4 h-4" />
                              ) : (
                                <FiArrowUpRight className="w-4 h-4" />
                              )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex flex-col">
                                  <span
                                    className={`text-sm font-semibold ${
                                      tx.type === "credit"
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-red-600 dark:text-red-400"
                                    }`}
                                  >
                                    {tx.type === "credit" ? "+" : "−"}{tx.amount.toFixed(2)} RON
                                  </span>
                                  {tx.originalCurrency && tx.originalCurrency !== "RON" && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {tx.type === "credit" ? "+" : "−"}{tx.originalAmount.toFixed(2)} {tx.originalCurrency}
                                      <span className="ml-1 text-gray-400 dark:text-gray-500">
                                        @ {tx.exchangeRate.toFixed(4)}
                                      </span>
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                                  {formatDate(tx.createdAt)} · {formatTime(tx.createdAt)}
                                </span>
                              </div>

                              {tx.description && (
                                <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                                  {tx.description}
                                </p>
                              )}

                              <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                <span>
                                  By: <span className="text-gray-700 dark:text-gray-300">{tx.performedByName}</span>
                                </span>
                                <span>
                                  Balance: <span className="font-mono">{tx.balanceBefore.toFixed(2)}</span>
                                  {" → "}
                                  <span className="font-mono font-medium text-gray-700 dark:text-gray-300">
                                    {tx.balanceAfter.toFixed(2)}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Page {page} of {totalPages}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="p-1.5 rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="p-1.5 rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default TransactionHistoryModal;
