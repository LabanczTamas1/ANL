import React from 'react';
import { FiX } from 'react-icons/fi';
import { useForm } from 'react-hook-form';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: any) => void;
}

interface NewUserInputs {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  company: string;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NewUserInputs>();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const submitForm = async (data: NewUserInputs) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token found");

      const response = await fetch(`${API_BASE_URL}/api/v1/user/add-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to add user');

      onSubmit(result);
      reset();
      onClose();
    } catch (error) {
      console.error('Error adding user:', error);
      alert(error);
    }
  };

  if (!isOpen) return null;

  const inputClass = (hasError: boolean) =>
    `w-full px-3 py-2 rounded-lg border text-sm bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#65558F] ${
      hasError ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
    }`;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="relative bg-white dark:bg-[#1e1e1e] rounded-xl w-full max-w-lg p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add New User</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="First Name"
                className={inputClass(!!errors.firstName)}
                {...register('firstName', { required: 'First name is required' })}
              />
              {errors.firstName && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Last Name"
                className={inputClass(!!errors.lastName)}
                {...register('lastName', { required: 'Last name is required' })}
              />
              {errors.lastName && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <input
              type="email"
              placeholder="Email"
              className={inputClass(!!errors.email)}
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <input
              type="text"
              placeholder="Username"
              className={inputClass(!!errors.username)}
              {...register('username', { required: 'Username is required' })}
            />
            {errors.username && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <input
              type="text"
              placeholder="Company Name (optional)"
              className={inputClass(false)}
              {...register('company')}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-[#65558F] hover:bg-[#4e4070] text-white font-semibold text-sm transition-colors"
          >
            Add User
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
