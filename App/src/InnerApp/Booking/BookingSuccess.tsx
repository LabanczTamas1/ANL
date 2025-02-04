import React from "react";
import { useNavigate } from "react-router-dom";


const BookingSuccess = () => {
     const navigate = useNavigate();

    const navigateFunction = () => {
        setTimeout(() => navigate("/home"), 3000);
    }
    
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center border-2 p-8 rounded-lg">
        <div
          className={`static flex items-center justify-center h-20 w-20 rounded-full`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-20 w-20 text-[#32AB78]"
            viewBox="0 0 24 24"
            fill="none" // Set fill to none for the whole SVG
          >
            <circle cx="12" cy="12" r="9.75" fill="#FFFFFF" />{" "}
            {/* This keeps the circle's color unchanged */}
            <path
              fill="#32AB78" // Set the fill color of the icon inside to white
              fillRule="evenodd"
              d="M2.25 12a9.75 9.75 0 1119.5 0 9.75 9.75 0 01-19.5 0zm13.03-3.78a.75.75 0 011.06 1.06l-5.25 5.25a.75.75 0 01-1.06 0l-2.25-2.25a.75.75 0 011.06-1.06l1.72 1.72 4.72-4.72z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h2 className="font-bold text-[1.5em] text-center">Your booking is scheduled</h2>
        <p className="text-wrap pb-6 leading-2 text-center">
          We've <strong>emailed</strong> you the <strong>meeting link</strong> and look forward to having you join
          us!
        </p>
        <button onClick={navigateFunction} className="bg-[#65558F] w-full h-[3em] text-white text-[1.125em] rounded-lg">
            Close this page
        </button>
      </div>
    </div>
  );
};

export default BookingSuccess;
