import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Profile() {
  const navigate = useNavigate();
  
  // ✅ TAMBAH STATE untuk kegiatan + WA links
  const [user, setUser] = useState(null);
  const [anggotaStatus, setAnggotaStatus] = useState(false);
  const [kegiatanStatus, setKegiatanStatus] = useState(false);
  const [kegiatanData, setKegiatanData] = useState([]);  // ✅ BARU
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Silakan login terlebih dahulu');
          navigate('/login');
          return;
        }

        // ✅ SINGLE CALL - /auth/profile (sudah include semuanya)
        const response = await axios.get('/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const profileData = response.data;
        setUser(profileData);
        
        // ✅ EXTRACT dari backend response
        setAnggotaStatus(profileData.anggotaTerdaftar);
        setKegiatanStatus(profileData.kegiatanTerdaftar?.length > 0 || false);
        setKegiatanData(profileData.kegiatanTerdaftar || []);  // ✅ WA KEGIATAN LIST

      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.clear();
          toast.error('Session expired, login ulang');
          navigate('/login');
        } else {
          console.error('Profile error:', err);
          setError('Gagal memuat profil');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  if (loading) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );
}

if (error) {
  return (
    <div className="min-h-screen bg-gray-100 py-16 px-6 flex justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-lg text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-16 px-6 flex justify-center">
      <div className="bg-white shadow-2xl rounded-3xl p-12 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* FOTO PROFIL - SAMA */}
        <div className="flex justify-center mb-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl border-4 border-white">
            <span className="text-3xl font-bold text-white">
              {user?.nama?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
        </div>

        {/* NAMA USER & EMAIL - SAMA */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            {user?.nama || 'Nama Pengguna'}
          </h2>
          <p className="text-xl text-gray-600 bg-gray-100 px-4 py-2 rounded-full inline-block">
            {user?.nim || ''} • {user?.email || ''}
          </p>
        </div>

        <hr className="my-10 border-gray-200" />

        {/* STATUS CARDS - SAMA */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* STATUS ANGGOTA - SAMA */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-8 rounded-2xl border-2 border-emerald-100 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-gray-800">Status Anggota</span>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-lg transition-all duration-200 ${
                anggotaStatus 
                  ? 'bg-emerald-600 group-hover:scale-110 group-hover:rotate-12' 
                  : 'bg-red-500 group-hover:scale-110'
              }`}>
                {anggotaStatus ? '✅' : '❌'}
              </div>
            </div>
            <p className={`text-3xl font-bold transition-all duration-300 ${
              anggotaStatus ? 'text-emerald-600' : 'text-red-500'
            }`}>
              {anggotaStatus ? 'Sudah Terdaftar' : 'Belum Terdaftar'}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {anggotaStatus ? 'Anda sudah menjadi anggota UKM' : 'Daftarkan diri Anda sekarang'}
            </p>
          </div>

          {/* STATUS KEGIATAN - SAMA */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-8 rounded-2xl border-2 border-indigo-100 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-gray-800">Status Kegiatan</span>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-lg transition-all duration-200 ${
                kegiatanStatus 
                  ? 'bg-indigo-600 group-hover:scale-110 group-hover:rotate-12' 
                  : 'bg-orange-500 group-hover:scale-110'
              }`}>
                {kegiatanStatus ? '🎯' : '⏳'}
              </div>
            </div>
            <p className={`text-3xl font-bold transition-all duration-300 ${
              kegiatanStatus ? 'text-indigo-600' : 'text-orange-500'
            }`}>
              {kegiatanStatus ? 'Sudah Terdaftar' : 'Belum Terdaftar'}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {kegiatanStatus ? `${kegiatanData.length} kegiatan aktif` : 'Ikuti kegiatan terdekat'}
            </p>
          </div>
        </div>

        {/* ✅ BARU: WA KEGIATAN SECTION */}
        {kegiatanData.length > 0 && (
          <div className="mt-10 p-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl border-2 border-green-200">
            <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center flex items-center justify-center">
              📱 <span className="ml-3">Kegiatan & WA Group</span>
            </h3>
            <div className="space-y-4">
              {kegiatanData.map((keg) => (
                <div key={keg.id} className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-green-500 hover:shadow-2xl transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-xl text-gray-800">{keg.nama}</h4>
                      <p className="text-gray-600">{keg.ukm_nama} • {keg.tanggal}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      Diterima
                    </span>
                  </div>
                  
                  {keg.link_wa && (
                    <a 
                      href={keg.link_wa} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-4 px-6 rounded-2xl text-center shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center"
                    >
                      🚀 Gabung WA Group Kegiatan
                      <svg className="ml-3 w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                      </svg>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTION BUTTONS - SAMA */}
        <div className="grid md:grid-cols-3 gap-4 pt-8 border-t border-gray-200">
          <button 
            onClick={() => navigate('/anggota')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Kelola Anggota
          </button>
          <button 
            onClick={() => navigate('/kegiatan')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Ikuti Kegiatan
          </button>
          <button 
            onClick={() => navigate('/')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Kembali Home
          </button>
        </div>

        {/* LOGOUT BUTTON - SAMA */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button 
            onClick={() => {
              localStorage.clear();
              toast.success('Logout berhasil');
              navigate('/login');
            }}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
