import React, { useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";

interface ErrorModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  cancelText?: string;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  onClose?: () => void; // Called on outside click
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  title,
  subtitle = "",
  cancelText = "Close",
  confirmText,
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
        onClose?.();
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
          <div className="bg-red-100 p-3 rounded-full">
            <AlertCircle className="text-primary h-8 w-8" />
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
          {confirmText && (
            <button
              onClick={onConfirm}
              className="px-6 py-2 bg-primary text-white font-medium rounded hover:bg-primary"
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
