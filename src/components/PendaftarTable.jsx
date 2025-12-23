import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const PendaftarTable = ({ pendaftar, onRefresh }) => {
  const [filterUkm, setFilterUkm] = useState('');
  const [filterType, setFilterType] = useState('');

  const token = localStorage.getItem('token');

  // ================= UPDATE STATUS =================
  const handleUpdateStatus = async (id, status) => {
    const confirmText =
      status === 'accepted'
        ? 'terima'
        : status === 'rejected'
        ? 'tolak'
        : 'kick';

    if (!window.confirm(`Yakin ingin ${confirmText} pendaftar ini?`)) return;

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
                          onClick={() =>
                            handleUpdateStatus(p.id, 'accepted')
                          }
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
                        >
                          Terima
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateStatus(p.id, 'rejected')
                          }
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
