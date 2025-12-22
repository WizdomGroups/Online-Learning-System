import React, { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

interface FileInputFieldProps {
  label: string;
  required?: boolean;
  name?: string;
  format?: string;
  accept?: string;
  onChange?: (file: File | null) => void;
  error?: string;
  className?: string;
}

const FileInputField: React.FC<FileInputFieldProps> = ({
  label,
  required = false,
  name,
  accept = ".pdf,.jpg,.png",
  format = "PDF, JPG, PNG",
  onChange,
  error,
  className = "",
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    onChange?.(selectedFile);
  };

  const handleRemove = () => {
    setFile(null);
    onChange?.(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      onChange?.(droppedFile);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      <label className="text-sm text-gray-700 font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div
        className={`
          relative rounded-lg border-2 border-dashed px-4 py-12 text-center 
          transition-all duration-200 cursor-pointer
          ${dragActive 
            ? "border-blue-500 bg-blue-50" 
            : error 
            ? "border-orange-500 focus:ring-orange-500"
            : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
          }
        `}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <Upload
          className={`mx-auto mb-3 ${dragActive ? 'text-blue-500' : 'text-gray-400'} transition-colors`}
          size={32}
          onClick={() => inputRef.current?.click()}
        />
        <p
          className="text-sm text-gray-600 cursor-pointer font-medium"
          onClick={() => inputRef.current?.click()}
        >
          <span className="text-blue-600 hover:text-blue-700 font-semibold">Click to upload</span> or
          drag and drop
        </p>
        <p
          className="text-xs text-gray-500 mt-2 cursor-pointer"
          onClick={() => inputRef.current?.click()}
        >
          Max file size: 5MB • Format: {format}
        </p>
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {file && (
        <div className="mt-3 flex items-center justify-between text-sm bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div>
              <p className="font-semibold text-gray-800">{file.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {(file.size / 1024).toFixed(1)} KB • Uploaded successfully
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="text-gray-400 hover:text-orange-500 p-1 rounded-md hover:bg-red-50 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-xs text-orange-600 bg-red-50 px-3 py-2 rounded-md border border-orange-200 mt-2">
          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
          <span className="font-medium">{error}</span>
        </div>
      )}

  
    </div>
  );
};

export default FileInputField;