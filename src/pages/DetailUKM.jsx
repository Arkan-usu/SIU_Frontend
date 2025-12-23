import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UkmKomentar from '../components/UkmKomentar';
import axios from 'axios';
import { UserContext } from '../App';

function DetailUkm() {
  const { id } = useParams();
  const [ukm, setUkm] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { user, token } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUkm = async () => {
      try {
        const response = await axios.get(
          `https://siu-backend-theta.vercel.app/ukm/${id}`
        );
        setUkm(response.data);

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

  const handleWaClick = (e) => {
    e.preventDefault();
    if (isMember) {
      window.open(`https://wa.me/${ukm.wa_group}`, '_blank');
    } else {
      setShowModal(true);
    }
  };

  const closeModal = () => setShowModal(false);

  if (!ukm)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );

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

          {/* ===== STATUS MEMBER + TOMBOL DAFTAR ===== */}
          {user && (
            <div
              className={`inline-flex flex-col items-center mt-6 px-6 py-4 rounded-2xl text-sm font-bold ${
                isMember
                  ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-100'
                  : 'bg-orange-500/20 border border-orange-400 text-orange-100'
              }`}
            >
              <span>
                {isMember ? '✅ ANGGOTA TERDAFTAR' : '⏳ BELUM TERDAFTAR'}
              </span>

              {/* ✅ TOMBOL DAFTAR (HANYA JIKA BELUM TERDAFTAR) */}
              {!isMember && (
                <button
                  onClick={() => navigate('/anggota')}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600
                             text-white rounded-full shadow-lg
                             hover:from-emerald-600 hover:to-emerald-700
                             transition-all duration-300"
                >
                  📝 Daftar UKM
                </button>
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
                <div key={i} className="mb-4 p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-lg">{keg.nama}</h3>
                  <p className="text-gray-600">{keg.tanggal}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {keg.deskripsi}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">Belum ada kegiatan</p>
            )}
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold mb-6">
              👥 Anggota ({ukm.anggota?.length || 0})
            </h2>
            {ukm.anggota?.length > 0 ? (
              ukm.anggota.map((anggota, i) => (
                <div
                  key={i}
                  className="flex items-center p-4 bg-gray-50 rounded-xl mb-3"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4 shadow-lg">
                    {anggota.nama.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{anggota.nama}</p>
                    <p className="text-sm text-gray-600">{anggota.nim}</p>
                    <p className="text-xs text-gray-500">
                      {anggota.jabatan}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">Belum ada anggota</p>
            )}
          </div>
        </div>

        {/* WA BUTTON */}
        {ukm.wa_group && (
          <div className="text-center">
            <button
              onClick={handleWaClick}
              className={`inline-flex items-center px-8 py-4 rounded-2xl text-xl font-bold shadow-xl transform hover:scale-105 transition-all duration-300 ${
                isMember
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                  : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
              }`}
            >
              📱{' '}
              {isMember
                ? 'Gabung WhatsApp Group'
                : 'Daftar Dulu untuk Gabung WA'}
            </button>
          </div>
        )}
      </div>

      <UkmKomentar ukmId={id} user={user} token={token} />

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-center">
              Akses WhatsApp Dibatasi
            </h2>
            <p className="text-center mb-6 text-gray-600">
              Grup WA hanya untuk anggota terdaftar
            </p>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 bg-gray-500 text-white py-3 rounded-xl"
              >
                Tutup
              </button>
              <button
                onClick={() => navigate('/anggota')}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-xl"
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
