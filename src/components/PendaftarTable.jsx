import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const PendaftarTable = ({ pendaftar, onRefresh }) => {
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ FILTERED DATA
  const filteredPendaftar = pendaftar.filter(p => {
    const matchesType = filterType === 'all' || p.type === filterType;
    const matchesSearch = !searchQuery || 
      p.user_nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nim.includes(searchQuery) ||
      p.ukm_nama.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // ✅ CREATIVE CONFIRM POPUP
  const ConfirmPopup = ({ isOpen, onClose, onConfirm, title, message, type }) => {
    if (!isOpen) return null;

    const getIcon = () => {
      switch(type) {
        case 'accepted': return { icon: '✅', bg: 'from-emerald-500 to-emerald-600' };
        case 'rejected': return { icon: '❌', bg: 'from-red-500 to-red-600' };
        default: return { icon: '⚠️', bg: 'from-yellow-500 to-yellow-600' };
      }
    };

    const { icon, bg } = getIcon();

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden border border-gray-200 animate-in slide-in-from-bottom-4 duration-300">
          
          {/* HEADER WITH FLOATING ICON */}
          <div className={`p-8 text-center relative overflow-hidden ${bg} text-white`}>
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/30 rounded-full blur-xl animate-pulse"></div>
            </div>
            <div className="relative z-10 w-24 h-24 mx-auto mb-6 bg-white/20 rounded-3xl flex items-center justify-center shadow-2xl backdrop-blur-sm border-4 border-white/50 animate-bounce">
              <span className="text-4xl">{icon}</span>
            </div>
            <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">{title}</h3>
            <p className="text-lg opacity-90 drop-shadow-md">{message}</p>
          </div>

          {/* PROGRESS BAR ANIMATION */}
          <div className="p-8 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6 overflow-hidden">
              <div className={`h-2 rounded-full transition-all duration-1000 ${bg} animate-pulse`}></div>
            </div>
            
            {/* INFO CARDS */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="text-center p-4 bg-white/50 rounded-2xl backdrop-blur-sm border border-white/30">
                <div className="text-2xl font-bold text-gray-800">Instant</div>
                <div className="text-sm text-gray-600">Update</div>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-2xl backdrop-blur-sm border border-white/30">
                <div className="text-2xl font-bold text-gray-800">Secure</div>
                <div className="text-sm text-gray-600">JWT Auth</div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={onConfirm}
                className={`flex-1 bg-gradient-to-r ${bg} text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 text-lg animate-pulse`}
              >
                {type === 'accepted' ? '✨ TERIMA' : '💥 TOLAK'}
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-800 font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ✅ SMART STATUS HANDLER
  const handleUpdateStatus = async (id, status, pendaftarData) => {
    // ✅ BLOCK IF ALREADY PROCESSED
    if (pendaftarData.status === 'accepted' || pendaftarData.status === 'rejected') {
      toast.error('❌ Status sudah diproses sebelumnya!', { id: 'status' });
      return;
    }

    // ✅ OPEN CREATIVE POPUP
    const confirmed = await new Promise((resolve) => {
      setConfirmData({
        isOpen: true,
        onClose: () => setConfirmData({ isOpen: false }),
        onConfirm: () => {
          setConfirmData({ isOpen: false });
          resolve(true);
        },
        title: status === 'accepted' ? '✅ Konfirmasi Penerimaan' : '❌ Konfirmasi Penolakan',
        message: `${pendaftarData.user_nama} (${pendaftarData.nim}) - ${pendaftarData.ukm_nama}`,
        type: status
      });
    });

    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/pendaftar/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`✅ ${pendaftarData.user_nama} ${status === 'accepted' ? 'diterima' : 'ditolak'}!`);
      onRefresh();
    } catch (error) {
      toast.error('Gagal update status');
    }
  };

  // ✅ CONFIRM POPUP STATE
  const [confirmData, setConfirmData] = useState({ isOpen: false });

  // ✅ STATUS BADGE COLORS
  const getStatusBadge = (status) => {
    const colors = {
      accepted: 'bg-green-100 text-green-800 border-2 border-green-400',
      rejected: 'bg-red-100 text-red-800 border-2 border-red-400',
      pending: 'bg-yellow-100 text-yellow-800 border-2 border-yellow-400'
    };
    return colors[status] || colors.pending;
  };

  return (
    <div>
      {/* ✅ FILTER & SEARCH BAR */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl border-2 border-blue-100">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <h3 className="text-3xl font-bold text-gray-800">📋 Daftar Pendaftar ({filteredPendaftar.length})</h3>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* FILTER BUTTONS */}
            <div className="flex gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-2xl border border-blue-200">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  filterType === 'all' 
                    ? 'bg-blue-600 text-white shadow-lg scale-105' 
                    : 'hover:bg-blue-100 text-gray-700'
                }`}
              >
                Semua ({pendaftar.length})
              </button>
              <button
                onClick={() => setFilterType('anggota')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  filterType === 'anggota' 
                    ? 'bg-emerald-600 text-white shadow-lg scale-105' 
                    : 'hover:bg-emerald-100 text-gray-700'
                }`}
              >
                Anggota
              </button>
              <button
                onClick={() => setFilterType('kegiatan')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  filterType === 'kegiatan' 
                    ? 'bg-purple-600 text-white shadow-lg scale-105' 
                    : 'hover:bg-purple-100 text-gray-700'
                }`}
              >
                Kegiatan
              </button>
            </div>

            {/* SEARCH */}
            <input
              type="text"
              placeholder="🔍 Cari nama, NIM, atau UKM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-5 py-3 rounded-2xl border-2 border-gray-200 focus:ring-4 focus:ring-blue-400 focus:border-transparent text-lg bg-white/50 backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      {/* ✅ CREATIVE CONFIRM POPUP */}
      <ConfirmPopup {...confirmData} />

      {filteredPendaftar.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl">
            <span className="text-3xl">📭</span>
          </div>
          <p className="text-2xl mb-4 font-semibold">Belum ada pendaftar</p>
          <p className="text-lg">Tunggu mahasiswa mendaftar UKM!</p>
          {filterType !== 'all' && (
            <p className="text-sm mt-2 text-gray-400 italic">
              Filter: {filterType.toUpperCase()}
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 ">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-emerald-50 via-blue-50 to-indigo-50">
                  <th className="p-6 text-left font-bold text-lg text-gray-800 border-b-2 border-gray-200">Nama</th>
                  <th className="p-6 text-left font-bold text-lg text-gray-800 border-b-2 border-gray-200">NIM</th>
                  <th className="p-6 text-left font-bold text-lg text-gray-800 border-b-2 border-gray-200">Fakultas</th>
                  <th className="p-6 text-left font-bold text-lg text-gray-800 border-b-2 border-gray-200">UKM</th>
                  <th className="p-6 text-left font-bold text-lg text-gray-800 border-b-2 border-gray-200">Tipe</th>
                  <th className="p-6 text-left font-bold text-lg text-gray-800 border-b-2 border-gray-200">Status</th>
                  <th className="p-6 text-left font-bold text-lg text-gray-800 border-b-2 border-gray-200">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredPendaftar.map(p => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-emerald-50/50 transition-all duration-200 group">
                    <td className="p-6 font-semibold text-gray-900 group-hover:text-emerald-800">{p.user_nama}</td>
                    <td className="p-6 font-mono text-gray-700">{p.nim}</td>
                    <td className="p-6 text-gray-600">{p.fakultas}</td>
                    <td className="p-6 font-medium text-indigo-700">{p.ukm_nama}</td>
                    <td className="p-6">
                      <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-md ${
                        p.type === 'anggota' 
                          ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300' 
                          : 'bg-purple-100 text-purple-800 border-2 border-purple-300'
                      }`}>
                        {p.type?.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-6">
                      <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-md ${getStatusBadge(p.status || 'pending')}}`}>
                        {p.status === 'accepted' ? '✅ DITERIMA' :
                         p.status === 'rejected' ? '❌ DITOLAK' : '⏳ PENDING'}
                      </span>
                    </td>
                    <td className="p-6">
                      {/* ✅ SMART BUTTONS - DISABLED IF PROCESSED */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleUpdateStatus(p.id, 'accepted', p)}
                          disabled={p.status === 'accepted' || p.status === 'rejected'}
                          className="px-4 py-2 rounded-xl font-semibold shadow-md transition-all duration-200 flex-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none
                            bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg hover:-translate-y-0.5
                            disabled:from-gray-400 disabled:to-gray-500"
                          title={p.status === 'accepted' ? "Sudah diterima" : "Terima pendaftaran"}
                        >
                          {p.status === 'accepted' ? '✓ Diterima' : '✅ Terima'}
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(p.id, 'rejected', p)}
                          disabled={p.status === 'accepted' || p.status === 'rejected'}
                          className="px-4 py-2 rounded-xl font-semibold shadow-md transition-all duration-200 flex-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none
                            bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:-translate-y-0.5
                            disabled:from-gray-400 disabled:to-gray-500"
                          title={p.status === 'rejected' ? "Sudah ditolak" : "Tolak pendaftaran"}
                        >
                          {p.status === 'rejected' ? '✗ Ditolak' : '❌ Tolak'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendaftarTable;
