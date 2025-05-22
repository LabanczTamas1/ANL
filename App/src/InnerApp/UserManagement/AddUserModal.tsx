import React from 'react';
import { X as XMarkIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: any) => void; // Changed to accept userData
}

interface NewUserInputs {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  company: string; // Added company field
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
      if (!token) {
        throw new Error("No auth token found");
      }

      const response = await fetch(`${API_BASE_URL}/api/add-user`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add user');
      }

      // Call parent component's onSubmit to update the users state
      onSubmit(result);
      
      // Reset form and close modal
      reset();
      onClose();
    } catch (error) {
      console.error('Error adding user:', error);
      alert(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg max-w-lg w-full p-6 text-black">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-100" onClick={onClose}>
          <XMarkIcon className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center text-black">Add New User</h2>

        <form onSubmit={handleSubmit(submitForm)}>
          <div className="flex lg:flex-row flex-col justify-between">
            <div className="mb-4 lg:pr-2">
              <input
                id="firstName"
                type="text"
                placeholder="First Name"
                className={`w-full p-2 rounded border ${
                  errors.firstName ? 'border-red-500' : '[#080A0D]'
                }`}
                {...register('firstName', { required: 'First name is required' })}
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
            </div>

            <div className="mb-4 lg:pl-2">
              <input
                id="lastName"
                type="text"
                placeholder="Last Name"
                className={`w-full p-2 rounded border ${
                  errors.lastName ? 'border-red-500' : '[#080A0D]'
                }`}
                {...register('lastName', { required: 'Last name is required' })}
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="mb-4">
            <input
              id="email"
              type="email"
              placeholder="Email"
              className={`w-full p-2 rounded border ${errors.email ? 'border-red-500' : '[#080A0D]'}`}
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div className="mb-4">
            <input
              id="username"
              type="text"
              placeholder="Username"
              className={`w-full p-2 rounded border ${
                errors.username ? 'border-red-500' : '[#080A0D]'
              }`}
              {...register('username', { required: 'Username is required' })}
            />
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
          </div>

          <div className="mb-4">
            <input
              id="company"
              type="text"
              placeholder="Company Name"
              className={`w-full p-2 rounded border`}
              {...register('company')}
            />
          </div>

          <button type="submit" className="w-full bg-[#65558F] hover:bg-purple-600 text-white font-bold py-2 px-4 rounded">
            Add User
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;