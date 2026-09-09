import { useState, useCallback } from 'react';
import imageCompression from 'browser-image-compression';
import { Camera, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MAX_FOTO_PER_LOG, MAX_FOTO_SIZE_MB } from '@/lib/constants';

interface ImageUploaderProps {
  files: File[];
  onChange: (files: File[]) => void;
  error?: string;
}

export function ImageUploader({ files, onChange, error }: ImageUploaderProps) {
  const [compressing, setCompressing] = useState(false);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      if (selectedFiles.length === 0) return;

      const remainingSlots = MAX_FOTO_PER_LOG - files.length;
      const filesToProcess = selectedFiles.slice(0, remainingSlots);

      if (filesToProcess.length === 0) return;

      setCompressing(true);

      try {
        const compressedFiles = await Promise.all(
          filesToProcess.map(async (file) => {
            const options = {
              maxSizeMB: MAX_FOTO_SIZE_MB,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            };
            return await imageCompression(file, options);
          })
        );

        onChange([...files, ...compressedFiles]);
      } catch (err) {
        console.error('Error compressing images:', err);
      } finally {
        setCompressing(false);
      }

      // Reset input
      e.target.value = '';
    },
    [files, onChange]
  );

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        Foto ({files.length}/{MAX_FOTO_PER_LOG})
      </label>

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {files.map((file, index) => (
            <div key={index} className="relative aspect-square rounded-md overflow-hidden bg-muted">
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {files.length < MAX_FOTO_PER_LOG && (
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="sr-only"
            disabled={compressing}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={compressing}
            asChild
          >
            <span>
              {compressing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Tambah Foto
                </>
              )}
            </span>
          </Button>
        </label>
      )}

      {error && <p className="text-sm text-status-error">{error}</p>}

      {files.length < 1 && (
        <p className="text-xs text-muted-foreground">
          Minimal 1 foto wajib diunggah
        </p>
      )}
    </div>
  );
}
