import { Fragment, useState, useEffect, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  FiX,
  FiCheck,
  FiXCircle,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import { useLanguage } from "../../hooks/useLanguage";

interface PendingPayment {
  id: string;
  userId: string;
  userName: string;
  originalAmount: number;
  originalCurrency: string;
  amountRON: number;
  exchangeRate: number;
  description: string;
  dueDate: string;
  status: "pending" | "confirmed" | "rejected";
  notified: string;
  createdByName: string;
  createdAt: string;
  resolvedByName: string;
  resolvedAt: string;
  rejectionReason?: string;
}

interface PendingPaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string; // If provided, show only for this user
  userName?: string;
  onUpdate: () => void; // Refresh balances after confirm
}

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: typeof FiClock }> = {
  pending: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300", icon: FiClock },
  confirmed: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300", icon: FiCheckCircle },
  rejected: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300", icon: FiXCircle },
};

const PendingPaymentsModal = ({
  isOpen,
  onClose,
  userId,
  userName,
  onUpdate,
}: PendingPaymentsModalProps) => {
  const { t } = useLanguage();
  const STATUS_LABELS: Record<string, string> = {
    pending: t("userMgmt.filterPending"),
    confirmed: t("userMgmt.filterConfirmed"),
    rejected: t("userMgmt.filterRejected"),
  };
  const FILTER_LABELS: Record<string, string> = {
    all: t("userMgmt.filterAll"),
    pending: t("userMgmt.filterPending"),
    confirmed: t("userMgmt.filterConfirmed"),
    rejected: t("userMgmt.filterRejected"),
  };
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "rejected">("all");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchPayments = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      setLoading(true);
      const url = userId
        ? `${API_BASE_URL}/api/v1/finance/pending/${userId}`
        : `${API_BASE_URL}/api/v1/finance/pending`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      setPayments(data.payments || []);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, userId]);

  useEffect(() => {
    if (isOpen) fetchPayments();
  }, [isOpen, fetchPayments]);

  const handleConfirm = async (pendingId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    setConfirmingId(pendingId);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/finance/pending/${pendingId}/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || t("userMgmt.failConfirm"));
      }
      await fetchPayments();
      onUpdate();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setConfirmingId(null);
    }
  };

  const handleReject = async (pendingId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    setRejectingId(pendingId);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/finance/pending/${pendingId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: rejectReason }),
        }
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || t("userMgmt.failReject"));
      }
      setRejectReason("");
      setRejectingId(null);
      await fetchPayments();
      onUpdate();
    } catch (err: any) {
      alert(err.message);
      setRejectingId(null);
    }
  };

  const filteredPayments =
    filter === "all" ? payments : payments.filter((p) => p.status === filter);

  const pendingCount = payments.filter((p) => p.status === "pending").length;

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isDue = (dueDate: string) => {
    return new Date(dueDate) <= new Date();
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
                      {t("userMgmt.expectedPayments")}
                    </Dialog.Title>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {userName ? `${userName} · ` : ""}{t("userMgmt.pendingCount", { count: String(pendingCount) })}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-1 mb-4 p-1 bg-gray-100 dark:bg-[#2a2a2a] rounded-lg">
                  {(["all", "pending", "confirmed", "rejected"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                        filter === f
                          ? "bg-white dark:bg-[#3a3a3a] text-gray-900 dark:text-white shadow-sm"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      {FILTER_LABELS[f]} {f === "pending" && pendingCount > 0 ? `(${pendingCount})` : ""}
                    </button>
                  ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto min-h-0">
                  {loading ? (
                    <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      {t("userMgmt.loading")}
                    </div>
                  ) : filteredPayments.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                      {filter !== "all"
                        ? t("userMgmt.noExpectedPaymentsFiltered", { filter: FILTER_LABELS[filter] })
                        : t("userMgmt.noExpectedPaymentsAll")}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {filteredPayments.map((p) => {
                        const style = STATUS_STYLES[p.status] || STATUS_STYLES.pending;
                        const StatusIcon = style.icon;
                        const due = isDue(p.dueDate);

                        return (
                          <div
                            key={p.id}
                            className={`p-4 rounded-lg border transition-colors ${
                              p.status === "pending" && due
                                ? "border-amber-300 dark:border-amber-600 bg-amber-50/50 dark:bg-amber-900/10"
                                : "border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                {/* Amount + status */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-base font-semibold text-gray-900 dark:text-white font-mono">
                                    {p.originalAmount.toFixed(2)} {p.originalCurrency}
                                  </span>
                                  {p.originalCurrency !== "RON" && (
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                      ≈ {p.amountRON.toFixed(2)} RON
                                    </span>
                                  )}
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                                    <StatusIcon className="w-3 h-3" />
                                    {STATUS_LABELS[p.status] ?? p.status}
                                  </span>
                                  {p.status === "pending" && due && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                                      <FiAlertCircle className="w-3 h-3" />
                                      {t("userMgmt.due")}
                                    </span>
                                  )}
                                </div>

                                {/* Client + description */}
                                {!userId && (
                                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                    {p.userName}
                                  </p>
                                )}
                                {p.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                    {p.description}
                                  </p>
                                )}

                                {/* Meta */}
                                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                  <span>{t("userMgmt.dueColon")} <span className="font-medium text-gray-700 dark:text-gray-300">{formatDate(p.dueDate)}</span></span>
                                  <span>{t("userMgmt.createdByLine", { date: formatDate(p.createdAt), name: p.createdByName })}</span>
                                  {p.notified === "true" && (
                                    <span className="text-amber-600 dark:text-amber-400">{t("userMgmt.emailSent")}</span>
                                  )}
                                  {p.resolvedAt && (
                                    <span>{t("userMgmt.resolvedByLine", { date: formatDate(p.resolvedAt), name: p.resolvedByName })}</span>
                                  )}
                                </div>

                                {/* Rejection reason */}
                                {p.status === "rejected" && p.rejectionReason && (
                                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                    {t("userMgmt.reasonColon")} {p.rejectionReason}
                                  </p>
                                )}

                                {/* Reject form */}
                                {rejectingId === p.id && (
                                  <div className="mt-3 flex gap-2">
                                    <input
                                      type="text"
                                      placeholder={t("userMgmt.rejectReasonPlaceholder")}
                                      value={rejectReason}
                                      onChange={(e) => setRejectReason(e.target.value)}
                                      className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleReject(p.id)}
                                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
                                    >
                                      {t("userMgmt.confirmReject")}
                                    </button>
                                    <button
                                      onClick={() => { setRejectingId(null); setRejectReason(""); }}
                                      className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm"
                                    >
                                      {t("userMgmt.cancel")}
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Action buttons (only for pending) */}
                              {p.status === "pending" && rejectingId !== p.id && (
                                <div className="flex gap-1.5 flex-shrink-0">
                                  <button
                                    onClick={() => handleConfirm(p.id)}
                                    disabled={confirmingId === p.id}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-colors disabled:opacity-50"
                                    title={t("userMgmt.confirmPaymentReceived")}
                                  >
                                    <FiCheck className="w-3.5 h-3.5" />
                                    {confirmingId === p.id ? "…" : t("userMgmt.confirm")}
                                  </button>
                                  <button
                                    onClick={() => setRejectingId(p.id)}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors"
                                    title={t("userMgmt.rejectNotReceived")}
                                  >
                                    <FiXCircle className="w-3.5 h-3.5" />
                                    {t("userMgmt.reject")}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PendingPaymentsModal;
