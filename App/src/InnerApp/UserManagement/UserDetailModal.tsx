import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";

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
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    User Details
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 h-6 w-6 flex items-center justify-center rounded-full"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Name</h4>
                    <p className="mt-1 text-sm text-gray-900">{user.name}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Company</h4>
                    <p className="mt-1 text-sm text-gray-900">{user.company}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Progress (Steps)</h4>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5, 6, 7].map((step) => (
                        <div
                          key={step}
                          className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-colors duration-200 ${
                            user.step >= step
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}
                          onClick={() => onStepClick(user.name, step)}
                        >
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <select
                      value={user.status}
                      onChange={(e) =>
                        onStatusChange({ ...user, status: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#65558F] focus:border-[#65558F] sm:text-sm"
                    >
                      <option value="new">New</option>
                      <option value="active">Active</option>
                      <option value="failed">Deal failed</option>
                      <option value="terminated">Terminated</option>
                    </select>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Income</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {convertedSpends} {currency.toUpperCase()}
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Add Money</h4>
                    <form onSubmit={handleSubmit} className="flex items-end space-x-2">
                      <div className="flex-1">
                        <label htmlFor="amount" className="sr-only">
                          Amount
                        </label>
                        <input
                          type="number"
                          id="amount"
                          name="amount"
                          min="0"
                          step="0.01"
                          value={amount || ""}
                          onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#65558F] focus:border-[#65558F] sm:text-sm"
                          placeholder="Enter amount"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-[#65558F] text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
                      >
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