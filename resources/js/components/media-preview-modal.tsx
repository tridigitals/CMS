import * as React from 'react';
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { XIcon, FileText, FileVideo, FileImage, Download, Copy, ChevronLeft, ChevronRight } from 'lucide-react';

function formatSize(size?: number) {
  if (!size) return '-';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function formatDate(date?: string) {
  if (!date) return '-';
  return new Date(date).toLocaleString();
}

export interface MediaPreviewModalProps {
  url: string;
  type: string;
  name: string;
  size?: number;
  uploadedAt?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  index?: number;
  mediaList?: any[];
  setModalData?: (data: any) => void;
}

export function MediaPreviewModal({ url, type, name, size, uploadedAt, open, onOpenChange, index, mediaList, setModalData }: MediaPreviewModalProps) {
  const [copied, setCopied] = React.useState(false);
  const validIndex = typeof index === 'number' && Number.isFinite(index) && index >= 0 && mediaList && Array.isArray(mediaList) && index < mediaList.length;
  const canPrev = validIndex && index! > 0;
  const canNext = validIndex && index! < (mediaList!.length - 1);

  // Keyboard navigation
  React.useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && canPrev) handlePrev();
      if (e.key === 'ArrowRight' && canNext) handleNext();
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  const handlePrev = () => {
    if (!canPrev || !mediaList || !setModalData || typeof index !== 'number') return;
    const prev = mediaList[index - 1];
    if (!prev) return;
    setModalData({
      url: prev.url,
      type: prev.mime_type || 'image',
      name: prev.name,
      size: prev.size,
      uploadedAt: prev.created_at,
      index: index - 1,
      mediaList,
      setModalData,
    });
  };

  const handleNext = () => {
    if (!canNext || !mediaList || !setModalData || typeof index !== 'number') return;
    const next = mediaList[index + 1];
    if (!next) return;
    setModalData({
      url: next.url,
      type: next.mime_type || 'image',
      name: next.name,
      size: next.size,
      uploadedAt: next.created_at,
      index: index + 1,
      mediaList,
      setModalData,
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/70 backdrop-blur-sm animate-fadeIn" />
        <DialogContent
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-200 p-0 animate-modalIn"
          style={{
            resize: 'both',
            overflow: 'auto',
            minWidth: 320,
            minHeight: 200,
            maxWidth: '98vw',
            maxHeight: '98vh',
          }}
        >
          <DialogTitle className="sr-only">Preview Media</DialogTitle>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50">
            <div className="font-semibold text-base truncate" title={name}>{name}</div>
          </div>
          {/* Media Preview */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 md:p-8 relative" style={{ minHeight: 220 }}>
            {/* Media */}
            <div className="flex flex-col items-center w-full">
              {type.startsWith('image') ? (
                <img
                  src={url}
                  alt={name}
                  className="rounded-lg shadow-xl border border-white/10 transition-transform duration-300 hover:scale-105 bg-black w-full max-w-full md:max-w-2xl"
                  style={{
                    height: 'auto',
                    maxHeight: '60vh',
                    objectFit: 'contain',
                    margin: '0 auto',
                    background: '#222',
                  }}
                />
              ) : type.startsWith('video') ? (
                <video
                  src={url}
                  controls
                  className="rounded-lg shadow-xl border border-white/10 bg-black transition-transform duration-300 hover:scale-105 w-full max-w-full md:max-w-2xl"
                  style={{
                    height: 'auto',
                    maxHeight: '60vh',
                    objectFit: 'contain',
                    margin: '0 auto',
                    background: '#222',
                  }}
                />
              ) : type === 'application/pdf' ? (
                <a href={url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
                  <FileText size={64} className="mb-2 text-gray-300" />
                  <span className="text-white">Lihat PDF</span>
                </a>
              ) : type === 'application/msword' || type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
                <a href={url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
                  <FileText size={64} className="mb-2 text-gray-300" />
                  <span className="text-white">Download Dokumen</span>
                </a>
              ) : (
                <div className="flex flex-col items-center">
                  <FileText size={64} className="mb-2 text-gray-300" />
                  <span className="text-white">Tidak dapat preview file ini</span>
                </div>
              )}
              {/* Navigation below media */}
              {(canPrev || canNext || (validIndex && mediaList && mediaList.length > 1)) && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  {canPrev && (
                    <button
                      onClick={handlePrev}
                      className="bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-lg p-2 border border-gray-300 transition-transform hover:scale-110"
                      aria-label="Sebelumnya"
                    >
                      <ChevronLeft size={28} />
                    </button>
                  )}
                  {validIndex && mediaList && mediaList.length > 1 && (
                    <span className="text-xs text-gray-300 font-medium mx-2">{index! + 1} / {mediaList.length}</span>
                  )}
                  {canNext && (
                    <button
                      onClick={handleNext}
                      className="bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-lg p-2 border border-gray-300 transition-transform hover:scale-110"
                      aria-label="Berikutnya"
                    >
                      <ChevronRight size={28} />
                    </button>
                  )}
                </div>
              )}
              {/* Info & Controls */}
              <div className="w-full flex flex-col md:flex-row items-center justify-between gap-2 mt-4 px-2">
                <div className="flex flex-col md:flex-row md:items-center gap-2 text-xs text-gray-300">
                  <span><span className="font-medium text-gray-100">Tipe:</span> {type}</span>
                  {size && <span><span className="font-medium text-gray-100">Ukuran:</span> {formatSize(size)}</span>}
                  {uploadedAt && <span><span className="font-medium text-gray-100">Diunggah:</span> {formatDate(uploadedAt)}</span>}
                </div>
                <div className="flex gap-2">
                  <a
                    href={url}
                    download
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700 transition shadow"
                  ><Download size={16} className="mr-1" /> Download</a>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition shadow"
                  >
                    <Copy size={16} className="mr-1" /> {copied ? 'Copied!' : 'Copy URL'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

// Animasi tambahan (Tailwind CSS):
// .animate-fadeIn { animation: fadeIn 0.3s; }
// .animate-modalIn { animation: modalIn 0.25s cubic-bezier(.4,0,.2,1); }
// @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
// @keyframes modalIn { from { opacity:0; transform:scale(.95) translate(-50%,-50%) } to { opacity:1; transform:scale(1) translate(-50%,-50%) } }
