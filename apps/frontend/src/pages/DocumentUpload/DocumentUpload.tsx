import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/UI/Button';
import { Card } from '@/components/UI/Card';
import { useNotifications } from '@/components/Notification/NotificationProvider';
import { useLoading } from '@/components/Loading/LoadingProvider';
import { cn, formatFileSize } from '@/utils';

export function DocumentUpload(): React.ReactElement {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const { showNotification } = useNotifications();
  const { showLoading, hideLoading, updateProgress } = useLoading();

  const maxFileSize = 50; 

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {

    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(({ file, errors }) => {
        const errorMessages = errors.map((error: any) => {
          switch (error.code) {
            case 'file-too-large':
              return `File "${file.name}" is too large. Maximum size is ${maxFileSize}MB.`;
            case 'file-invalid-type':
              return `File "${file.name}" is not a supported format. Please upload PDF, DOC, DOCX, or TXT files.`;
            default:
              return `File "${file.name}" could not be uploaded: ${error.message}`;
          }
        });
        return errorMessages.join(' ');
      });

      showNotification({
        type: 'error',
        title: 'Upload Error',
        message: errors.join(' '),
      });
    }

    if (acceptedFiles.length > 0) {
      setFiles(prev => [...prev, ...acceptedFiles]);
      showNotification({
        type: 'success',
        title: 'Files Added',
        message: `${acceptedFiles.length} file(s) added to upload queue.`,
      });
    }
  }, [showNotification]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: maxFileSize * 1024 * 1024,
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      showNotification({
        type: 'warning',
        title: 'No Files Selected',
        message: 'Please select at least one file to upload.',
      });
      return;
    }

    setUploading(true);
    showLoading({
      message: 'Uploading documents...',
      progress: 0,
    });

    try {

      for (let i = 0; i <= 100; i += 10) {

        updateProgress(i, `Uploading... ${i}%`);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      updateProgress(100, 'Processing documents...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      showNotification({
        type: 'success',
        title: 'Upload Successful',
        message: `${files.length} document(s) uploaded and queued for analysis.`,
      });

      setFiles([]);

    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Upload Failed',
        message: 'An error occurred while uploading your documents. Please try again.',
      });
    } finally {
      setUploading(false);
      hideLoading();
    }
  };

  return (
    <div className="space-y-8">
      {}
      <div>
        <h1 className="text-3xl font-heading font-bold text-slate-900">
          Upload Documents
        </h1>
        <p className="mt-2 text-slate-600">
          Upload your contracts and legal documents for AI-powered analysis and risk assessment.
        </p>
      </div>

      {}
      <Card>
        <div
          {...getRootProps()}
          className={cn(
            'relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer',
            isDragActive && !isDragReject && 'border-blue-400 bg-blue-50',
            isDragReject && 'border-red-400 bg-red-50',
            !isDragActive && 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
          )}
        >
          <input {...getInputProps()} />

          <div className="space-y-4">
            {}
            <div className="flex justify-center">
              <div className={cn(
                'flex items-center justify-center w-16 h-16 rounded-full',
                isDragActive && !isDragReject && 'bg-blue-100',
                isDragReject && 'bg-red-100',
                !isDragActive && 'bg-slate-100'
              )}>
                <Upload className={cn(
                  'h-8 w-8',
                  isDragActive && !isDragReject && 'text-blue-600',
                  isDragReject && 'text-red-600',
                  !isDragActive && 'text-slate-600'
                )} />
              </div>
            </div>

            {}
            <div>
              {isDragActive ? (
                isDragReject ? (
                  <>
                    <h3 className="text-lg font-medium text-red-600 mb-2">
                      Invalid file type
                    </h3>
                    <p className="text-red-600">
                      Please upload PDF, DOC, DOCX, or TXT files only.
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium text-blue-600 mb-2">
                      Drop files here
                    </h3>
                    <p className="text-blue-600">
                      Release to upload your documents
                    </p>
                  </>
                )
              ) : (
                <>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    Drag & drop your documents here
                  </h3>
                  <p className="text-slate-600 mb-4">
                    or click to browse files
                  </p>
                  <Button variant="outline">
                    Choose Files
                  </Button>
                </>
              )}
            </div>

            {}
            <div className="text-sm text-slate-500">
              <p>Supported formats: PDF, DOC, DOCX, TXT</p>
              <p>Maximum file size: {maxFileSize}MB</p>
            </div>
          </div>
        </div>
      </Card>

      {}
      {files.length > 0 && (
        <Card>
          <div className="mb-4">
            <h2 className="text-lg font-heading font-semibold text-slate-900 mb-2">
              Selected Files ({files.length})
            </h2>
            <p className="text-slate-600">
              Review your files before uploading
            </p>
          </div>

          <div className="space-y-3">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-slate-400 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {}
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setFiles([])}
              disabled={uploading}
            >
              Clear All
            </Button>
            <Button
              onClick={handleUpload}
              loading={uploading}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : `Upload ${files.length} File(s)`}
            </Button>
          </div>
        </Card>
      )}

      {}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Upload Guidelines
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Ensure documents are clear and readable</li>
              <li>• Remove any password protection before uploading</li>
              <li>• For best results, use high-quality scans or digital documents</li>
              <li>• Analysis typically takes 2-5 minutes per document</li>
              <li>• You'll receive email notifications when analysis is complete</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
