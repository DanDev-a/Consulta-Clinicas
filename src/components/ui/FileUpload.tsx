import { useState, useRef, type DragEvent } from 'react';
import { RiUploadCloud2Line, RiCloseLine, RiFileLine, RiImageLine } from 'react-icons/ri';
import Alert from './Alert';

interface FileUploadProps {
  accept?: string[];
  maxSizeMB?: number;
  onUpload: (file: File) => void | Promise<void>;
  onRemove?: (file: File) => void;
  multiple?: boolean;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return RiImageLine;
  return RiFileLine;
}

export default function FileUpload({
  accept = ['application/pdf', 'image/png', 'image/jpeg'],
  maxSizeMB = 10,
  onUpload,
  onRemove,
  multiple = false,
  label = 'Arrastrá un archivo aquí o hacé click',
  error,
  disabled = false,
  className = '',
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const validate = (file: File): string | null => {
    if (!accept.includes(file.type)) {
      return `Tipo no permitido: ${file.type || 'desconocido'}. Permitidos: ${accept.join(', ')}`;
    }
    if (file.size > maxSizeBytes) {
      return `El archivo excede ${maxSizeMB} MB (${formatSize(file.size)})`;
    }
    return null;
  };

  const handleFiles = async (fileList: FileList) => {
    const newFiles = Array.from(fileList);

    for (const file of newFiles) {
      const err = validate(file);
      if (err) {
        setLocalError(err);
        return;
      }
    }

    setLocalError(null);

    if (multiple) {
      setFiles((prev) => [...prev, ...newFiles]);
    } else {
      setFiles(newFiles.slice(0, 1));
    }

    for (const file of newFiles) {
      await onUpload(file);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!disabled && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleRemove = (index: number) => {
    const removed = files[index];
    setFiles((prev) => prev.filter((_, i) => i !== index));
    onRemove?.(removed);
  };

  return (
    <div className={['flex flex-col gap-2', className].join(' ')}>
      {/* Dropzone */}
      <button
        type="button"
        role="button"
        aria-label={label}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        disabled={disabled}
        className={[
          'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer',
          disabled
            ? 'opacity-50 cursor-not-allowed border-[var(--color-border)] bg-[var(--color-surface)]'
            : isDragOver
              ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
              : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]',
        ].join(' ')}
      >
        <RiUploadCloud2Line
          size={32}
          className={isDragOver ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-subtle)]'}
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-medium text-[var(--color-text)]">{label}</p>
          <p className="mt-1 text-xs text-[var(--color-text-subtle)]">
            {accept.map((a) => a.split('/')[1]?.toUpperCase() || a).join(', ')} · Máx. {maxSizeMB} MB
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept.join(',')}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
        />
      </button>

      {/* Error */}
      {(error || localError) && (
        <Alert variant="danger">{error || localError}</Alert>
      )}

      {/* File list */}
      {files.length > 0 && (
        <ul className="flex flex-col gap-1.5" role="list" aria-label="Archivos seleccionados">
          {files.map((file, i) => {
            const Icon = getFileIcon(file.type);
            return (
              <li
                key={`${file.name}-${i}`}
                className="flex items-center gap-3 rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface)] px-3 py-2"
              >
                <Icon size={18} className="shrink-0 text-[var(--color-accent)]" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text)] truncate">{file.name}</p>
                  <p className="text-xs text-[var(--color-text-subtle)]">{formatSize(file.size)}</p>
                </div>
                {onRemove && (
                  <button
                    type="button"
                    onClick={() => handleRemove(i)}
                    aria-label={`Eliminar ${file.name}`}
                    className="shrink-0 p-1 rounded hover:bg-[var(--color-surface-alt)] text-[var(--color-text-subtle)] transition-colors"
                  >
                    <RiCloseLine size={16} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
