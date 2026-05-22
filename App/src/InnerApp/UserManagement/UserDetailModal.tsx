import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FiX, FiDollarSign } from "react-icons/fi";

interface User {
  id: string;
  name: string;
  company: string;
  step: number;
  spends: number;
  status: string;
}

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  currency: string;
  convertedSpends: string;
  onStepClick: (username: string, step: number) => void;
  onStatusChange: (updatedUser: User) => void;
  onAddMoney: (amount: number) => void;
}

const STATUS_BADGE: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  terminated: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
};

const UserDetailModal = ({
  isOpen,
  onClose,
  user,
  currency,
  convertedSpends,
  onStepClick,
  onStatusChange,
  onAddMoney,
}: UserDetailModalProps) => {
  const [amount, setAmount] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount > 0) {
      onAddMoney(amount);
      setAmount(0);
    }
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
                    <p className="mt-1 text-sm text-gray-900 dark:text-white font-medium">{user.name}</p>
                  </div>

                  {/* Company */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</h4>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.company}</p>
                  </div>

                  {/* Progress */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Progress</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {[1, 2, 3, 4, 5, 6, 7].map((step) => (
                        <button
                          key={step}
                          className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                            user.step >= step
                              ? "bg-[#65558F] text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                          }`}
                          onClick={() => onStepClick(user.name, step)}
                        >
                          {step}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Status</h4>
                    <select
                      value={user.status}
                      onChange={(e) => onStatusChange({ ...user, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#65558F] appearance-auto"
                    >
                      <option value="new">New</option>
                      <option value="active">Active</option>
                      <option value="failed">Deal Failed</option>
                      <option value="terminated">Terminated</option>
                    </select>
                  </div>

                  {/* Income */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Income</h4>
                    <p className="mt-1 text-sm font-mono text-gray-900 dark:text-white">
                      {convertedSpends} {currency.toUpperCase()}
                    </p>
                  </div>

                  {/* Add Money */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Add Money</h4>
                    <form onSubmit={handleSubmit} className="flex items-end gap-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={amount || ""}
                        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#65558F]"
                        placeholder="Enter amount"
                        required
                      />
                      <button
                        type="submit"
                        className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[#65558F] hover:bg-[#4e4070] text-white text-sm font-medium transition-colors"
                      >
                        <FiDollarSign className="text-sm" />
                        Add
                      </button>
                    </form>
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
