import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function Laporan() {
  const [laporanData, setLaporanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLaporan = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch dari API yang sama dengan pagesAdmin
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
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
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
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-semibold"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold bg-gradient-to-br from-emerald-300 via-emerald-500 to-emerald-700 bg-clip-text text-transparent mb-4">
          Laporan UKM
        </h1>
        <p className="text-xl text-gray-600">Ringkasan kegiatan dan biaya per UKM</p>
      </div>

      {laporanData.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-2xl text-gray-500 mb-4">Belum ada laporan UKM tersedia</p>
          <div className="text-gray-400 text-lg">Admin akan menambahkan laporan setelah kegiatan selesai</div>
        </div>
      ) : (
        laporanData.map((ukm) => (
          <div key={ukm.id} className="mb-16 ">
            {/* UKM Header */}
            <div className="flex items-center justify-between mb-8 p-6 bg-gradient-to-br from-emerald-300 via-emerald-500 to-emerald-700 text-white rounded-2xl shadow-2xl">
              <div>
                <h2 className="text-3xl font-bold">{ukm.nama}</h2>
                <p className="opacity-90">{ukm.laporan?.length || 0} Laporan Tersedia</p>
              </div>
              {ukm.laporan && ukm.laporan.length > 0 && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-300">
                    Total Peserta: {ukm.laporan.reduce((sum, lap) => sum + lap.peserta, 0)}
                  </p>
                  <p className="text-lg opacity-90">
                    Total Biaya: {ukm.laporan.reduce((sum, lap) => sum + parseInt(lap.biaya.replace(/[^\d]/g, '') || 0), 0).toLocaleString('id-ID')} IDR
                  </p>
                </div>
              )}
            </div>

            {/* Laporan Table */}
            {ukm.laporan && ukm.laporan.length > 0 ? (
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-gray-800 text-white">
                        <th className="px-6 py-4 text-left font-semibold rounded-tl-2xl">Kegiatan</th>
                        <th className="px-6 py-4 text-left font-semibold">Peserta</th>
                        <th className="px-6 py-4 text-left font-semibold rounded-tr-2xl">Biaya</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {ukm.laporan.map((lap, index) => (
                        <tr 
                          key={index} 
                          className="hover:bg-emerald-50 hover:shadow-md transition-all duration-200 group"
                        >
                          <td className="px-6 py-4 font-semibold text-gray-900 group-hover:text-indigo-600">
                            {lap.kegiatan}
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold">
                              {lap.peserta}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-lg text-gray-900">
                            <span className="text-emerald-600 font-bold">
                              {lap.biaya}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-2xl">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-2xl font-semibold text-gray-600 mb-2">{ukm.nama}</h3>
                <p className="text-gray-500">Belum ada laporan kegiatan</p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Laporan;
