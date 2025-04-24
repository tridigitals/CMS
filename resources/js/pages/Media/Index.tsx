import React, { useState, useEffect, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import axios, { type AxiosProgressEvent } from 'axios';
import { useDropzone } from 'react-dropzone';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { MediaPreviewModal } from '@/components/media-preview-modal';
import { FileText, FileVideo, FileImage } from 'lucide-react';
import Swal from 'sweetalert2';
import { Pagination } from '@/components/ui/pagination';

interface MediaItem {
  id: number;
  url: string;
  name: string;
  mime_type?: string;
  custom_properties: { [key: string]: any };
  created_at: string;
  size?: number;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Media Library', href: '/media' },
];

const MediaIndex: React.FC = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [search] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    url: string;
    type: string;
    name: string;
    size?: number;
    uploadedAt?: string;
    index?: number;
  } | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });
  const [selectedMediaIds, setSelectedMediaIds] = useState<number[]>([]);

  function getFileType(url: string, name: string): string {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (/jpe?g|png|gif|svg|webp/.test(ext)) return 'image';
    if (/mp4|mov|avi|wmv/.test(ext)) return 'video';
    if (/pdf/.test(ext)) return 'application/pdf';
    if (/docx?/.test(ext)) return 'application/msword';
    return 'other';
  }

  function getIcon(type: string) {
    if (type === 'image') return <FileImage className="text-blue-400" size={32} />;
    if (type === 'video') return <FileVideo className="text-purple-400" size={32} />;
    return <FileText className="text-gray-400" size={32} />;
  }

  function formatSize(bytes: number): string {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    while (bytes >= 1024 && i < sizes.length - 1) { bytes /= 1024; i++; }
    return `${bytes.toFixed(1)} ${sizes[i]}`;
  }

  function getTypeLabel(type: string): string {
    if (type.startsWith('image')) return 'Image';
    if (type.startsWith('video')) return 'Video';
    if (type === 'application/pdf') return 'PDF';
    if (type === 'application/msword' || type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'Word';
    return 'Other';
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const form = new FormData();
      form.append('file', file);
      setLoading(true);
      axios.post('/media/upload', form)
        .then(res => {
          setMedia(prev => [res.data, ...prev]);
          setLoading(false);
          Swal.fire({
            icon: 'success',
            title: 'Upload Berhasil!',
            text: 'Media berhasil diupload!',
            timer: 1500,
            showConfirmButton: false,
          });
        })
        .catch((err) => {
          setLoading(false);
          Swal.fire({
            icon: 'error',
            title: 'Upload Gagal!',
            text: err?.response?.data?.message || 'Terjadi kesalahan saat upload.',
          });
        });
    });
  }, [setMedia]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'video/*': [],
      'application/pdf': [],
      'application/msword': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
    },
    multiple: true,
  });

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/media`, {
        params: { search, page },
      });
      setMedia(res.data.data);
      setPagination({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
        from: res.data.from,
        to: res.data.to,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [search, page]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleUpdateMedia = async (
    id: number,
    data: { name?: string; alt_text?: string; caption?: string }
  ) => {
    try {
      await axios.put(`/media/${id}`, data);
      // Refetch seluruh media setelah update agar thumb & info terbaru
      await fetchMedia();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Yakin hapus media ini?',
      text: 'Aksi ini tidak bisa dibatalkan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    });
    if (!result.isConfirmed) return;
    try {
      setLoading(true);
      await axios.delete(`/media/${id}`);
      setMedia(prev => prev.filter(m => m.id !== id));
      setLoading(false);
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Media berhasil dihapus.',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      setLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Media gagal dihapus.',
      });
    }
  };

  const handleNextMedia = () => {
    if (!modalData || !media.length) return;
    const currentIndex = modalData.index;
    const nextIndex = (currentIndex + 1) % media.length;
    const nextMedia = media[nextIndex];
    setModalData({
      url: nextMedia.url,
      type: nextMedia.mime_type || getFileType(nextMedia.url, nextMedia.name),
      name: nextMedia.name,
      size: nextMedia.size,
      uploadedAt: nextMedia.created_at,
      index: nextIndex,
    });
  };

  const handlePrevMedia = () => {
    if (!modalData || !media.length) return;
    const currentIndex = modalData.index;
    const prevIndex = (currentIndex - 1 + media.length) % media.length;
    const prevMedia = media[prevIndex];
    setModalData({
      url: prevMedia.url,
      type: prevMedia.mime_type || getFileType(prevMedia.url, prevMedia.name),
      name: prevMedia.name,
      size: prevMedia.size,
      uploadedAt: prevMedia.created_at,
      index: prevIndex,
    });
  };

  const isAllSelected = media.length > 0 && media.every(m => selectedMediaIds.includes(m.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedMediaIds([]);
    } else {
      setSelectedMediaIds(media.map(m => m.id));
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedMediaIds(prev =>
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedMediaIds.length === 0) return;
    const result = await Swal.fire({
      title: `Yakin hapus ${selectedMediaIds.length} media?`,
      text: 'Aksi ini tidak bisa dibatalkan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    });
    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      await Promise.all(selectedMediaIds.map(id => axios.delete(`/media/${id}`)));
      setSelectedMediaIds([]);
      await fetchMedia();
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Media berhasil dihapus.',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Sebagian media gagal dihapus.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Media Library" />
      <div className="p-4">
        <div {...getRootProps()} className={`border-2 border-dashed p-4 mb-4 text-center ${isDragActive ? 'bg-gray-100' : ''}`}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop images, videos, docs here...</p>
          ) : (
            <p>Drag & drop files here, or click to select</p>
          )}
        </div>
        {Object.keys(uploadProgress).map(name => (
          <div key={name} className="mb-2">
            <span className="block text-sm">{name}</span>
            <progress value={uploadProgress[name]} max="100" className="w-full" />
          </div>
        ))}
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={handleSelectAll}
            className="mr-2"
          />
          <span className="mr-4">Pilih Semua</span>
          <button
            className={`btn btn-danger btn-sm ${selectedMediaIds.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={selectedMediaIds.length === 0 || loading}
            onClick={handleBulkDelete}
          >
            Bulk Delete
          </button>
          {selectedMediaIds.length > 0 && (
            <span className="ml-2 text-sm text-gray-500">{selectedMediaIds.length} terpilih</span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-56 w-full" />
              ))
            : media.map(m => (
                <div key={m.id} className="relative border rounded-lg p-2 bg-white shadow-sm flex flex-col">
                  <input
                    type="checkbox"
                    checked={selectedMediaIds.includes(m.id)}
                    onChange={() => handleSelectOne(m.id)}
                    className="absolute top-2 left-2 z-10 bg-white border border-gray-300 rounded"
                  />
                  <div
                    className="relative flex items-center justify-center h-32 mb-2 cursor-pointer bg-gray-50 rounded"
                    onClick={() => {
                      const idx = media.findIndex(item => item.id === m.id);
                      setModalData({
                        url: m.url,
                        type: m.mime_type || getFileType(m.url, m.name),
                        name: m.name,
                        size: m.size,
                        uploadedAt: m.created_at,
                        index: idx >= 0 ? idx : 0
                      });
                      setModalOpen(true);
                    }}
                  >
                    {m.mime_type?.startsWith('image') ? (
                      <img src={m.url} alt={m.name} className="max-h-28 max-w-full object-contain rounded" />
                    ) : m.mime_type?.startsWith('video') ? (
                      <video src={m.url} className="max-h-28 max-w-full object-contain rounded" />
                    ) : (
                      getIcon(m.mime_type || getFileType(m.url, m.name))
                    )}
                  </div>
                  <div className="font-medium text-xs truncate mb-1">{m.name}</div>
                  <div className="flex flex-wrap gap-1 mb-1">
                    <Badge variant="secondary">{getTypeLabel(m.mime_type || getFileType(m.url, m.name))}</Badge>
                    {/* <Badge variant="outline">{formatSize(m.size)}</Badge> */}
                    <Badge variant="outline">{m.created_at}</Badge>
                  </div>
                  <input
                    type="text"
                    defaultValue={m.custom_properties.alt_text || ''}
                    placeholder="Alt Text"
                    onBlur={e =>
                      handleUpdateMedia(m.id, {
                        alt_text: e.target.value,
                        caption: m.custom_properties.caption || '',
                        name: m.name,
                      })
                    }
                    className="border p-1 mt-1 w-full text-xs"
                  />
                  <input
                    type="text"
                    defaultValue={m.custom_properties.caption || ''}
                    placeholder="Caption"
                    onBlur={e =>
                      handleUpdateMedia(m.id, {
                        alt_text: m.custom_properties.alt_text || '',
                        caption: e.target.value,
                        name: m.name,
                      })
                    }
                    className="border p-1 mt-1 w-full text-xs"
                  />
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="text-red-500 mt-2 text-xs"
                  >
                    Hapus
                  </button>
                </div>
              ))}
        </div>
        <MediaPreviewModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          url={modalData?.url || ''}
          type={modalData?.type || ''}
          name={modalData?.name || ''}
          size={modalData?.size}
          uploadedAt={modalData?.uploadedAt}
          index={modalData?.index}
          mediaList={media}
          setModalData={setModalData}
        />
        <div className="mt-6">
          <Pagination
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            onPageChange={setPage}
            totalRecords={pagination.total}
            from={pagination.from}
            to={pagination.to}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default MediaIndex;
