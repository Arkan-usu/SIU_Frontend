import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../App'; // sesuaikan path

function DetailUkm() {
  const { id } = useParams();
  const [ukm, setUkm] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [showModal, setShowModal] = useState(false); // ✅ MODAL STATE
  const { user, token } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUkm = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/ukm/${id}`);
        setUkm(response.data);

        // Cek apakah user terdaftar sebagai anggota
        if (user && token) {
          const anggotaTerdaftar = response.data.anggota?.some(
            (anggota) => anggota.nim === user.nim
          );
          setIsMember(anggotaTerdaftar || false);
        }
      } catch (error) {
        console.error('Error fetch UKM:', error);
      }
    };

    fetchUkm();
  }, [id, user, token]);

  // ✅ HANDLE WA CLICK - TAMPILKAN MODAL
  const handleWaClick = (e) => {
    e.preventDefault();
    if (isMember) {
      // Langsung buka WA jika sudah member
      window.open(`https://wa.me/${ukm.wa_group}`, '_blank');
    } else {
      // Tampilkan modal interaktif
      setShowModal(true);
    }
  };

  // ✅ CLOSE MODAL
  const closeModal = () => {
    setShowModal(false);
  };

  if (!ukm) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <>
      <div className="container mx-auto px-4 py-16">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-12 rounded-3xl mb-12 text-center">
          {ukm.gambar && (
            <img 
              src={ukm.gambar} 
              alt={ukm.nama}
              className="w-48 h-48 mx-auto rounded-full object-cover shadow-2xl mb-6 border-4 border-white"
            />
          )}
          <h1 className="text-5xl font-bold mb-4">{ukm.nama}</h1>
          <p className="text-xl opacity-90">{ukm.deskripsi}</p>
          
          {/* STATUS MEMBER */}
          {user && (
            <div className={`inline-flex items-center mt-4 px-4 py-2 rounded-full text-sm font-bold ${
              isMember 
                ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-100' 
                : 'bg-orange-500/20 border border-orange-400 text-orange-100'
            }`}>
              {isMember ? '✅ ANGGOTA TERDAFTAR' : '⏳ BELUM TERDAFTAR'}
            </div>
          )}
        </div>

        {/* KEGIATAN & ANGGOTA */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold mb-6">📅 Kegiatan</h2>
            {ukm.kegiatan?.length > 0 ? (
              ukm.kegiatan.map((keg, i) => (
                <div key={i} className="mb-4 p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-lg">{keg.nama}</h3>
                  <p className="text-gray-600">{keg.tanggal}</p>
                  <p className="text-sm text-gray-500 mt-1">{keg.deskripsi}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">Belum ada kegiatan</p>
            )}
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold mb-6">👥 Anggota ({ukm.anggota?.length || 0})</h2>
            {ukm.anggota?.length > 0 ? (
              ukm.anggota.map((anggota, i) => (
                <div key={i} className="flex items-center p-4 bg-gray-50 rounded-xl mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4 shadow-lg">
                    {anggota.nama.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{anggota.nama}</p>
                    <p className="text-sm text-gray-600">{anggota.nim}</p>
                    <p className="text-xs text-gray-500">{anggota.jabatan}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">Belum ada anggota</p>
            )}
          </div>
        </div>

        {/* WA GROUP BUTTON */}
        {ukm.wa_group && (
          <div className="text-center">
            <button 
              onClick={handleWaClick}
              className={`inline-flex items-center px-8 py-4 rounded-2xl text-xl font-bold shadow-xl transform hover:scale-105 transition-all duration-300 ${
                isMember
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-2xl'
                  : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600 cursor-pointer shadow-lg'
              }`}
            >
              📱 {isMember ? 'Gabung WhatsApp Group' : 'Daftar Dulu untuk Gabung WA'}
            </button>
          </div>
        )}
      </div>

      {/* ✅ MODAL INTERAKTIF */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 animate-in slide-in-from-bottom-4 duration-300">
            
            {/* HEADER MODAL */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-orange-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Akses WhatsApp Dibatasi</h2>
              <p className="text-gray-600">Grup WA hanya untuk anggota terdaftar</p>
            </div>

            {/* INFO */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6 mb-6">
              <h3 className="font-semibold text-lg text-orange-800 mb-2">Cara Bergabung:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start">
                  <span className="text-orange-500 font-bold mr-2">1.</span>
                  <span>Daftarkan diri sebagai anggota UKM ini</span>
                </div>
                <div className="flex items-start">
                  <span className="text-orange-500 font-bold mr-2">2.</span>
                  <span>Tunggu konfirmasi admin</span>
                </div>
                <div className="flex items-start">
                  <span className="text-orange-500 font-bold mr-2">3.</span>
                  <span>Gabung grup WA setelah diterima</span>
                </div>
              </div>
            </div>

            {/* STATUS USER */}
            {user && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                <p className="font-medium text-gray-800 mb-1">Status Anda:</p>
                <p className="text-sm text-gray-600">NIM: <span className="font-mono bg-white px-2 py-1 rounded text-xs">{user.nim}</span></p>
                {!isMember && (
                  <p className="text-sm font-medium text-orange-600 mt-1">⏳ Belum terdaftar di {ukm.nama}</p>
                )}
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Tutup
              </button>
              <button
                onClick={() => navigate('/anggota')}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                📝 Daftar Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DetailUkm;
