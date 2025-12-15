import React, { useCallback } from 'react';
import { Upload, FileImage, FileText } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        onFileSelect(file);
      }
    }
  }, [onFileSelect, disabled]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-200 ${
        disabled 
          ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60' 
          : 'border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50/50 cursor-pointer bg-white'
      }`}
    >
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
        <div className="bg-indigo-100 p-4 rounded-full mb-4">
          <Upload className="w-8 h-8 text-indigo-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          Upload Scanned Document
        </h3>
        <p className="text-slate-500 text-sm max-w-xs mx-auto mb-4">
          Drag and drop an image (JPG, PNG) or PDF, or click to browse.
          Ensure the text is legible.
        </p>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <FileImage className="w-4 h-4" />
            <span>Images</span>
          </div>
          <div className="flex items-center gap-1">
             <FileText className="w-4 h-4" />
             <span>PDF</span>
          </div>
        </div>
      </label>
    </div>
  );
};