import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../App';
import toast from 'react-hot-toast';

// ✅ UTILITY FORMAT TANGGAL
const formatTanggal = (isoString) => {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  };
  
  return date.toLocaleDateString('id-ID', options);
};

// ✅ MODAL - HARUS ANGGOTA UKM DULU (SAMA)
const MemberRequiredModal = ({ isOpen, onClose, ukmName }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in slide-in-from-top-4 duration-300">
        <div className="p-6 border-b border-gray-200 rounded-t-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">⚠️ Harus Anggota Dulu</h3>
            <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2 transition-all hover:rotate-90">✕</button>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-3xl">👥</span>
          </div>
          <h4 className="text-xl font-semibold text-gray-800 mb-2">Daftar Anggota {ukmName} Dulu</h4>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Hanya anggota UKM yang bisa ikut kegiatan. Daftar dulu ya!
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => window.location.href = '/anggota'}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              📝 Daftar Anggota
            </button>
            <button 
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
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
  const [userKegiatanRegs, setUserKegiatanRegs] = useState([]);
  const [userAnggotaRegs, setUserAnggotaRegs] = useState([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedUkmName, setSelectedUkmName] = useState('');
  
  const { token, user } = useContext(UserContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const ukmResponse = await axios.get('/ukm');
        setUkmList(ukmResponse.data);
        
        if (token && user?.id) {
          const [anggotaResponse, kegiatanResponse] = await Promise.all([
            axios.get(`/pendaftar/user/${user.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get(`/pendaftar/kegiatan/user/${user.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
          ]);
          
          setUserAnggotaRegs(anggotaResponse.data || []);
          setUserKegiatanRegs(kegiatanResponse.data || []);
        }
      } catch (err) {
        setError('Gagal memuat data kegiatan');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user?.id]);

  const getKegiatanStatus = (ukmId, kegiatanId) => {
    const kegReg = userKegiatanRegs.find(reg => 
      reg.ukm_id === ukmId && reg.kegiatan_id === kegiatanId
    );
    if (kegReg) {
      return kegReg.status || 'pending';
    }
    
    const anggotaReg = userAnggotaRegs.find(reg => reg.ukm_id === ukmId);
    if (!anggotaReg || anggotaReg.status !== 'accepted') {
      return 'need_member';
    }
    
    return 'can_register';
  };

  const handleDaftarKegiatan = async (ukmId, kegiatanId, ukmName) => {
    if (!token) {
      toast.error('Login dulu!');
      window.location.href = '/login';
      return;
    }

    const status = getKegiatanStatus(ukmId, kegiatanId);
    
    if (status === 'need_member') {
      setSelectedUkmName(ukmName);
      setShowMemberModal(true);
      return;
    }
    
    if (status !== 'can_register') {
      toast.error(`Status: ${status === 'pending' ? '⏳ Menunggu konfirmasi' : status === 'accepted' ? '✅ Terdaftar' : '❌ Ditolak'}`, { id: 'kegiatan' });
      return;
    }

    try {
      toast.loading('Mendaftar kegiatan...', { id: 'kegiatan' });
      
      const response = await axios.post('/pendaftar', {
        ukm_id: ukmId,
        kegiatan_id: kegiatanId,
        type: 'kegiatan'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUserKegiatanRegs(prev => [...prev, { ...response.data.registration, status: 'pending' }]);
      toast.success('✅ Berhasil daftar kegiatan! Menunggu konfirmasi', { id: 'kegiatan' });
      setKegiatanTerdaftar?.(true);
      
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal mendaftar kegiatan!', { id: 'kegiatan' });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Memuat kegiatan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <>
      <MemberRequiredModal 
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        ukmName={selectedUkmName}
      />

      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Ikuti Kegiatan UKM
        </h1>

        {ukmList.map((ukm) => (
          <div key={ukm.id} className="mb-16">
            <div className="bg-gradient-to-br from-emerald-300 via-emerald-500 to-emerald-700 text-white p-8 rounded-3xl mb-8 shadow-2xl">
              <h2 className="text-3xl font-bold mb-2">{ukm.nama}</h2>
              <p className="opacity-90">{ukm.deskripsi}</p>
            </div>

            {ukm.kegiatan?.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ukm.kegiatan.map((kegiatan) => {
                  const status = getKegiatanStatus(ukm.id, kegiatan.id);
                  
                  return (
                    <div key={kegiatan.id} className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border-2 group">
                      {/* HEADER */}
                      <div className="text-center mb-6">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                          🎯
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2 line-clamp-none">{kegiatan.nama}</h3>
                        {/* ✅ TANGGAL FORMAT INDONESIA */}
                        <p className="text-sm text-gray-500 font-medium bg-purple-100 px-3 py-1 rounded-full inline-block">
                          📅 {formatTanggal(kegiatan.tanggal)}
                        </p>
                      </div>

                      {/* DESKRIPSI */}
                      <p className="text-gray-700 mb-6 text-lg leading-relaxed line-clamp-3 group-hover:line-clamp-none">
                        {kegiatan.deskripsi}
                      </p>

                      {/* STATUS BADGE */}
                      <div className="flex items-center justify-center mb-6">
                        {status === 'need_member' && (
                          <span className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-bold border-2 border-orange-300">
                            👥 Harus Anggota Dulu
                          </span>
                        )}
                        {status === 'pending' && (
                          <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold border-2 border-yellow-300 animate-pulse">
                            ⏳ Menunggu Konfirmasi
                          </span>
                        )}
                        {status === 'accepted' && (
                          <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold border-2 border-emerald-300">
                            ✅ Sudah Terdaftar
                          </span>
                        )}
                      </div>

                      {/* BUTTON */}
                      <button
                        onClick={() => handleDaftarKegiatan(ukm.id, kegiatan.id, ukm.nama)}
                        disabled={status !== 'can_register'}
                        className={`w-full py-4 px-6 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 transform hover:scale-105 ${
                          status === 'can_register'
                            ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-purple-500/50 cursor-pointer'
                            : status === 'need_member'
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-orange-500/50 cursor-pointer'
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed shadow-none transform-none'
                        }`}
                        title={
                          status === 'can_register' ? 'Daftar kegiatan' :
                          status === 'need_member' ? 'Daftar anggota UKM dulu' :
                          status === 'pending' ? 'Menunggu konfirmasi' : 'Sudah terdaftar'
                        }
                      >
                        {status === 'can_register' ? '🎯 Ikut Kegiatan' :
                         status === 'need_member' ? '👥 Daftar Anggota Dulu' :
                         status === 'pending' ? '⏳ Menunggu Konfirmasi' : '✅ Sudah Terdaftar'}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-3xl">
                <p className="text-2xl text-gray-500 mb-4">📅 Belum ada kegiatan</p>
                <p className="text-gray-600">Tanyakan ke admin UKM untuk info kegiatan terbaru</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default Kegiatan;
