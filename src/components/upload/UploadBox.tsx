// src/components/upload/UploadBox.tsx
import { useRef, useState } from 'react';
import { Upload, FolderOpen } from 'lucide-react';
import { clsx } from 'clsx';
import { ACCEPTED_TYPES, MAX_FILE_SIZE } from '../../config/upload';
import type { UploadBoxProps } from '../../types/components';

export default function UploadBox({ onFileSelect, disabled }: UploadBoxProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    function validateAndSelect(file: File) {
        setValidationError(null);

        if (!ACCEPTED_TYPES.includes(file.type)) {
            setValidationError('Only PDF, PNG, JPG, and TXT files are accepted.');
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setValidationError('File must be under 10MB.');
            return;
        }

        onFileSelect(file);
    }

    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) validateAndSelect(file);
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) validateAndSelect(file);
    }

    return (
        <div className="space-y-3">
            <div
                onClick={() => !disabled && inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={clsx(
                    'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center transition-colors',
                    disabled
                        ? 'cursor-not-allowed border-gray-800 bg-gray-900/50'
                        : 'cursor-pointer border-gray-700 bg-gray-900 hover:border-blue-500 hover:bg-gray-800',
                    isDragging && 'border-blue-500 bg-gray-800',
                )}
            >
                {/* Icon */}
                <div className={clsx(
                    'mb-4 rounded-full p-4',
                    isDragging ? 'bg-blue-500/20' : 'bg-gray-800'
                )}>
                    {isDragging
                        ? <FolderOpen className="h-8 w-8 text-blue-400" />
                        : <Upload className="h-8 w-8 text-gray-400" />
                    }
                </div>

                {/* Text */}
                <p className="text-sm font-medium text-white">
                    {isDragging ? 'Drop your file here' : 'Drag and drop your file here'}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                    or click to browse
                </p>
                <p className="mt-3 text-xs text-gray-600">
                    PDF, PNG, JPG, TXT — max 10MB
                </p>

                {/* Hidden input */}
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.txt"
                    className="hidden"
                    onChange={handleInputChange}
                    disabled={disabled}
                />
            </div>

            {/* Validation error */}
            {validationError && (
                <p className="text-xs text-red-400">{validationError}</p>
            )}
        </div>
    );
}