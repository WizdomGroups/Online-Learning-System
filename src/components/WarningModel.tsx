import React, { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import ButtonPrimary from "./ButtonPrimary";
import ButtonSecondary from "./ButtonSecondary";

interface WarningModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  cancelText?: string;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  onClose?: () => void; // Called on outside click
}

const WarningModal: React.FC<WarningModalProps> = ({
  isOpen,
  title,
  subtitle = "",
  confirmText = "OK",
  onConfirm,
  onClose,
  cancelText,
  onCancel,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose?.(); // Only if onClose is provided
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        ref={modalRef}
        className="bg-white w-[90%] max-w-md rounded-lg shadow-lg p-8 text-center"
      >
        <div className="flex justify-center mb-4">
          <div className="bg-amber-100 p-3 rounded-full">
            <AlertTriangle className="text-amber-500 h-8 w-8" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        <div className="mt-6 flex justify-center gap-4">
          {onCancel && cancelText && (
            <ButtonSecondary onClick={onCancel} text={cancelText} />
          )}
          
          {onConfirm && confirmText && (
            <ButtonPrimary onClick={onConfirm} text={confirmText} />
          )}
        </div>
      </div>
    </div>
  );
};

export default WarningModal;