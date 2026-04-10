import React from "react";
const stars = "/LandingPage.svg";

interface InfiniteBackgroundWrapperProps {
  children: React.ReactNode;
}

const InfiniteBackgroundWrapper: React.FC<InfiniteBackgroundWrapperProps> = ({ children }) => {
  return (
    <div
      className="relative w-full min-h-screen bg-no-repeat bg-cover bg-center"
      style={{
        backgroundImage: `url(${stars})`,
        backgroundAttachment: "fixed", // ← makes background stay in place
      }}
    >
      {children}
    </div>
  );
};

export default InfiniteBackgroundWrapper;
