import React, { useState } from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';


interface AddMoneyModalProps {
  username: string;
  isOpen: boolean;
  onClose: () => void;
  onAddMoney: (username: string, amount: number) => void;
}

const AddMoneyModal: React.FC<AddMoneyModalProps> = ({
  username,
  isOpen,
  onClose,
  onAddMoney,
}) => {
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState("ron");
  const [exchangeRate, setExchangeRate] = useState(1);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^-?\d*\.?\d*$/.test(value)) {
      // Allow negative numbers and decimals
      setAmount(value);
    }
  };

  const fetchExchangeRate = async (targetCurrency: string) => {
    if (targetCurrency === "ron") {
      setExchangeRate(1);
      return;
    }

    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/RON`
      );
      const data = await response.json();
      const rate = data.rates[targetCurrency.toUpperCase()];
      console.log(currency);
      console.log(data);
      console.log(rate);
      setExchangeRate(rate || 1);
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
    }
  };

  const handleCurrencyChange = (currencyType: string) => {
    console.log(currencyType);
    setCurrency(currencyType);
    fetchExchangeRate(currencyType);
  };

  const convertSpends = (amount: number) => {
    return Number(((amount * 1) / exchangeRate).toFixed(2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount); // Use parseFloat for handling decimals
    console.log(
      "amount added: ",
      typeof numericAmount,
      numericAmount,
      typeof amount,
      amount
    );

    // Ensure that the numeric amount is valid and greater than 0 or less than 0
    if (!isNaN(numericAmount) && numericAmount !== 0) {
      onAddMoney(username, convertSpends(numericAmount));
      setAmount(""); // Reset input field after submission
    } else {
      console.error("Invalid amount");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
        <h2 className="text-xl font-bold mb-4">Add Money for {username}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="flex gap-2 items-center text-center block text-gray-700 font-medium mb-2"
              htmlFor="amount"
            >
              Amount{" "}
              <div className="relative group">
              <i className="fas fa-info-circle text-md"></i>
                <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 md:w-[300px] w-[150px]">
                If you put a '-' sign in front of the number, you can subtract from the total!
                </div>
              </div>
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                id="amount"
                step="0.01"
                placeholder="Enter amount"
                value={amount}
                onChange={handleChange}
                className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <select
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="ml-2 border border-gray-300 p-1 rounded"
              >
                <option value="RON">RON</option>
                <option value="EUR">EURO</option>
                <option value="USD">USD</option>
                <option value="HUF">HUF</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg"
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
