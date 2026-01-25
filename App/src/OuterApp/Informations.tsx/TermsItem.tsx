import React from 'react';

interface TermsItemsProps {
  title: string;
  information: string;
  explanation?: string;
}

const TermsItem: React.FC<TermsItemsProps> = ({ title, information, explanation }) => {
  return (
    <div className="py-4">
      <h2 className="text-xl md:text-2xl font-semibold pb-2">{title}</h2>
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 border-t border-gray-300 pt-4">
        <div className="w-full md:w-3/5 text-justify">{information}</div>
        {explanation && (
          <div className="w-full md:w-2/5 text-justify">
            <h3 className="text-lg font-semibold mb-1">Explanation:</h3>
            {explanation}
          </div>
        )}
      </div>
    </div>
  );
};

export default TermsItem;
