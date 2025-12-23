import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../App';
import toast from 'react-hot-toast';

// ✅ MODAL COMPONENT (SAMA)
const LoginModal = ({ isOpen, onClose, navigate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform animate-in slide-in-from-top-4 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 rounded-t-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">🔐 Login Diperlukan</h3>
            <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2 transition-all hover:rotate-90">✕</button>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-400 to-red-500 rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-3xl">🚫</span>
          </div>
          <h4 className="text-xl font-semibold text-gray-800 mb-2">Harap Login Terlebih Dahulu</h4>
          <p className="text-gray-600 mb-8 leading-relaxed">Anda perlu login untuk mendaftar sebagai anggota UKM.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => navigate('/login')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5">
              🚀 Login Sekarang
            </button>
            <button onClick={onClose} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function Anggota({ setAnggotaTerdaftar }) {
  const [ukmList, setUkmList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRegistrations, setUserRegistrations] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const { token, user } = useContext(UserContext);
  const navigate = useNavigate();

  // ✅ FETCH DATA (SAMA)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const ukmResponse = await axios.get('/ukm');
        setUkmList(ukmResponse.data);
        
        if (token && user?.id) {
          try {
            const regResponse = await axios.get(`/pendaftar/user/${user.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setUserRegistrations(regResponse.data || []);
          } catch (regErr) {
            console.log('No registrations yet');
            setUserRegistrations([]);
          }
        } else {
          setUserRegistrations([]);
        }
      } catch (err) {
        setError('Gagal memuat data UKM');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user?.id]);

  // ✅ STATUS CHECK (SAMA)
  const getRegistrationStatus = (ukmId) => {
    const registration = userRegistrations.find(reg => 
      reg.ukm_id === ukmId && reg.type === 'anggota'
    );
    
    if (!registration) return 'not_registered';
    
    switch (registration.status) {
      case 'accepted': return 'accepted';
      case 'rejected': return 'rejected';
      default: return 'pending';
    }
  };

  // ✅ SINGLE LOGIN BUTTON - BELUM LOGIN
  const handleGlobalLogin = () => {
    setShowLoginModal(true);
  };

  // ✅ DAFTAR ACTION - HOVER ENABLED
  const handleDaftar = async (ukmId) => {
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    const status = getRegistrationStatus(ukmId);
    if (status !== 'not_registered') {
      toast.error(
        `Status Anda: ${status === 'pending' ? '⏳ Menunggu konfirmasi' : 
                       status === 'accepted' ? '✅ Diterima' : '❌ Ditolak'}`, 
        { id: 'daftar' }
      );
      return;
    }

    try {
      toast.loading('Mendaftar...', { id: 'daftar' });
      
      const response = await axios.post('/pendaftar', {
        ukm_id: ukmId,
        type: 'anggota'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUserRegistrations(prev => [...prev, { 
        ...response.data.registration, 
        status: 'pending' 
      }]);
      toast.success('✅ Berhasil daftar! Menunggu konfirmasi admin', { id: 'daftar' });
      setAnggotaTerdaftar?.(true);
      
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal mendaftar!', { id: 'daftar' });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Memuat daftar UKM...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <>
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        navigate={navigate}
      />

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Daftar Anggota UKM
          </h1>
          
          {/* ✅ SINGLE GLOBAL LOGIN BUTTON - BELUM LOGIN */}
          {!token && (
            <div className="inline-flex items-center gap-3 p-4 bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-2 border-orange-400/50 rounded-3xl backdrop-blur-sm shadow-2xl">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-xl font-bold">🔐</span>
              </div>
              <div>
                <h3 className="font-bold text-xl text-orange-800 mb-1">Login untuk Daftar</h3>
                <p className="text-orange-700 text-sm">Klik tombol untuk mendaftar ke UKM favorit Anda</p>
              </div>
              <button
                onClick={handleGlobalLogin}
                className="ml-4 px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:from-orange-600 hover:to-orange-700"
              >
                🚀 Login Sekarang
              </button>
            </div>
          )}
        </div>

        {ukmList.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Belum ada UKM tersedia.</p>
          </div>
        ) : (
          ukmList.map((ukm) => {
            const status = getRegistrationStatus(ukm.id);

            return (
              <div key={ukm.id} className="mb-12 bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300 hover:-translate-y-2">
                {/* HEADER - HOVER ACTION INFO */}
                <div className="p-8 bg-gradient-to-r from-indigo-50 via-white to-purple-50 border-b border-indigo-100">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent mb-2">
                        {ukm.nama}
                      </h2>
                      <p className="text-gray-600 leading-relaxed">{ukm.deskripsi}</p>
                    </div>
                    
                    {/* ✅ STATUS + HOVER ACTION */}
                    <div className="ml-6 flex flex-col items-end space-y-3">
                      {/* STATUS BADGE */}
                      {status !== 'not_registered' && (
                        <div className={`px-6 py-3 rounded-2xl font-bold shadow-lg text-sm min-w-[140px] text-center ${
                          status === 'accepted' 
                            ? 'bg-emerald-500/90 text-white border-2 border-emerald-400 shadow-emerald-500/25' 
                            : status === 'pending' 
                            ? 'bg-yellow-500/90 text-white border-2 border-yellow-400 shadow-yellow-500/25' 
                            : 'bg-red-500/90 text-white border-2 border-red-400 shadow-red-500/25'
                        }`}>
                          {status === 'accepted' ? '✅ DITERIMA' : 
                           status === 'pending' ? '⏳ PENDING' : '❌ DITOLAK'}
                        </div>
                      )}
                      
                      {/* ✅ HOVER ACTION CARD - BUKAN BUTTON */}
                      <div 
                        className={`group relative p-4 rounded-2xl font-semibold text-lg shadow-md transition-all duration-300 cursor-pointer ${
                          status === 'not_registered' && token
                            ? 'bg-gradient-to-r from-green-500/90 to-emerald-500/90 text-white hover:from-green-600 hover:to-emerald-600 hover:shadow-2xl hover:scale-105 hover:shadow-green-500/30 border-2 border-green-400/50'
                            : status !== 'not_registered'
                            ? 'bg-gradient-to-r from-gray-400/70 to-gray-500/70 text-white border-2 border-gray-400/50 cursor-not-allowed'
                            : 'bg-gradient-to-r from-gray-300/70 to-gray-400/70 text-gray-700 border-2 border-gray-300/50 hover:shadow-md hover:shadow-gray-300/30'
                        }`}
                        onClick={() => status === 'not_registered' && token && handleDaftar(ukm.id)}
                        title={
                          status === 'not_registered' && token 
                            ? "Klik untuk daftar sebagai anggota" 
                            : status === 'not_registered' && !token 
                            ? "Login dulu untuk daftar" 
                            : status === 'pending' 
                            ? "Menunggu konfirmasi admin" 
                            : status === 'accepted' 
                            ? "Sudah diterima sebagai anggota!" 
                            : "Pendaftaran ditolak"
                        }
                      >
                        <span className="relative z-10">
                          {status === 'not_registered' ? 
                           (token ? '📝 Daftar Anggota' : '🔐 Login Dulu') :
                           status === 'pending' ? '⏳ Menunggu' :
                           status === 'accepted' ? '✅ Anggota' : '❌ Ditolak'
                          }
                        </span>
                        
                        {/* ✅ HOVER EFFECT - GLOW + ACTION TEXT */}
                        <div className={`absolute inset-0 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                          status === 'not_registered' && token 
                            ? 'bg-gradient-to-r from-green-400/50 to-emerald-400/50 shadow-2xl shadow-green-500/25' 
                            : 'bg-gray-200/50'
                        }`}></div>
                        
                        {/* ✅ ACTION HINT */}
                        {status === 'not_registered' && token && (
                          <div className="absolute -bottom-12 right-0 bg-green-600 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 whitespace-nowrap shadow-lg">
                            Klik untuk daftar!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ANGGOTA LIST */}
                <div className="p-8">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ukm.anggota?.length > 0 ? (
                      ukm.anggota.map((person, index) => (
                        <div key={`${ukm.id}-${index}`} className="group hover:scale-105 transition-all duration-200 text-center border-2 border-gray-100 rounded-2xl p-6 hover:border-indigo-200 hover:shadow-xl bg-gradient-to-b from-white to-gray-50">
                          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                            <span className="text-white font-bold text-lg">
                              {person.nama.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-2 truncate">{person.nama}</h4>
                          <p className="text-indigo-600 font-medium bg-indigo-100 px-3 py-1 rounded-xl inline-block text-sm mb-2">
                            {person.jabatan || 'Anggota'}
                          </p>
                          {person.nim && (
                            <p className="text-sm text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded-lg">
                              {person.nim}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                        <div className="text-4xl mb-4">👥</div>
                        <p className="text-xl font-semibold text-gray-600 mb-2">Belum ada anggota</p>
                        <p className="text-gray-500">Jadilah yang pertama!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

export default Anggota;
