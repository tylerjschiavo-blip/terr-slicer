/**
 * FileUploadZone Component
 * 
 * Drag-and-drop file upload zone with click-to-browse fallback
 * Validates CSV file types and provides visual feedback
 */

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { cn } from '@/lib/utils';

interface FileUploadZoneProps {
  /** Label for the upload zone */
  label: string;
  /** Description text */
  description?: string;
  /** Callback when file is selected */
  onFileSelect: (file: File) => void;
  /** Currently selected file */
  selectedFile: File | null;
  /** Error message to display */
  error?: string;
  /** Whether the upload zone is disabled */
  disabled?: boolean;
}

export function FileUploadZone({
  label,
  description,
  onFileSelect,
  selectedFile,
  error,
  disabled = false,
}: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Validate file type (XLSX only)
   */
  const validateFile = (file: File): boolean => {
    const isXLSX =
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      file.name.toLowerCase().endsWith('.xlsx');

    if (!isXLSX) {
      setValidationError('Only XLSX files are allowed');
      return false;
    }

    setValidationError('');
    return true;
  };

  /**
   * Handle file selection (drag or browse)
   */
  const handleFileSelection = (file: File) => {
    if (validateFile(file)) {
      onFileSelect(file);
    }
  };

  /**
   * Handle drag over event
   */
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  /**
   * Handle drag leave event
   */
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  /**
   * Handle file drop
   */
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  /**
   * Handle file input change (click to browse)
   */
  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  /**
   * Trigger file input click
   */
  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const displayError = error || validationError;

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer',
          'hover:border-gray-400',
          isDragOver && !disabled && 'border-blue-500 bg-blue-50',
          selectedFile && !displayError && 'border-green-500 bg-green-50',
          displayError && 'border-red-500 bg-red-50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label={`${label} upload zone`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
          aria-label={`${label} file input`}
        />

        <div className="flex flex-col items-center justify-center text-center">
          {/* Upload Icon */}
          <svg
            className={cn(
              'w-12 h-12 mb-3',
              selectedFile && !displayError ? 'text-green-500' : 'text-gray-400',
              isDragOver && !disabled && 'text-blue-500'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {selectedFile && !displayError ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            )}
          </svg>

          {/* Status Text */}
          {selectedFile && !displayError ? (
            <div className="space-y-1">
              <p className="text-sm font-medium text-green-700">
                File selected: {selectedFile.name}
              </p>
              <p className="text-xs text-green-600">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Click or drop another file to replace
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">
                {isDragOver && !disabled
                  ? 'Drop XLSX file here'
                  : 'Drop XLSX file here or click to browse'}
              </p>
              {description && (
                <p className="text-xs text-gray-500">{description}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">XLSX files only</p>
            </div>
          )}

          {/* Error Message */}
          {displayError && (
            <div className="mt-3 text-sm text-red-600 font-medium">
              {displayError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
