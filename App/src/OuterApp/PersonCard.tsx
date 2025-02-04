import React from "react";

interface PersonCardProps {
  imageUrl: string;
  name: string;
  position: string;
  description: string;
}

const PersonCard: React.FC<PersonCardProps> = ({
  imageUrl,
  name,
  position,
  description,
}) => {
  return (
    <div className="w-[316px] mb-5">
      <img src={imageUrl} alt="Person" />
      <div className="bg-gradient-to-b from-black to-[#65558F] h-271 p-3">
        <div className="flex flex-row justify-between">
          <div className="text-white font-bold">{name}</div>
          <div className="text-white font-bold">{position}</div>
        </div>
        <div className="text-white pt-5">
        {description}
        </div>
      </div>
    </div>
  );
};

export default PersonCard;
