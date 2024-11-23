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
    <div className="w-[316px]">
      <img src={imageUrl} alt="Person" />
      <div className="bg-black h-271 p-3">
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
