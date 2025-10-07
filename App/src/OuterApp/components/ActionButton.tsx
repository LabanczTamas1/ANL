import React from 'react'

export interface ActionButtonProps {
    text: string,
    onClick?: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({text, onClick}) => {
  return (
    <button onClick={onClick} className='flex justify-center bg-[#343E4C] text-white text-center p-4 px-20 rounded hover:bg-sky-700 inline-flex items-center whitespace-nowrap'>
        {text}
    </button>
  )
}

export default ActionButton
