import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import UkmKomentar from '../components/UkmKomentar';
import { UserContext } from '../App';

function DetailUkm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(UserContext);

  const [ukm, setUkm] = useState(null);
  const [status, setStatus] = useState(null); // null | pending | approved
  const [showModal, setShowModal] = useState(false);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const ukmRes = await axios.get(
          `https://siu-backend-theta.vercel.app/ukm/${id}`
        );
        setUkm(ukmRes.data);

        if (token && user) {
          // 1️⃣ cek sudah jadi anggota (APPROVED)
          const approved = ukmRes.data.anggota?.some(
            (a) => a.nim === user.nim
          );

          if (approved) {
            setStatus('approved');
            return;
          }

          // 2️⃣ cek status PENDING
          const regRes = await axios.get(
            'https://siu-backend-theta.vercel.app/pendaftar',
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const pending = regRes.data.some(
            (r) => r.ukm_id == id && r.type === 'anggota'
          );

          if (pending) setStatus('pending');
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [id, token, user]);

  /* ================= ACTIONS ================= */
  const handleDaftar = async () => {
    if (!token) {
      toast.error('Login terlebih dahulu');
      navigate('/login');
      return;
    }

    try {
      toast.loading('Mendaftar...', { id: 'daftar' });

      await axios.post(
        'https://siu-backend-theta.vercel.app/pendaftar',
        { ukm_id: id, type: 'anggota' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStatus('pending');
      toast.success('Menunggu konfirmasi admin', { id: 'daftar' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal mendaftar', {
        id: 'daftar',
      });
    }
  };

  const handleWaClick = (e) => {
    e.preventDefault();
    if (status === 'approved') {
      window.open(`https://wa.me/${ukm.wa_group}`, '_blank');
    } else {
      setShowModal(true);
    }
  };

  if (!ukm) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <>
      <div className="container mx-auto px-4 py-16">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-12 rounded-3xl mb-12 text-center">
          {ukm.gambar && (
            <img
              src={ukm.gambar}
              alt={ukm.nama}
              className="w-48 h-48 mx-auto rounded-full object-cover mb-6 border-4 border-white"
            />
          )}

          <h1 className="text-5xl font-bold mb-4">{ukm.nama}</h1>
          <p className="text-xl">{ukm.deskripsi}</p>

          {user && (
            <div className="mt-6">
              {status === 'approved' && (
                <div className="bg-emerald-500/20 border border-emerald-400 px-6 py-3 rounded-xl">
                  ✅ ANGGOTA TERDAFTAR
                </div>
              )}

              {status === 'pending' && (
                <div className="bg-orange-500/20 border border-orange-400 px-6 py-3 rounded-xl">
                  ⏳ MENUNGGU KONFIRMASI ADMIN
                </div>
              )}

              {!status && (
                <button
                  onClick={handleDaftar}
                  className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-full"
                >
                  📝 Daftar UKM
                </button>
              )}
            </div>
          )}
        </div>

        {/* ================= KEGIATAN & ANGGOTA ================= */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">

          {/* ===== KEGIATAN ===== */}
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              📅 Kegiatan
            </h2>

            {ukm.kegiatan?.length > 0 ? (
              ukm.kegiatan.map((keg, i) => (
                <div
                  key={i}
                  className="mb-4 p-4 bg-gray-50 rounded-xl"
                >
                  <h3 className="font-semibold text-lg">
                    {keg.nama}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {new Date(keg.tanggal).toISOString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {keg.deskripsi}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">
                Belum ada kegiatan
              </p>
            )}
          </div>

          {/* ===== ANGGOTA ===== */}
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              👥 Anggota ({ukm.anggota?.length || 0})
            </h2>

            {ukm.anggota?.length > 0 ? (
              ukm.anggota.map((anggota, i) => (
                <div
                  key={i}
                  className="flex items-center p-4 bg-gray-50 rounded-xl mb-3"
                >
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {anggota.nama?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {anggota.nama}
                    </p>
                    <p className="text-sm text-gray-600">
                      {anggota.nim || '-'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {anggota.jabatan || 'Anggota'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">
                Belum ada anggota
              </p>
            )}
          </div>

        </div>

        {/* WA */}
        {ukm.wa_group && (
          <div className="text-center">
            <button
              onClick={handleWaClick}
              className={`px-8 py-4 rounded-xl font-bold ${
                status === 'approved'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-400 text-white'
              }`}
            >
              📱 Gabung WhatsApp
            </button>
          </div>
        )}
      </div>

      <UkmKomentar ukmId={id} user={user} token={token} />

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl">
            <p className="mb-4">Hanya anggota terdaftar yang bisa masuk WA</p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default DetailUkm;
