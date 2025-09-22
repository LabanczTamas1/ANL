import React from "react";

type Size = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface ANLShapeProps {
  size?: Size;
}

const sizeMap: Record<Size, { width: number; height: number; fontSize: number }> = {
  xs: { width: 80, height: 40, fontSize: 24 },
  sm: { width: 120, height: 60, fontSize: 36 },
  md: { width: 150, height: 75, fontSize: 45 },
  lg: { width: 200, height: 100, fontSize: 60 },
  xl: { width: 250, height: 125, fontSize: 75 },
  "2xl": { width: 200, height: 150, fontSize: 90 },
};

const ANLShape: React.FC<ANLShapeProps> = ({ size = "md" }) => {
  const { width, height, fontSize } = sizeMap[size];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
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
            from={`-${width} 0`}
            to={`${width} 0`}
            dur="5s"
            repeatCount="indefinite"
          />
        </linearGradient>
      </defs>

      <rect width={width} height={height} fill="transparent" />

      <style>
        {`
          .animated-text {
            font-family: Arial, Helvetica, sans-serif;
            font-size: ${fontSize}px;
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

      <text x={width * 0.08} y={height * 0.67} className="animated-text">
        ANL
      </text>
    </svg>
  );
};

export default ANLShape;
