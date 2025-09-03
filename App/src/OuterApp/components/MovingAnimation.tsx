import React from "react";

const ANLShape: React.FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="150"
      height="75"
      viewBox="0 0 150 75"
    >
      <defs>
        <linearGradient
          id="rainbow-gradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#ff7f00" />
          <stop offset="16%" stopColor="#ff0000" />
          <stop offset="66%" stopColor="#0000ff" />
          <stop offset="83%" stopColor="#4b0082" />
          <stop offset="100%" stopColor="#8b00ff" />
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            from="-150 0"
            to="150 0"
            dur="5s"
            repeatCount="indefinite"
          />
        </linearGradient>
      </defs>

      <rect width="150" height="75" fill="#111" />

      <style>
        {`
          .animated-text {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 45px;
            font-weight: bold;
            fill: none;
            stroke: url(#rainbow-gradient);
            stroke-width: 1.5;
            stroke-dasharray: 250;
            stroke-dashoffset: 0;
            animation: dash 5s linear infinite alternate;
          }

          @keyframes dash {
            0% {
              stroke-dashoffset: 250;
            }
            100% {
              stroke-dashoffset: 0;
            }
          }
        `}
      </style>

      <text
        x="12"
        y="50"
        className="animated-text"
      >
        ANL
      </text>
    </svg>
  );
};

export default ANLShape;
