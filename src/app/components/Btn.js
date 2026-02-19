// components/Btn.jsx
export default function Btn({ title , type = 'button', onClick, className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        w-full h-12 rounded-lg font-semibold text-white
        bg-[#751312] hover:bg-red-800 transition cursor-pointer
        ${className}
      `}
    >
      {title}
    </button>
  );
}

