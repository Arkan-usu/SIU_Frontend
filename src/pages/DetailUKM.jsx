import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UkmKomentar from '../components/UkmKomentar';
import axios from 'axios';
import { UserContext } from '../App';
import toast from 'react-hot-toast';

// ✅ HELPER FORMAT TANGGAL
const formatTanggal = (tanggalIso) => {
  if (!tanggalIso) return 'Tanggal TBD';
  
  const date = new Date(tanggalIso);
  const options = { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    weekday: 'short'
  };
  return date.toLocaleDateString('id-ID', options); // "25 Des 2025"
};

// ✅ LOGIN MODAL
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
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-3xl">👤</span>
          </div>
          <h4 className="text-xl font-semibold text-gray-800 mb-2">Login untuk Daftar</h4>
          <p className="text-gray-600 mb-8 leading-relaxed">Anda perlu login untuk mendaftar sebagai anggota UKM ini.</p>
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

function DetailUkm() {
  const { id } = useParams();
  const [ukm, setUkm] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [showWaModal, setShowWaModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userRegistrationStatus, setUserRegistrationStatus] = useState('not_registered');
  const { user, token } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUkm = async () => {
      try {
        const response = await axios.get(`https://siu-backend-theta.vercel.app/ukm/${id}`);
        setUkm(response.data);

        if (user && token) {
          // Cek membership
          const anggotaTerdaftar = response.data.anggota?.some(
            (anggota) => anggota.nim === user.nim
          );
          setIsMember(anggotaTerdaftar || false);
          
          // Cek registration status
          try {
            const regResponse = await axios.get(`https://siu-backend-theta.vercel.app/pendaftar/user/${user.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const registration = regResponse.data.find(reg => reg.ukm_id == id && reg.type === 'anggota');
            if (registration) {
              setUserRegistrationStatus(registration.status || 'pending');
            }
          } catch (regErr) {
            setUserRegistrationStatus('not_registered');
          }
        }
      } catch (error) {
        console.error('Error fetch UKM:', error);
      }
    };

    fetchUkm();
  }, [id, user, token]);

  const handleDaftarAnggota = async () => {
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    if (userRegistrationStatus !== 'not_registered') {
      toast.error(`Status Anda: ${getStatusText(userRegistrationStatus)}`, { id: 'daftar' });
      return;
    }

    try {
      toast.loading('Mendaftar...', { id: 'daftar' });
      const response = await axios.post('https://siu-backend-theta.vercel.app/pendaftar', {
        ukm_id: parseInt(id),
        type: 'anggota'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUserRegistrationStatus('pending');
      toast.success('✅ Berhasil daftar! Menunggu konfirmasi admin', { id: 'daftar' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal mendaftar!', { id: 'daftar' });
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'accepted': return '✅ Sudah Diterima';
      case 'pending': return '⏳ Menunggu Konfirmasi';
      case 'rejected': return '❌ Ditolak';
      default: return '📝 Daftar Sekarang';
    }
  };

  const handleWaClick = (e) => {
    e.preventDefault();
    if (isMember) {
      window.open(`https://wa.me/${ukm.wa_group}`, '_blank');
    } else {
      setShowWaModal(true);
    }
  };

  const closeWaModal = () => setShowWaModal(false);
  const handleLoginClick = () => {
    setShowLoginModal(false);
    navigate('/login');
  };

  if (!ukm) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <>
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLoginClick}
      />

      <div className="container mx-auto px-4 py-16">
        {/* HEADER */}
        <div className="bg-gradient-to-br from-emerald-300 via-emerald-500 to-emerald-700 text-white p-12 rounded-3xl mb-12 text-center">
          {ukm.gambar && (
            <img src={ukm.gambar} alt={ukm.nama} className="w-48 h-48 mx-auto rounded-full object-cover shadow-2xl mb-6 border-4 border-white" />
          )}
          <h1 className="text-5xl font-bold mb-4">{ukm.nama}</h1>
          <p className="text-xl opacity-90">{ukm.deskripsi}</p>
          
          {user && (
            <div className="space-y-2 mt-4">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
                isMember ? 'bg-emerald-500/30 border-2 border-emerald-400 text-emerald-100' : 'bg-orange-500/30 border-2 border-orange-400 text-orange-100'
              }`}>
                {isMember ? '👑 ANGGOTA TERDAFTAR' : '⏳ BELUM TERDAFTAR'}
              </div>
              {userRegistrationStatus !== 'not_registered' && (
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
                  userRegistrationStatus === 'accepted' ? 'bg-green-500/30 border-2 border-green-400 text-green-100' :
                  userRegistrationStatus === 'pending' ? 'bg-yellow-500/30 border-2 border-yellow-400 text-yellow-100' :
                  'bg-red-500/30 border-2 border-red-400 text-red-100'
                }`}>
                  {getStatusText(userRegistrationStatus)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* KEGIATAN & ANGGOTA */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold mb-6">📅 Kegiatan</h2>
            {ukm.kegiatan?.length > 0 ? (
              ukm.kegiatan.map((keg, i) => (
                <div key={i} className="mb-6 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border-l-4 border-emerald-400 shadow-md hover:shadow-xl transition-all duration-300">
                  <h3 className="font-bold text-xl text-gray-800 mb-2">{keg.nama}</h3>
                  {/* ✅ TANGGAL DIRAPikan! */}
                  <div className="inline-flex items-center bg-white px-4 py-2 rounded-full text-sm font-semibold text-emerald-700 shadow-sm mb-3">
                    📅 {formatTanggal(keg.tanggal)}
                  </div>
                  {keg.link_wa && (
                    <a href={`https://wa.me/${keg.link_wa}`} target="_blank" rel="noopener noreferrer" 
                       className="inline-block bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors">
                      📱 Info WA
                    </a>
                  )}
                  <p className="text-gray-600 leading-relaxed mt-3">{keg.deskripsi}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic text-center py-12">Belum ada kegiatan</p>
            )}
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold mb-6">👥 Anggota ({ukm.anggota?.length || 0})</h2>
            {ukm.anggota?.length > 0 ? (
              ukm.anggota.map((anggota, i) => (
                <div key={i} className="flex items-center p-4 bg-gray-50 rounded-xl mb-3 hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4 shadow-lg flex-shrink-0">
                    {anggota.nama.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{anggota.nama}</p>
                    <p className="text-sm text-gray-600">{anggota.nim}</p>
                    <p className="text-xs text-gray-500 bg-indigo-100 px-2 py-1 rounded inline-block">
                      {anggota.jabatan || 'Anggota'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic text-center py-12">Belum ada anggota</p>
            )}
          </div>
        </div>

        {/* DAFTAR ANGGOTA BUTTON */}
        {user && (
          <div className="text-center mb-12">
            <button
              onClick={handleDaftarAnggota}
              disabled={userRegistrationStatus !== 'not_registered'}
              className={`inline-flex items-center px-12 py-5 rounded-3xl text-xl font-bold shadow-2xl transform hover:scale-105 transition-all duration-300 ${
                userRegistrationStatus === 'not_registered'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 shadow-emerald-500/50 cursor-pointer'
                  : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed shadow-none transform-none'
              }`}
            >
              {getStatusText(userRegistrationStatus)}
            </button>
          </div>
        )}

        {/* WA GROUP BUTTON */}
        {ukm.wa_group && (
          <div className="text-center mb-12">
            <button 
              onClick={handleWaClick}
              className={`inline-flex items-center px-8 py-4 rounded-2xl text-xl font-bold shadow-xl transform hover:scale-105 transition-all duration-300 ${
                isMember
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-2xl cursor-pointer'
                  : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600 cursor-pointer shadow-lg'
              }`}
            >
              📱 {isMember ? 'Gabung WhatsApp Group' : 'Daftar Dulu untuk Gabung WA'}
            </button>
          </div>
        )}
      </div>

      <UkmKomentar ukmId={id} user={user} token={token} />

      {/* WA MODAL */}
      {showWaModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 animate-in slide-in-from-bottom-4 duration-300">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-orange-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Akses WhatsApp Dibatasi</h2>
              <p className="text-gray-600">Grup WA hanya untuk anggota terdaftar</p>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6 mb-6">
              <h3 className="font-semibold text-lg text-orange-800 mb-2">Cara Bergabung:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start"><span className="text-orange-500 font-bold mr-2">1.</span><span>Daftarkan diri sebagai anggota</span></div>
                <div className="flex items-start"><span className="text-orange-500 font-bold mr-2">2.</span><span>Tunggu konfirmasi admin</span></div>
                <div className="flex items-start"><span className="text-orange-500 font-bold mr-2">3.</span><span>Gabung grup WA setelah diterima</span></div>
              </div>
            </div>
            {user && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                <p className="font-medium text-gray-800 mb-1">Status Anda:</p>
                <p className="text-sm text-gray-600">NIM: <span className="font-mono bg-white px-2 py-1 rounded text-xs">{user.nim}</span></p>
                {!isMember && <p className="text-sm font-medium text-orange-600 mt-1">⏳ Belum terdaftar di {ukm.nama}</p>}
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={closeWaModal} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Tutup
              </button>
              {!isMember && (
                <button onClick={handleDaftarAnggota} className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  📝 Daftar Sekarang
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DetailUkm;
