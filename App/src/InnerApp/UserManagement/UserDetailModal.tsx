import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FiX, FiDollarSign, FiClock, FiCalendar, FiUser, FiTrendingUp } from "react-icons/fi";
import { useLanguage } from "../../hooks/useLanguage";
import UserProgressEditor from "../ProgressTracker/UserProgressEditor";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  progressionStatus: string;
}

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  balance: number;
  displayCurrency: string;
  displayRate: number;
  onStatusChange: (status: string) => void;
  onOpenMoney: () => void;
  onOpenHistory: () => void;
  onOpenPending: () => void;
}

type DetailTab = "profile" | "progress" | "finance";

const UserDetailModal = ({
  isOpen,
  onClose,
  user,
  balance,
  displayCurrency,
  displayRate,
  onStatusChange,
  onOpenMoney,
  onOpenHistory,
  onOpenPending,
}: UserDetailModalProps) => {
  const { t } = useLanguage();
  const [tab, setTab] = useState<DetailTab>("profile");

  // Reset to the Profile tab whenever a different user is opened.
  useEffect(() => {
    if (isOpen) setTab("profile");
  }, [isOpen, user.id]);

  const tabs: { id: DetailTab; label: string; Icon: typeof FiUser }[] = [
    { id: "profile", label: t("userMgmt.tabProfile"), Icon: FiUser },
    { id: "progress", label: t("userMgmt.tabProgress"), Icon: FiTrendingUp },
    { id: "finance", label: t("userMgmt.tabFinance"), Icon: FiDollarSign },
  ];

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
              <Dialog.Panel className="w-full max-w-2xl rounded-xl bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 p-6 shadow-2xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="min-w-0">
                    <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white truncate">
                      {`${user.firstName} ${user.lastName}`.trim() || t("userMgmt.titleUserDetails")}
                    </Dialog.Title>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                {/* Section tabs */}
                <div className="flex gap-1 p-1 mb-5 rounded-lg bg-gray-100 dark:bg-[#2a2a2a]">
                  {tabs.map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      onClick={() => setTab(id)}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        tab === id
                          ? "bg-white dark:bg-[#1e1e1e] text-[#65558F] dark:text-white shadow-sm"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      }`}
                    >
                      <Icon className="text-sm" />
                      {label}
                    </button>
                  ))}
                </div>

                <div className="max-h-[60vh] overflow-y-auto pr-1">
                  {/* ── Profile ─────────────────────────────────────────── */}
                  {tab === "profile" && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("userMgmt.name")}</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("userMgmt.email")}</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.email}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("userMgmt.company")}</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.company || "—"}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{t("userMgmt.accountStatus")}</h4>
                        <select
                          value={user.progressionStatus}
                          onChange={(e) => onStatusChange(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#65558F] appearance-auto"
                        >
                          <option value="pending">{t("userMgmt.statusPending")}</option>
                          <option value="active">{t("userMgmt.statusActive")}</option>
                          <option value="inactive">{t("userMgmt.statusInactive")}</option>
                          <option value="terminated">{t("userMgmt.statusTerminated")}</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* ── Progress (milestones) ───────────────────────────── */}
                  {tab === "progress" && (
                    <UserProgressEditor userId={user.id} compact />
                  )}

                  {/* ── Finance ─────────────────────────────────────────── */}
                  {tab === "finance" && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("userMgmt.balance")}</h4>
                        <p className="mt-1 text-2xl font-mono font-semibold text-gray-900 dark:text-white">
                          {(balance * displayRate).toFixed(2)} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{displayCurrency}</span>
                        </p>
                        {displayCurrency !== "RON" && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                            {balance.toFixed(2)} RON
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={onOpenMoney}
                          className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#65558F] hover:bg-[#4e4070] text-white text-sm font-medium transition-colors"
                        >
                          <FiDollarSign className="text-sm" />
                          {t("userMgmt.addRemove")}
                        </button>
                        <button
                          onClick={onOpenPending}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-sm font-medium transition-colors"
                        >
                          <FiCalendar className="text-sm" />
                          {t("userMgmt.expected")}
                        </button>
                        <button
                          onClick={onOpenHistory}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 text-sm font-medium transition-colors"
                        >
                          <FiClock className="text-sm" />
                          {t("userMgmt.history")}
                        </button>
                      </div>
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

export default UserDetailModal;
