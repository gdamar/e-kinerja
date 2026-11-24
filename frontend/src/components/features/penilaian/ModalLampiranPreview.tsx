import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileText } from 'lucide-react';

interface ModalLampiranPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  url: string | null;
}

export function ModalLampiranPreview({
  isOpen,
  onClose,
  url,
}: ModalLampiranPreviewProps) {
  if (!url) return null;

  const isPdf = url.toLowerCase().includes('.pdf');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-4">
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <DialogTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Lampiran Bukti Banding
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-8 text-xs gap-1"
          >
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              Buka di Tab Baru
            </a>
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-2 flex items-center justify-center min-h-[300px] bg-muted/20 rounded-md">
          {isPdf ? (
            <iframe
              src={url}
              className="w-full h-[65vh] rounded border"
              title="Preview Dokumen PDF"
            />
          ) : (
            <img
              src={url}
              alt="Lampiran Bukti"
              className="max-h-[70vh] max-w-full object-contain rounded shadow"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
