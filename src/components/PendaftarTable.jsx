import React from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const PendaftarTable = ({ pendaftar, onRefresh }) => {
  const handleUpdateStatus = async (id, status) => {
    if (!window.confirm(`Yakin ${status === 'accepted' ? 'terima' : 'tolak'} pendaftar?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/pendaftar/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`✅ Status diubah ke ${status}`);
      onRefresh();
    } catch (error) {
      toast.error('Gagal update status');
    }
  };

  return (
    <div>
      <h3 className="text-3xl font-bold mb-8 text-gray-800">📋 Daftar Pendaftar ({pendaftar.length})</h3>
      
      {pendaftar.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-2xl mb-4">🎉 Belum ada pendaftar</p>
          <p>Tunggu mahasiswa mendaftar UKM!</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-xl">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                <th className="p-6 text-left font-bold text-lg text-gray-700">Nama</th>
                <th className="p-6 text-left font-bold text-lg text-gray-700">NIM</th>
                <th className="p-6 text-left font-bold text-lg text-gray-700">Fakultas</th>
                <th className="p-6 text-left font-bold text-lg text-gray-700">UKM</th>
                <th className="p-6 text-left font-bold text-lg text-gray-700">Tipe</th>
                <th className="p-6 text-left font-bold text-lg text-gray-700">Status</th>
                <th className="p-6 text-left font-bold text-lg text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pendaftar.map(p => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-6 font-semibold">{p.user_nama}</td>
                  <td className="p-6">{p.nim}</td>
                  <td className="p-6">{p.fakultas}</td>
                  <td className="p-6 font-medium">{p.ukm_nama}</td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      p.type === 'anggota' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {p.type}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                      p.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      p.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {p.status || 'pending'}
                    </span>
                  </td>
                  <td className="p-6 space-x-2">
                    <button onClick={() => handleUpdateStatus(p.id, 'accepted')}
                      className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 font-semibold">
                      ✅ Terima
                    </button>
                    <button onClick={() => handleUpdateStatus(p.id, 'rejected')}
                      className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 font-semibold">
                      ❌ Tolak
                    </button>
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
