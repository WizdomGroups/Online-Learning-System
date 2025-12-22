import { ArrowLeft } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  type = "button",
  className = "",
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1); // 👈 Go back to the previous page
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      className={`cursor-pointer flex items-center font-normal py-3 hover:underline transition-all duration-200 ${className}`}
    >
      <ArrowLeft size={20} className="mr-1 hover:underline" />
      {/* <span className="text-sm">Back</span> */}
    </button>
  );
};

export default BackButton;
