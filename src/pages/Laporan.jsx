import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// ✅ RUPIAH FORMATTER UTILITY
const formatRupiah = (amount) => {
  if (!amount) return 'Rp 0';
  
  // Hapus semua non-digit
  const cleanAmount = parseInt(amount.toString().replace(/[^\d]/g, '')) || 0;
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cleanAmount);
};

// ✅ TOTAL CALCULATOR
const calculateTotals = (laporan) => {
  if (!laporan || laporan.length === 0) return { totalPeserta: 0, totalBiaya: 0 };
  
  const totalPeserta = laporan.reduce((sum, lap) => sum + parseInt(lap.peserta || 0), 0);
  const totalBiaya = laporan.reduce((sum, lap) => {
    return sum + parseInt(lap.biaya?.toString().replace(/[^\d]/g, '') || 0);
  }, 0);
  
  return { totalPeserta, totalBiaya };
};

function Laporan() {
  const [laporanData, setLaporanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLaporan = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // ✅ Vercel Backend URL
        const response = await axios.get('https://siu-backend-theta.vercel.app/ukm');
        setLaporanData(response.data);
      } catch (err) {
        console.error('Error fetching laporan:', err);
        setError('Gagal memuat data laporan');
        toast.error('Gagal memuat laporan UKM');
      } finally {
        setLoading(false);
      }
    };

    fetchLaporan();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-xl">Memuat laporan UKM...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-600 text-xl mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-700 font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          🔄 Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* HEADER */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent mb-4 drop-shadow-lg">
          📊 Laporan UKM
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Ringkasan lengkap kegiatan, peserta, dan biaya operasional per UKM
        </p>
      </div>

      {/* STATS OVERVIEW */}
      {laporanData.some(ukm => ukm.laporan?.length > 0) && (
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {laporanData.map((ukm) => {
            const { totalPeserta, totalBiaya } = calculateTotals(ukm.laporan);
            return ukm.laporan?.length > 0 && (
              <div key={ukm.id} className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-3xl shadow-xl border border-emerald-200 hover:shadow-2xl transition-all">
                <h3 className="text-xl font-bold text-emerald-800 mb-4 truncate">{ukm.nama}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-emerald-700 font-semibold">Total Laporan</span>
                    <span className="font-bold text-2xl text-emerald-600">{ukm.laporan.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total Peserta</span>
                    <span className="font-bold text-xl text-emerald-600">{totalPeserta.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-emerald-200">
                    <span className="text-gray-700 font-semibold">Total Biaya</span>
                    <span className="font-bold text-2xl bg-emerald-100 px-4 py-2 rounded-xl text-emerald-700">
                      {formatRupiah(totalBiaya)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* UKM LAPORAN LIST */}
      {laporanData.length === 0 ? (
        <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12">
          <div className="text-6xl mb-6 opacity-20">📊</div>
          <h2 className="text-3xl font-bold text-gray-500 mb-4">Belum ada laporan UKM</h2>
          <p className="text-xl text-gray-400 max-w-md mx-auto">
            Admin akan menambahkan laporan setelah kegiatan UKM selesai dilaksanakan
          </p>
        </div>
      ) : (
        laporanData.map((ukm) => {
          const { totalPeserta, totalBiaya } = calculateTotals(ukm.laporan);
          
          return (
            <div key={ukm.id} className="mb-16">
              {/* UKM Header */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 p-8 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-3xl shadow-2xl">
                <div className="mb-6 lg:mb-0">
                  <h2 className="text-4xl font-bold mb-2 leading-tight">{ukm.nama}</h2>
                  <p className="opacity-90 text-lg">{ukm.laporan?.length || 0} Laporan Kegiatan</p>
                </div>
                
                {ukm.laporan?.length > 0 && (
                  <div className="text-right bg-white/20 backdrop-blur-sm p-6 rounded-2xl border border-white/30">
                    <div className="text-3xl font-bold mb-1">{totalPeserta.toLocaleString('id-ID')}</div>
                    <div className="text-lg opacity-90 mb-2">Total Peserta</div>
                    <div className="text-xl font-bold text-emerald-200">
                      {formatRupiah(totalBiaya)}
                    </div>
                    <div className="text-sm opacity-75">Total Biaya</div>
                  </div>
                )}
              </div>

              {/* Laporan Table */}
              {ukm.laporan && ukm.laporan.length > 0 ? (
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-emerald-100 hover:shadow-3xl transition-all">
                  <div className="overflow-x-auto rounded-2xl">
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                          <th className="px-8 py-5 text-left font-bold text-lg rounded-l-2xl">Kegiatan</th>
                          <th className="px-8 py-5 text-left font-bold text-lg">Peserta</th>
                          <th className="px-8 py-5 text-left font-bold text-lg rounded-r-2xl">Biaya</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-100">
                        {ukm.laporan.map((lap, index) => (
                          <tr 
                            key={index} 
                            className="hover:bg-emerald-50 hover:shadow-md transition-all duration-200 group border-b border-emerald-50 last:border-b-0"
                          >
                            <td className="px-8 py-6 font-semibold text-xl text-gray-900 group-hover:text-emerald-700 max-w-md">
                              {lap.kegiatan}
                            </td>
                            <td className="px-8 py-6">
                              <span className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-800 text-lg font-bold rounded-2xl shadow-md">
                                {parseInt(lap.peserta || 0).toLocaleString('id-ID')}
                              </span>
                            </td>
                            <td className="px-8 py-6 font-mono">
                              <span className="text-2xl font-bold text-emerald-600 bg-emerald-50 px-6 py-3 rounded-2xl shadow-lg group-hover:shadow-xl transition-all">
                                {formatRupiah(lap.biaya)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* TOTAL ROW */}
                  <div className="mt-8 pt-8 border-t-4 border-emerald-200 bg-emerald-50 rounded-2xl p-6">
                    <div className="flex flex-col lg:flex-row items-end lg:items-center justify-between gap-4">
                      <div className="font-bold text-2xl text-gray-800">
                        TOTAL {ukm.nama.toUpperCase()}
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-3xl font-bold text-emerald-700">
                          {totalPeserta.toLocaleString('id-ID')} Peserta
                        </div>
                        <div className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-4 rounded-3xl shadow-2xl">
                          {formatRupiah(totalBiaya)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 bg-gradient-to-r from-gray-50 to-emerald-50 rounded-3xl border-4 border-dashed border-emerald-200">
                  <div className="text-7xl mb-6 opacity-30">📊</div>
                  <h3 className="text-3xl font-bold text-gray-600 mb-4">{ukm.nama}</h3>
                  <p className="text-xl text-gray-500 mb-8">Belum ada laporan kegiatan</p>
                  <p className="text-lg text-emerald-600 font-semibold">
                    Admin akan menambahkan laporan setelah kegiatan selesai
                  </p>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default Laporan;
