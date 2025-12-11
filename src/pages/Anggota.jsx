import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../App';
import toast from 'react-hot-toast';

// ✅ MODAL COMPONENT (SAMA)
const LoginModal = ({ isOpen, onClose, onLogin }) => {
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
            <button onClick={onLogin} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5">
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
  const [userRegistrations, setUserRegistrations] = useState([]); // ✅ NOW HAS STATUS
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const { token, user } = useContext(UserContext); // ✅ ADD USER

  // ✅ FETCH DATA + REGISTRATIONS WITH STATUS
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch UKM
        const ukmResponse = await axios.get('/ukm');
        setUkmList(ukmResponse.data);
        
        // ✅ Fetch USER REGISTRATIONS + STATUS
        if (token && user?.id) {
          try {
            const regResponse = await axios.get(`/pendaftar/user/${user.id}`, { // ✅ USER-SPECIFIC API
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
  }, [token, user?.id]); // ✅ ADD user.id DEPENDENCY

  // ✅ CHECK REGISTRATION STATUS (PERSISTEN!)
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

  // *** LOGIN CHECK + MODAL TRIGGER ***
  const handleDaftar = async (ukmId) => {
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    const status = getRegistrationStatus(ukmId);
    if (status !== 'not_registered') {
      toast.error(`Status Anda: ${status === 'pending' ? '⏳ Menunggu konfirmasi' : status === 'accepted' ? '✅ Diterima' : '❌ Ditolak'}`, { id: 'daftar' });
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

      // ✅ IMMEDIATELY UPDATE LOCAL STATE
      setUserRegistrations(prev => [...prev, { ...response.data.registration, status: 'pending' }]);
      toast.success('✅ Berhasil daftar! Menunggu konfirmasi admin', { id: 'daftar' });
      setAnggotaTerdaftar?.(true);
      
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal mendaftar!', { id: 'daftar' });
    }
  };

  const handleLoginClick = () => {
    setShowLoginModal(false);
    window.location.href = '/login';
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
        onLogin={handleLoginClick}
      />

      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Daftar Anggota UKM
        </h1>

        {ukmList.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Belum ada UKM tersedia.</p>
          </div>
        ) : (
          ukmList.map((ukm) => {
            const status = getRegistrationStatus(ukm.id); // ✅ PERSISTEN STATUS

            return (
              <div key={ukm.id} className="mb-12">
                <div className="flex justify-between items-center mb-4 p-6 bg-indigo-50 rounded-lg">
                  <h2 className="text-2xl font-semibold text-indigo-600">
                    {ukm.nama}
                  </h2>
                  <div className="flex items-center gap-3">
                    {/* ✅ STATUS BADGE - PERSISTEN */}
                    {status !== 'not_registered' && (
                      <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-md ${
                        status === 'accepted' ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-400' :
                        status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-400' :
                        'bg-red-100 text-red-800 border-2 border-red-400'
                      }`}>
                        {status === 'accepted' ? '✅ DITERIMA' : 
                         status === 'pending' ? '⏳ PENDING' : '❌ DITOLAK'}
                      </span>
                    )}
                    
                    {/* ✅ BUTTON BASED ON REAL STATUS */}
                    <button
                      onClick={() => handleDaftar(ukm.id)}
                      disabled={status !== 'not_registered'}
                      className={`px-6 py-3 rounded-lg text-sm font-semibold shadow-md transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 ${
                        status === 'not_registered' && token
                          ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-green-500/50 cursor-pointer'
                          : status === 'not_registered' && !token
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-orange-500/50 cursor-pointer'
                          : 'bg-gray-400 text-gray-600 cursor-not-allowed shadow-none transform-none'
                      }`}
                      title={
                        status === 'not_registered' ? (!token ? "Login diperlukan" : "Daftar sekarang") :
                        status === 'pending' ? "Menunggu konfirmasi admin" :
                        status === 'accepted' ? "Sudah diterima!" : "Ditolak, hubungi admin"
                      }
                    >
                      {status === 'not_registered' ? 
                       (!token ? '🔐 Login Dulu' : '📝 Daftar Anggota') :
                       status === 'pending' ? '⏳ Menunggu Konfirmasi' :
                       status === 'accepted' ? '✅ Sudah Diterima' : '❌ Ditolak'
                      }
                    </button>
                  </div>
                </div>

                {/* ANGGOTA LIST - SAMA */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {ukm.anggota?.length > 0 ? (
                    ukm.anggota.map((person, index) => (
                      <div key={`${ukm.id}-${index}`} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105 text-center border-2 border-gray-100">
                        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {person.nama.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate">{person.nama}</h3>
                        <p className="text-indigo-600 font-medium bg-indigo-50 px-3 py-1 rounded-full inline-block text-sm">
                          {person.jabatan || 'Anggota'}
                        </p>
                        {person.nim && <p className="text-sm text-gray-500 mt-1">{person.nim}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="col-span-full text-center text-gray-500 py-8">
                      Belum ada anggota terdaftar
                    </p>
                  )}
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
