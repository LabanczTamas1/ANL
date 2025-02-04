import React from 'react';

interface TermsItemsProps {
  title: string;
  information: string;
  explanation?: string;
}

const TermsItem: React.FC<TermsItemsProps> = ({
  title,
  information,
  explanation,
}) => {
  return (
    <div className="py-4">
      <h2 className="text-[1.5em] font-semibold pb-2">{title}</h2>
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 border-t-[1px] border-[rgba(0,0,0,0.25)] pt-4">
        <div className="w-full md:w-[60%]">{information}</div>
        {explanation !== undefined && (
          <div className="w-full md:w-[40%]">
            <h3 className="text-[1.2em] font-semibold">Explanation:</h3>
            {explanation}
          </div>
        )}
      </div>
    </div>
  );
};

export default TermsItem;
