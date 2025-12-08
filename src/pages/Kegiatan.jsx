import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../App';
import toast, { Toaster } from 'react-hot-toast';

// ✅ SAME LOGIN MODAL dari Anggota.jsx
const LoginModal = ({ isOpen, onClose, onLogin }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform animate-in slide-in-from-top-4 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 rounded-t-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">🔐 Login Diperlukan</h3>
            <button 
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-all hover:rotate-90"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-3xl">🎯</span>
          </div>
          <h4 className="text-xl font-semibold text-gray-800 mb-2">Login untuk Daftar Kegiatan</h4>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Anda perlu login untuk mendaftar kegiatan UKM. 
            Sistem akan menyimpan data pendaftaran secara otomatis.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onLogin}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              🚀 Login Sekarang
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function Kegiatan({ setKegiatanTerdaftar }) {
  const [ukmList, setUkmList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRegistrations, setUserRegistrations] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const { token } = useContext(UserContext);

  // ✅ FETCH UKM + USER REGISTRATIONS
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. GET UKM (public)
        const ukmResponse = await axios.get('/ukm');
        setUkmList(ukmResponse.data);
        
        // 2. GET user registrations (private)
        if (token) {
          try {
            const regResponse = await axios.get('/pendaftar', {
              headers: { Authorization: `Bearer ${token}` }
            });
            setUserRegistrations(regResponse.data);
          } catch (regErr) {
            console.log('No registrations yet');
            setUserRegistrations([]);
          }
        }
      } catch (err) {
        setError('Gagal memuat kegiatan');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // ✅ DAFTAR KEGIATAN - POST /pendaftar
  const handleDaftar = async (ukmId, kegiatanId) => {
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    try {
      toast.loading('Mendaftar kegiatan...', { id: 'kegiatan' });
      
      // ✅ REAL BACKEND API - POST /pendaftar
      const response = await axios.post('/pendaftar', {
        ukm_id: ukmId,
        kegiatan_id: kegiatanId,
        type: 'kegiatan'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setUserRegistrations(prev => [...prev, response.data.registration]);
      
      toast.success('✅ Berhasil daftar kegiatan! Menunggu konfirmasi admin', { id: 'kegiatan' });
      setKegiatanTerdaftar?.(true);
      
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal mendaftar kegiatan!', { id: 'kegiatan' });
    }
  };

  // ✅ CEK USER REGISTRATION STATUS
  const isUserRegisteredForKegiatan = (ukmId, kegiatanId) => {
    return userRegistrations.some(reg => 
      reg.ukm_id === ukmId && 
      reg.kegiatan_id === kegiatanId && 
      reg.type === 'kegiatan'
    );
  };

  // Calculate time status
  const getTimeStatus = (tanggal) => {
    if (!tanggal) return { text: 'Tanggal TBD', color: 'text-gray-400' };
    
    const eventDate = new Date(tanggal);
    const now = new Date();
    const diffMs = eventDate - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: '📅 Selesai', color: 'text-gray-400' };
    } else if (diffDays <= 3) {
      return { 
        text: `⚡ ${diffDays === 0 ? 'HARI INI' : diffDays + ' HARI LAGI'}`, 
        color: 'text-orange-500 font-bold' 
      };
    } else {
      return { text: `${diffDays} HARI LAGI`, color: 'text-green-600' };
    }
  };

  // Loading & Error
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Memuat kegiatan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <>
      {/* ✅ LOGIN MODAL */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => {
          setShowLoginModal(false);
          window.location.href = '/login';
        }}
      />
      
      <Toaster />
      
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">Daftar Kegiatan UKM</h1>

        {ukmList.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Belum ada kegiatan tersedia.</p>
          </div>
        ) : (
          ukmList.map((ukm) => (
            <div key={ukm.id} className="mb-12">
              <h2 className="text-3xl font-bold text-indigo-600 mb-6 text-center">{ukm.nama}</h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {ukm.kegiatan?.map((keg) => {
                  const sudahTerdaftar = isUserRegisteredForKegiatan(ukm.id, keg.id);
                  const timeStatus = getTimeStatus(keg.tanggal);
                  
                  return (
                    <div key={keg.id} className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-indigo-200">
                      {/* TIME BADGE */}
                      <div className={`text-xs px-3 py-1 rounded-full mb-4 inline-block ${timeStatus.color}`}>
                        {timeStatus.text}
                      </div>
                      
                      {/* KEGIATAN INFO */}
                      <h3 className="text-2xl font-bold text-gray-800 mb-3 line-clamp-2">{keg.nama}</h3>
                      <p className="text-indigo-600 font-semibold mb-2">{keg.tanggal}</p>
                      <p className="text-gray-600 line-clamp-3 mb-6 leading-relaxed">{keg.deskripsi}</p>

                      {/* STATUS & BUTTON */}
                      <div className="space-y-3">
                        <div className={`px-4 py-2 rounded-xl text-sm font-semibold w-fit ${
                          sudahTerdaftar
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {sudahTerdaftar ? '⏳ Menunggu Konfirmasi' : '📝 Belum Terdaftar'}
                        </div>

                        <button
                          onClick={() => handleDaftar(ukm.id, keg.id)}
                          disabled={sudahTerdaftar}
                          className={`w-full py-4 px-6 rounded-2xl font-bold shadow-lg transition-all text-sm transform hover:scale-[1.02]
                            ${sudahTerdaftar
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : !token
                                ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-400/50 cursor-pointer'
                                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-400/50'
                            }`}
                          title={!token ? "Login diperlukan untuk mendaftar" : ""}
                        >
                          {sudahTerdaftar ? '⏳ Menunggu Admin' : 
                           !token ? '🔐 Login Dulu' : '🎯 DAFTAR KEGIATAN'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default Kegiatan;
