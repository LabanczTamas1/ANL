import React from 'react';

interface MonthCardProps {
  month: string;
  number: number;
  moneyValue: number;
  displayType?: 'terminatedCount' | 'moneyValue';
}

const MonthCard: React.FC<MonthCardProps> = ({ 
  month, 
  number, 
  moneyValue,
  displayType = 'terminatedCount'
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 transition-all hover:shadow-md">
      <div className="flex flex-col h-full">
        <div className="mb-2">
          <span className="text-sm font-medium text-gray-500">{month}</span>
        </div>
        
        <div className="flex-1 flex flex-col justify-center items-center py-4">
          {displayType === 'terminatedCount' ? (
            <>
              <span className="text-sm text-gray-600 mb-1">Terminated Clients</span>
              <span className="text-3xl font-bold text-[#65558F]">{number}</span>
            </>
          ) : (
            <>
              <span className="text-sm text-gray-600 mb-1">Value</span>
              <span className="text-3xl font-bold text-emerald-600">{moneyValue.toLocaleString()} RON</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthCard;