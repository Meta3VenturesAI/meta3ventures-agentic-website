import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, X, FileText, Image, File, 
  CheckCircle, AlertCircle, Loader 
} from 'lucide-react';
import { formValidator } from '../../utils/formValidation';

interface FileUploadZoneProps {
  id: string;
  label: string;
  accept?: string[];
  maxSize?: number; // in MB
  maxFiles?: number;
  value?: File[];
  onChange: (_files: File[]) => void;
  onError?: (_error: string) => void;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
}

interface UploadedFile {
  file: File;
  preview?: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  id,
  label,
  accept = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'],
  maxSize = 10, // 10MB default
  maxFiles = 3,
  value = [],
  onChange,
  onError,
  disabled = false,
  required = false,
  helperText
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, [disabled]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(selectedFiles);
  }, []);

  const handleFiles = useCallback((files: File[]) => {
    if (value.length + files.length > maxFiles) {
      onError?.(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles: File[] = [];
    const newUploadedFiles: UploadedFile[] = [];

    files.forEach(file => {
      // Validate file
      const error = formValidator.validateFile(file, {
        maxSize: maxSize * 1024 * 1024,
        allowedTypes: accept
      });

      if (error) {
        onError?.(error);
        newUploadedFiles.push({
          file,
          progress: 0,
          status: 'error',
          error
        });
      } else {
        validFiles.push(file);
        
        // Create preview for images
        let preview: string | undefined;
        if (file.type.startsWith('image/')) {
          preview = URL.createObjectURL(file);
        }

        newUploadedFiles.push({
          file,
          preview,
          progress: 0,
          status: 'uploading'
        });
      }
    });

    // Simulate upload progress
    newUploadedFiles.forEach((uploadedFile, index) => {
      if (uploadedFile.status === 'uploading') {
        simulateUpload(uploadedFile, index);
      }
    });

    setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
    onChange([...value, ...validFiles]);
  }, [value, maxFiles, maxSize, accept, onChange, onError]);

  const simulateUpload = (uploadedFile: UploadedFile, _index: number) => {
    const interval = setInterval(() => {
      setUploadedFiles(prev => {
        const updated = [...prev];
        const file = updated.find(f => f.file === uploadedFile.file);
        
        if (file && file.status === 'uploading') {
          file.progress = Math.min(file.progress + 10, 100);
          
          if (file.progress === 100) {
            file.status = 'success';
            clearInterval(interval);
          }
        }
        
        return updated;
      });
    }, 200);
  };

  const removeFile = useCallback((fileToRemove: File) => {
    setUploadedFiles(prev => prev.filter(f => f.file !== fileToRemove));
    onChange(value.filter(f => f !== fileToRemove));
    
    // Clean up preview URL if it exists
    const uploadedFile = uploadedFiles.find(f => f.file === fileToRemove);
    if (uploadedFile?.preview) {
      URL.revokeObjectURL(uploadedFile.preview);
    }
  }, [value, onChange, uploadedFiles]);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type.includes('pdf')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          id={id}
          multiple={maxFiles > 1}
          accept={accept.join(',')}
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
        />

        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {accept.map(ext => ext.toUpperCase()).join(', ')} up to {maxSize}MB
          </p>
          {maxFiles > 1 && (
            <p className="text-xs text-gray-500">
              Maximum {maxFiles} files
            </p>
          )}
        </div>
      </div>

      {/* Helper Text */}
      {helperText && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2 mt-4">
          {uploadedFiles.map((uploadedFile, index) => {
            const Icon = getFileIcon(uploadedFile.file);
            
            return (
              <div
                key={index}
                className={`
                  flex items-center p-3 rounded-lg border
                  ${uploadedFile.status === 'error' 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                  }
                `}
              >
                {/* File Preview or Icon */}
                <div className="flex-shrink-0 mr-3">
                  {uploadedFile.preview ? (
                    <img 
                      src={uploadedFile.preview} 
                      alt={uploadedFile.file.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                  ) : (
                    <Icon className="w-10 h-10 text-gray-400" />
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(uploadedFile.file.size)}
                  </p>
                  
                  {/* Progress Bar */}
                  {uploadedFile.status === 'uploading' && (
                    <div className="mt-1">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-indigo-600 h-1 rounded-full transition-all"
                              style={{ width: `${uploadedFile.progress}%` }}
                            />
                          </div>
                        </div>
                        <span className="ml-2 text-xs text-gray-500">
                          {uploadedFile.progress}%
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {uploadedFile.error && (
                    <p className="text-xs text-red-600 mt-1">
                      {uploadedFile.error}
                    </p>
                  )}
                </div>

                {/* Status Icon */}
                <div className="flex-shrink-0 ml-3">
                  {uploadedFile.status === 'uploading' && (
                    <Loader className="w-5 h-5 text-indigo-600 animate-spin" />
                  )}
                  {uploadedFile.status === 'success' && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  {uploadedFile.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>

                {/* Remove Button */}
                {uploadedFile.status !== 'uploading' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(uploadedFile.file);
                    }}
                    className="flex-shrink-0 ml-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* File Count */}
      {value.length > 0 && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {value.length} of {maxFiles} file{maxFiles > 1 ? 's' : ''} uploaded
        </p>
      )}
    </div>
  );
};

export default FileUploadZone;