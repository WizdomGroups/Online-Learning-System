import React, { useEffect, useRef } from "react";
import { CheckCircle } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  cancelText?: string;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  onClose?: () => void; // Called on outside click
}

const ConfirmationModal: React.FC<SuccessModalProps> = ({
  isOpen,
  title,
  subtitle = "",
  cancelText = "Cancel",
  confirmText = "View",
  onCancel,
  onConfirm,
  onClose,
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
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle className="text-green-500 h-8 w-8" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-200 text-gray-500 rounded"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-orange-500 text-white font-medium rounded hover:bg-orange-600"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
