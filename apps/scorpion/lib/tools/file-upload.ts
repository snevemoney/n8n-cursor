/**
 * File upload utilities for user tools
 */

export interface FileUploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  multiple?: boolean;
}

export interface UploadedFile {
  name: string;
  type: string;
  size: number;
  data: string; // Base64 encoded
  blob?: Blob;
}

/**
 * Convert file to base64
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix if present
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Validate file before upload
 */
export function validateFile(file: File, options: FileUploadOptions = {}): { valid: boolean; error?: string } {
  const { maxSize = 10 * 1024 * 1024, allowedTypes = [] } = options; // Default 10MB
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${maxSize / 1024 / 1024}MB`,
    };
  }
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }
  
  return { valid: true };
}

/**
 * Handle drag and drop file upload
 */
export function setupDragDrop(
  element: HTMLElement,
  onFiles: (files: File[]) => void,
  options: FileUploadOptions = {}
): () => void {
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    element.classList.add('drag-over');
  };
  
  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    element.classList.remove('drag-over');
  };
  
  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    element.classList.remove('drag-over');
    
    const files = Array.from(e.dataTransfer?.files || []);
    const validFiles = files.filter(file => {
      const validation = validateFile(file, options);
      return validation.valid;
    });
    
    if (validFiles.length > 0) {
      onFiles(validFiles);
    }
  };
  
  element.addEventListener('dragover', handleDragOver);
  element.addEventListener('dragleave', handleDragLeave);
  element.addEventListener('drop', handleDrop);
  
  // Return cleanup function
  return () => {
    element.removeEventListener('dragover', handleDragOver);
    element.removeEventListener('dragleave', handleDragLeave);
    element.removeEventListener('drop', handleDrop);
  };
}

/**
 * Open file picker dialog
 */
export function openFilePicker(options: FileUploadOptions = {}): Promise<File[]> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = options.multiple || false;
    
    if (options.allowedTypes && options.allowedTypes.length > 0) {
      input.accept = options.allowedTypes.join(',');
    }
    
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      const validFiles = files.filter(file => {
        const validation = validateFile(file, options);
        return validation.valid;
      });
      
      if (validFiles.length > 0) {
        resolve(validFiles);
      } else {
        reject(new Error('No valid files selected'));
      }
    };
    
    input.oncancel = () => {
      reject(new Error('File picker cancelled'));
    };
    
    input.click();
  });
}

