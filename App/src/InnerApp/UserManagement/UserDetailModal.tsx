import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FiX, FiDollarSign, FiClock } from "react-icons/fi";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  progressionStatus: string;
  progressionCategory: string;
  progressionTimeline: string;
}

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  balance: number;
  onStatusChange: (status: string) => void;
  onProgressUpdate: (updates: { progressionCategory?: string; progressionTimeline?: string }) => void;
  onOpenMoney: () => void;
  onOpenHistory: () => void;
}

const UserDetailModal = ({
  isOpen,
  onClose,
  user,
  balance,
  onStatusChange,
  onProgressUpdate,
  onOpenMoney,
  onOpenHistory,
}: UserDetailModalProps) => {
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
              <Dialog.Panel className="w-full max-w-md rounded-xl bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 p-6 shadow-2xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white">
                    User Details
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</h4>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</h4>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.email}</p>
                  </div>

                  {/* Company */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</h4>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.company || "—"}</p>
                  </div>

                  {/* Status */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Status</h4>
                    <select
                      value={user.progressionStatus}
                      onChange={(e) => onStatusChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#65558F] appearance-auto"
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="terminated">Terminated</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Category</h4>
                    <input
                      type="text"
                      value={user.progressionCategory}
                      onChange={(e) => onProgressUpdate({ progressionCategory: e.target.value })}
                      placeholder="Enter category"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#65558F]"
                    />
                  </div>

                  {/* Timeline */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Timeline</h4>
                    <input
                      type="text"
                      value={user.progressionTimeline}
                      onChange={(e) => onProgressUpdate({ progressionTimeline: e.target.value })}
                      placeholder="Enter timeline"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#65558F]"
                    />
                  </div>

                  {/* Balance & Finance */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance</h4>
                        <p className="mt-1 text-lg font-mono font-semibold text-gray-900 dark:text-white">
                          {balance.toFixed(2)} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">RON</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={onOpenMoney}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#65558F] hover:bg-[#4e4070] text-white text-sm font-medium transition-colors"
                      >
                        <FiDollarSign className="text-sm" />
                        Add / Remove Money
                      </button>
                      <button
                        onClick={onOpenHistory}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 text-sm font-medium transition-colors"
                      >
                        <FiClock className="text-sm" />
                        History
                      </button>
                    </div>
                  </div>
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
