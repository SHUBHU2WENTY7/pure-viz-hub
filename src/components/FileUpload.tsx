import { Upload, File, X } from 'lucide-react';
import { useState, useRef, DragEvent } from 'react';
import { toast } from 'sonner';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
}

export const FileUpload = ({ onFilesSelected }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      return ['csv', 'json', 'xlsx', 'xls', 'tsv'].includes(ext || '');
    });

    if (validFiles.length !== files.length) {
      toast.error('Some files were skipped. Only CSV, JSON, and Excel files are supported.');
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} file(s) added`);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = () => {
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
      setSelectedFiles([]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full space-y-4 animate-fade-in">
      <div
        className={`glass-card p-8 border-2 border-dashed transition-all duration-300 ${
          dragActive ? 'border-accent bg-accent/5 scale-[1.02]' : 'border-border hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple
          accept=".csv,.json,.xlsx,.xls,.tsv"
          onChange={handleChange}
        />

        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="p-6 rounded-full bg-primary/10 border border-primary/20">
            <Upload className="w-12 h-12 text-primary" />
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Drop your data files here</h3>
            <p className="text-muted-foreground mb-4">
              or click to browse • Supports CSV, JSON, Excel
            </p>
          </div>

          <button
            onClick={() => inputRef.current?.click()}
            className="btn-primary"
          >
            Select Files
          </button>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="glass-card p-6 space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-lg">Selected Files ({selectedFiles.length})</h4>
            <button onClick={handleAnalyze} className="btn-accent">
              Analyze Data
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 glass-panel rounded-lg group hover:bg-secondary/50 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <File className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>

                <button
                  onClick={() => removeFile(index)}
                  className="p-2 hover:bg-destructive/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
