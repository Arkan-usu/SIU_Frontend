import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

/* ================= CUSTOM CONFIRM MODAL ================= */
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, statusType }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold mb-2 text-gray-800">{title}</h3>
        <p className="text-gray-600 mb-8">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 text-white font-semibold rounded-xl shadow-lg transition-all ${
              statusType === 'accepted' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            Ya, Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
};

const PendaftarTable = ({ pendaftar, onRefresh }) => {
  const [filterUkm, setFilterUkm] = useState('');
  const [filterType, setFilterType] = useState('');

  // ✅ State Baru untuk Popup
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    id: null,
    status: '',
    confirmText: ''
  });

  const token = localStorage.getItem('token');

  // ================= UPDATE STATUS (DIPISAH MENJADI TRIGGER & EXECUTE) =================
  
  // 1. Munculkan Popup
  const triggerUpdateStatus = (id, status) => {
    const text = status === 'accepted' ? 'terima' : status === 'rejected' ? 'tolak' : 'kick';
    setModalConfig({
      isOpen: true,
      id,
      status,
      confirmText: text
    });
  };

  // 2. Jalankan Aksi Setelah Konfirmasi "Ya"
  const handleExecuteStatus = async () => {
    const { id, status, confirmText } = modalConfig;
    setModalConfig({ ...modalConfig, isOpen: false });

    try {
      await axios.patch(
        `/pendaftar/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`✅ Berhasil ${confirmText}`);
      onRefresh();
    } catch (error) {
      toast.error('Gagal update status');
    }
  };

  // ================= FILTER DATA =================
  const filteredPendaftar = pendaftar.filter((p) => {
    return (
      (!filterUkm || p.ukm_nama === filterUkm) &&
      (!filterType || p.type === filterType)
    );
  });

  const ukmList = [...new Set(pendaftar.map((p) => p.ukm_nama))];

  return (
    <div className="w-full">
      {/* ✅ RENDER POPUP DI SINI */}
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={handleExecuteStatus}
        title={`Konfirmasi ${modalConfig.confirmText?.toUpperCase()}`}
        message={`Apakah Anda yakin ingin ${modalConfig.confirmText} pendaftar ini?`}
        statusType={modalConfig.status}
      />

      <h3 className="text-3xl font-bold mb-8 text-gray-800">
        📋 Daftar Pendaftar ({filteredPendaftar.length})
      </h3>

      {/* ================= FILTER ================= */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filterUkm}
          onChange={(e) => setFilterUkm(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">Semua UKM</option>
          {ukmList.map((u, i) => (
            <option key={i} value={u}>
              {u}
            </option>
          ))}
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">Semua Tipe</option>
          <option value="anggota">Anggota</option>
          <option value="kegiatan">Kegiatan</option>
        </select>

        {(filterUkm || filterType) && (
          <button
            onClick={() => {
              setFilterUkm('');
              setFilterType('');
            }}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* ================= TABLE ================= */}
      {filteredPendaftar.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-2xl mb-4">📭 Data kosong</p>
          <p>Tidak ada pendaftar sesuai filter</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-4 text-left">Nama</th>
                <th className="p-4 text-left">NIM</th>
                <th className="p-4 text-left">Fakultas</th>
                <th className="p-4 text-left">UKM</th>
                <th className="p-4 text-left">Tipe</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filteredPendaftar.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="p-4 font-semibold">{p.user_nama}</td>
                  <td className="p-4">{p.nim}</td>
                  <td className="p-4">{p.fakultas}</td>
                  <td className="p-4 font-medium">{p.ukm_nama}</td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        p.type === 'anggota'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {p.type}
                    </span>
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        p.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : p.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {p.status || 'pending'}
                    </span>
                  </td>

                  {/* ================= AKSI ================= */}
                  <td className="p-4 space-x-2">
                    {p.status === 'pending' && (
                      <>
                        <button
                          onClick={() => triggerUpdateStatus(p.id, 'accepted')}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
                        >
                          Terima
                        </button>
                        <button
                          onClick={() => triggerUpdateStatus(p.id, 'rejected')}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
                        >
                          Tolak
                        </button>
                      </>
                    )}

                    {p.status === 'accepted' && (
                      <span className="italic text-green-700 font-semibold">
                        ✔ Diterima
                      </span>
                    )}

                    {p.status === 'rejected' && (
                      <span className="italic text-red-600 font-semibold">
                        ✖ Ditolak
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PendaftarTable;