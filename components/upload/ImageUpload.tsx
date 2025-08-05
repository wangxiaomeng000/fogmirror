'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { isValidImageFile, fileToBase64 } from '../../lib/utils';
import { UploadedFile } from '../../types';

interface ImageUploadProps {
  onUpload: (file: UploadedFile) => void;
  maxSize?: number; // bytes
  accept?: string[];
  disabled?: boolean;
}

export default function ImageUpload({ 
  onUpload, 
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  disabled = false
}: ImageUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError(`文件大小超过 ${Math.round(maxSize / 1024 / 1024)}MB 限制`);
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('不支持的文件类型，请上传 JPEG、PNG、GIF 或 WebP 格式的图片');
      } else {
        setError('文件上传失败，请重试');
      }
      return;
    }

    if (acceptedFiles.length === 0) {
      return;
    }

    const file = acceptedFiles[0];
    
    if (!isValidImageFile(file)) {
      setError('无效的图片文件');
      return;
    }

    setUploading(true);
    
    try {
      const base64Data = await fileToBase64(file);
      setPreview(base64Data);
      
      const uploadedFile: UploadedFile = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        data: base64Data,
        uploadedAt: Date.now()
      };

      onUpload(uploadedFile);
    } catch (err) {
      setError('图片处理失败，请重试');
    } finally {
      setUploading(false);
    }
  }, [maxSize, onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple: false,
    disabled: disabled || uploading
  });

  const clearPreview = () => {
    setPreview(null);
    setError(null);
  };

  return (
    <div className="w-full">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {preview ? (
        <div className="relative">
          <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            <Button
              onClick={clearPreview}
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
            }
            ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center space-y-4">
            <Upload className={`h-12 w-12 ${uploading ? 'animate-pulse' : ''} text-gray-400`} />
            
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {uploading ? '处理中...' : isDragActive ? '松开鼠标上传' : '点击或拖拽图片到此处'}
              </p>
              
              <p className="text-sm text-gray-500">
                支持 JPEG、PNG、GIF、WebP 格式，最大 {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </div>
            
            {!uploading && (
              <Button variant="outline" className="mt-4">
                选择图片
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}