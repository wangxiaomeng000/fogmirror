'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { isValidImageFile, fileToBase64 } from '../../lib/utils';
import { UploadedFile } from '../../types';

interface QuickImageUploadProps {
  onUpload: (file: UploadedFile) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function QuickImageUpload({ 
  onUpload, 
  disabled = false,
  size = 'md'
}: QuickImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isValidImageFile(file)) {
      alert('请选择有效的图片文件 (JPEG, PNG, GIF, WebP)');
      return;
    }

    setUploading(true);
    
    try {
      const base64Data = await fileToBase64(file);
      
      const uploadedFile: UploadedFile = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        data: base64Data,
        uploadedAt: Date.now()
      };

      onUpload(uploadedFile);
    } catch (error) {
      alert('图片处理失败，请重试');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={disabled || uploading}
        variant="outline"
        size="icon"
        className={sizeClasses[size]}
        title="上传图片"
      >
        {uploading ? (
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
        ) : (
          <ImagePlus className={iconSizes[size]} />
        )}
      </Button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />
    </>
  );
}