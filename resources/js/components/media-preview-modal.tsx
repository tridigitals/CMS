import * as React from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogClose,
} from '@/components/ui/dialog';
import { XIcon, FileText, FileVideo, FileImage } from 'lucide-react';

export interface MediaPreviewModalProps {
  url: string;
  type: string; // 'image' | 'video' | 'pdf' | 'doc' | etc
  name: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MediaPreviewModal({ url, type, name, open, onOpenChange }: MediaPreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="max-w-lg w-full p-0 bg-white rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <div className="font-semibold text-sm truncate">{name}</div>
          </div>
          <div className="p-4 flex items-center justify-center min-h-[320px]">
            {type.startsWith('image') ? (
              <img src={url} alt={name} className="max-h-96 max-w-full rounded shadow" />
            ) : type.startsWith('video') ? (
              <video src={url} controls className="max-h-96 max-w-full rounded shadow" />
            ) : type === 'application/pdf' ? (
              <a href={url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
                <FileText size={48} className="mb-2 text-gray-400" />
                <span>Lihat PDF</span>
              </a>
            ) : type === 'application/msword' || type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
              <a href={url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
                <FileText size={48} className="mb-2 text-gray-400" />
                <span>Download Dokumen</span>
              </a>
            ) : (
              <div className="flex flex-col items-center">
                <FileText size={48} className="mb-2 text-gray-400" />
                <span>Tidak dapat preview file ini</span>
              </div>
            )}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
