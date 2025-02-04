import React from "react";

interface NextButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const NextButton: React.FC<NextButtonProps> = ({ children, icon, ...props }) => {
  return (
    <div
      {...props}
      className="btn btn-neutral btn-sm md:btn-md gap-1 h-auto lg:gap-3 cursor-pointer max-w-[42vw] flex-wrap p-2"
      style={{ minHeight: '2.5rem' }}
    >
      <div className="flex flex-col items-end whitespace-normal break-words leading-tight">
        <span className="text-neutral-content/50 hidden text-xs font-normal md:block">
          Next
        </span>
        <span className="block">{children}</span>
      </div>
      {icon && (
        <svg
          className="h-6 w-6 fill-current md:h-8 md:w-8"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"></path>
        </svg>
      )}
    </div>
  );
};
