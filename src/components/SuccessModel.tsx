import React, { useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react"; // Using CheckCircle2 for a modern look
import ButtonPrimary from "./ButtonPrimary";
import ButtonSecondary from "./ButtonSecondary";

interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  confirmText?: string;
  onConfirm?: () => void;
  onClose?: () => void;
  cancelText?: string;
  onCancel?: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  title,
  subtitle,
  confirmText = "Continue",
  onConfirm,
  onClose,
  cancelText,
  onCancel,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") onClose?.(); };
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with Blur */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div
        ref={modalRef}
        className="relative bg-white w-full max-w-[400px] rounded-2xl shadow-2xl p-8 text-center transform transition-all animate-in fade-in zoom-in duration-300"
      >
        {/* Modern Icon Ring */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-teal-100 animate-ping opacity-20" />
            <div className="relative bg-teal-50 p-4 rounded-full border border-teal-100">
              <CheckCircle2 className="text-teal-500 h-10 w-10" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
        {subtitle && <p className="text-slate-500 mt-2 leading-relaxed">{subtitle}</p>}

        <div className="mt-8 flex flex-col sm:flex-row-reverse justify-center gap-3">
          {onConfirm && (
            <ButtonPrimary
              onClick={onConfirm}
              text={confirmText}
              className="w-full sm:w-auto" // Full width on mobile
            />
          )}
          {onCancel && cancelText && (
            <ButtonSecondary
              onClick={onCancel}
              text={cancelText}
              className="w-full sm:w-auto border-none hover:bg-transparent text-slate-400 hover:text-slate-600"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;