import React, { useState } from "react";
import axios from "axios";
import { Head, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { PageProps, BreadcrumbItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Plugin {
  id: number;
  name: string;
  description?: string;
  version?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Props extends PageProps {
  plugins: Plugin[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Plugins", href: "/plugin-manager" },
];

const PluginsIndex: React.FC<Props> = ({ plugins }) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Plugin | null>(null);
  const [modalType, setModalType] = useState<null | "detail" | "delete" | "upload" | "update" | null>(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const filteredPlugins = plugins.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Manajemen Plugin" />
      <div className="mt-8 mx-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manajemen Plugin</h1>
          <div className="flex gap-2">
            <input
              type="text"
              className="border rounded px-2 py-1 text-sm"
              placeholder="Cari plugin..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Button variant="primary" size="sm" onClick={() => { setModalType("upload"); setSelected(null); }}>Install Plugin</Button>
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Nama</th>
                <th className="px-4 py-2 text-left font-semibold">Deskripsi</th>
                <th className="px-4 py-2 text-left font-semibold">Versi</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
                <th className="px-4 py-2 text-left font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlugins.length > 0 ? (
                filteredPlugins.map((plugin) => (
                  <tr key={plugin.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                    <td className="px-4 py-2 border-b">
                      <span className="font-semibold cursor-pointer hover:underline" onClick={() => { setSelected(plugin); setModalType("detail"); }}>{plugin.name}</span>
                    </td>
                    <td className="px-4 py-2 border-b">{plugin.description || '-'}</td>
                    <td className="px-4 py-2 border-b">{plugin.version || '-'}</td>
                    <td className="px-4 py-2 border-b">
                      {plugin.active ? (
                        <Badge variant="success">Aktif</Badge>
                      ) : (
                        <Badge variant="destructive">Nonaktif</Badge>
                      )}
                    </td>
                    <td className="px-4 py-2 border-b flex gap-2">
                      <Button variant={plugin.active ? "warning" : "success"} size="sm" onClick={() => plugin.active ? handleDeactivate(plugin.id) : handleActivate(plugin.id)}>
                        {plugin.active ? "Nonaktifkan" : "Aktifkan"}
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => { setSelected(plugin); setModalType("detail"); }}>Detail</Button>
                      <Button variant="outline" size="sm" onClick={() => { setSelected(plugin); setModalType("update"); }}>Update</Button>
                      <Button variant="destructive" size="sm" onClick={() => { setSelected(plugin); setModalType("delete"); }}>Hapus</Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4">Belum ada plugin terdaftar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Plugin */}
      {modalType === "detail" && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 min-w-[350px] shadow-xl">
            <h2 className="text-xl font-semibold mb-2">Detail Plugin</h2>
            <div className="mb-2"><b>Nama:</b> {selected.name}</div>
            <div className="mb-2"><b>Deskripsi:</b> {selected.description || '-'}</div>
            <div className="mb-2"><b>Versi:</b> {selected.version || '-'}</div>
            <div className="mb-2"><b>Status:</b> {selected.active ? <Badge variant="success">Aktif</Badge> : <Badge variant="destructive">Nonaktif</Badge>}</div>
            <div className="mb-2"><b>Dibuat:</b> {selected.created_at ? new Date(selected.created_at).toLocaleString() : '-'}</div>
            <div className="mb-2"><b>Diupdate:</b> {selected.updated_at ? new Date(selected.updated_at).toLocaleString() : '-'}</div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => setModalType(null)}>Tutup</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hapus Plugin */}
      {modalType === "delete" && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 min-w-[350px] shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Hapus Plugin</h2>
            <p>Yakin ingin menghapus plugin <b>{selected.name}</b>?</p>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => setModalType(null)}>Batal</Button>
              <Button variant="destructive" loading={loading} onClick={() => handleDelete(selected.id)}>Hapus</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Install/Update Plugin */}
      {(modalType === "upload" || modalType === "update") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 min-w-[350px] shadow-xl">
            <h2 className="text-xl font-semibold mb-4">{modalType === "upload" ? "Install Plugin" : `Update Plugin${selected ? `: ${selected.name}` : ''}`}</h2>
            <input type="file" accept=".zip" onChange={e => setFile(e.target.files?.[0] || null)} className="mb-4" />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => { setModalType(null); setFile(null); }}>Batal</Button>
              <Button variant="primary" loading={loading} onClick={modalType === "upload" ? handleUpload : () => handleUpdate(selected?.id || 0)}>
                {modalType === "upload" ? "Install" : "Update"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );

  function handleActivate(id: number) {
    setLoading(true);
    axios.post(`/plugin-manager/${id}/activate`)
      .then(() => window.location.reload())
      .catch(() => alert("Gagal mengaktifkan plugin."))
      .finally(() => setLoading(false));
  }

  function handleDeactivate(id: number) {
    setLoading(true);
    axios.post(`/plugin-manager/${id}/deactivate`)
      .then(() => window.location.reload())
      .catch(() => alert("Gagal menonaktifkan plugin."))
      .finally(() => setLoading(false));
  }

  function handleDelete(id: number) {
    setLoading(true);
    axios.delete(`/plugin-manager/${id}`)
      .then(() => window.location.reload())
      .catch(() => alert("Gagal menghapus plugin."))
      .finally(() => { setLoading(false); setModalType(null); });
  }

  function handleUpload() {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("plugin", file);
    axios.post(`/plugin-manager/install`, formData)
      .then(() => window.location.reload())
      .catch(() => alert("Gagal install plugin."))
      .finally(() => { setLoading(false); setModalType(null); setFile(null); });
  }

  function handleUpdate(id: number) {
    if (!file || !id) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("plugin", file);
    axios.post(`/plugin-manager/${id}/update`, formData)
      .then(() => window.location.reload())
      .catch(() => alert("Gagal update plugin."))
      .finally(() => { setLoading(false); setModalType(null); setFile(null); });
  }
};

export default PluginsIndex;