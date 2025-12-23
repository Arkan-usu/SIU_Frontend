import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../App';
import toast from 'react-hot-toast';


/* ================= LOGIN MODAL ================= */
const LoginModal = ({ isOpen, onClose, onLogin }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6 bg-emerald-600 text-white rounded-t-2xl flex justify-between">
          <h3 className="font-bold text-xl">🔐 Login Diperlukan</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="p-8 text-center">
          <p className="mb-6 text-gray-600">
            Login diperlukan untuk mendaftar anggota UKM
          </p>
          <div className="flex gap-3">
            <button
              onClick={onLogin}
              className="flex-1 bg-emerald-600 text-white py-3 rounded-xl"
            >
              Login
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 py-3 rounded-xl"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= TOKEN ROLE ================= */
const getRoleFromToken = (token) => {
  try {
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  } catch {
    return null;
  }
};

/* ================= MAIN ================= */
function Anggota({ setAnggotaTerdaftar }) {
  const { token } = useContext(UserContext);
  const navigate = useNavigate();
  const [ukmList, setUkmList] = useState([]);
  const [userRegistrations, setUserRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const role = getRoleFromToken(token);
  const isAdmin = role === 'admin';

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const ukmRes = await axios.get('/ukm');
        setUkmList(ukmRes.data);
      } catch {
        setError('Gagal memuat data UKM');
        setLoading(false);
        return;
      }

      if (token) {
        try {
          const regRes = await axios.get('/pendaftar', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUserRegistrations(regRes.data);
        } catch {
          setUserRegistrations([]);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [token]);

  /* ================= ACTION ================= */
  const handleDaftar = async (ukmId) => {
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    try {
      toast.loading('Mendaftar...', { id: 'daftar' });

      const res = await axios.post(
        '/pendaftar',
        { ukm_id: ukmId, type: 'anggota' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUserRegistrations((prev) => [...prev, res.data.registration]);
      toast.success('Menunggu konfirmasi admin', { id: 'daftar' });
      setAnggotaTerdaftar?.(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal mendaftar', {
        id: 'daftar',
      });
    }
  };

  const handleBatal = (ukmId) => {
    if (!window.confirm('Batalkan pendaftaran ini?')) return;

    setUserRegistrations((prev) =>
      prev.filter(
        (r) => !(r.ukm_id === ukmId && r.type === 'anggota')
      )
    );

    toast.success('Pendaftaran dibatalkan');
  };

  const isUserRegistered = (ukmId) =>
    userRegistrations.some(
      (r) => r.ukm_id === ukmId && r.type === 'anggota'
    );

  /* ================= LOADING (TETAP) ================= */
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600">Memuat daftar UKM...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <>
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => (window.location.href = '/login')}
      />

      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-12">
          Daftar Anggota UKM
        </h1>

        {ukmList.map((ukm) => {
          const sudahTerdaftar = isUserRegistered(ukm.id);

          return (
            <div key={ukm.id} className="mb-16">
              {/* HEADER UKM */}
              <div className="flex justify-between items-center bg-indigo-50 p-6 rounded-lg mb-6">
                <h2
                  onClick={() => navigate(`/ukm/${ukm.id}`)}
                  className="text-2xl font-semibold text-indigo-600 cursor-pointer hover:underline hover:text-indigo-800 transition-colors"
                  title="Lihat detail UKM">
                  {ukm.nama}
                </h2>

                <div className="flex gap-3">
                  {sudahTerdaftar && (
                    <button
                      onClick={() => handleBatal(ukm.id)}
                      disabled={isAdmin}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold
                        ${
                          isAdmin
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-red-600 text-white'
                        }`}
                    >
                      ❌ Batal Daftar
                    </button>
                  )}

                  <button
                    onClick={() => handleDaftar(ukm.id)}
                    disabled={sudahTerdaftar || isAdmin}
                    className={`px-6 py-3 rounded-lg text-sm font-semibold
                      ${
                        sudahTerdaftar || isAdmin
                          ? 'bg-gray-400 cursor-not-allowed'
                          : !token
                          ? 'bg-orange-500 text-white'
                          : 'bg-green-700 text-white'
                      }`}
                  >
                    {isAdmin
                      ? 'Admin'
                      : sudahTerdaftar
                      ? '⏳ Pending'
                      : !token
                      ? '🔐 Login Dulu'
                      : '📝 Daftar Anggota'}
                  </button>
                </div>
              </div>

              {/* ✅ DAFTAR ANGGOTA (INI YANG HILANG TADI) */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ukm.anggota?.length > 0 ? (
                  ukm.anggota.map((person, i) => (
                    <div
                      key={i}
                      className="bg-white p-6 rounded-lg shadow-md text-center"
                    >
                      <div className="w-20 h-20 mx-auto mb-4 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {person.nama[0]}
                      </div>
                      <h3 className="font-semibold text-lg">
                        {person.nama}
                      </h3>
                      <p className="text-indigo-600 text-sm">
                        {person.jabatan || 'Anggota'}
                      </p>
                      {person.nim && (
                        <p className="text-gray-500 text-sm">
                          {person.nim}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="col-span-full text-center text-gray-500">
                    Belum ada anggota terdaftar
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default Anggota;
