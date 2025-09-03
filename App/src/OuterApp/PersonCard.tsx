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
    <div className="w-[316px] mb-5 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white/70 backdrop-blur-md relative before:content-[''] before:absolute before:inset-0 before:rounded-lg before:shadow-[0_0_30px_8px_rgba(168,85,247,0.7)] before:pointer-events-none">
      <img
        src={imageUrl}
        alt={name}
        className="w-full object-cover"
      />
      <div className="bg-gradient-to-b from-black/80 to-[#65558F]/80 p-4 flex flex-col justify-between opacity-90">
        <div>
          <div className="flex flex-row justify-between items-center">
            <h2 className="text-white font-bold text-lg">{name}</h2>
            <span className="text-white text-sm font-medium opacity-80">
              {position}
            </span>
          </div>
          <p className="text-white pt-4 text-sm leading-relaxed opacity-90">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PersonCard;
