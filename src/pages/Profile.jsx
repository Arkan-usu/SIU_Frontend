import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Profile() {
  const navigate = useNavigate();
  const { user, token, role } = useContext(UserContext); // ✅ ADD ROLE
  const [ukmTerdaftar, setUkmTerdaftar] = useState([]);
  const [kegiatanIkut, setKegiatanIkut] = useState([]);
  const [pendingRegs, setPendingRegs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfileData();
  }, [token]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      if (role === 'admin') {
        // ✅ ADMIN: Cuma data diri
        setLoading(false);
        return;
      }

      // ✅ USER: Fetch registrations
      const regRes = await axios.get(`/pendaftar/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // UKM terdaftar (accepted anggota)
      const acceptedAnggota = regRes.data.filter(r => 
        r.type === 'anggota' && r.status === 'accepted'
      );
      
      // Kegiatan ikut (accepted kegiatan) + WA link
      const acceptedKegiatan = regRes.data.filter(r => 
        r.type === 'kegiatan' && r.status === 'accepted'
      );
      
      // Pending registrations
      const pending = regRes.data.filter(r => r.status === 'pending');
      
      // Fetch UKM details untuk terdaftar
      const ukmIds = acceptedAnggota.map(r => r.ukm_id);
      const ukmRes = await axios.get('/ukm');
      const ukmTerdaftar = ukmRes.data.filter(ukm => ukmIds.includes(ukm.id));
      
      setUkmTerdaftar(ukmTerdaftar);
      setKegiatanIkut(acceptedKegiatan);
      setPendingRegs(pending);
      
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
      toast.error('Gagal memuat profil');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* ✅ HEADER */}
        <div className="bg-white shadow-2xl rounded-3xl p-10 mb-12 text-center">
          <div className="flex justify-center mb-8">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl border-6 border-white relative">
              <span className="text-4xl font-bold text-white drop-shadow-lg">
                {user?.nama?.charAt(0)?.toUpperCase() || 'U'}
              </span>
              {role === 'admin' ? (
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white border-4 border-white shadow-lg">
                  ADMIN
                </div>
              ) : (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center text-xs font-bold text-white border-4 border-white shadow-lg">
                  {ukmTerdaftar.length}
                </div>
              )}
            </div>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            {user?.nama || 'Nama Pengguna'}
          </h1>
          <p className="text-xl text-gray-600 mb-4">{user?.nim || 'NIM'}</p>
          <p className="text-lg text-gray-500">{user?.email || 'Email'}</p>
          <p className="text-lg text-gray-500">{user?.fakultas || 'Fakultas'}</p>
        </div>

        {/* ✅ ADMIN vs USER SPLIT */}
        {role === 'admin' ? (
          /* ✅ ADMIN: SIMPEL - DATA DIRI SAJA */
          <div className="bg-white shadow-2xl rounded-3xl p-12 text-center">
            <div className="text-6xl mb-8 mx-auto">👑</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Panel Admin</h2>
            <p className="text-xl text-gray-600 mb-8">Kelola UKM, pendaftar, dan kegiatan</p>
            <div className="grid md:grid-cols-2 gap-6">
              <button 
                onClick={() => navigate('/admin')}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-6 px-8 rounded-2xl shadow-xl hover:shadow-2xl hover:from-red-600 hover:to-red-700 transition-all text-xl"
              >
                🛠️ Dashboard Admin
              </button>
              <button 
                onClick={() => navigate('/ukm')}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold py-6 px-8 rounded-2xl shadow-xl hover:shadow-2xl hover:from-emerald-600 hover:to-emerald-700 transition-all text-xl"
              >
                📋 Semua UKM
              </button>
            </div>
          </div>

        ) : (
          /* ✅ USER: NOTIFIKASI + WA LINKS */
          <div className="space-y-8">
            
            {/* PENDING NOTIFICATIONS */}
            {pendingRegs.length > 0 && (
              <div className="bg-white shadow-2xl rounded-3xl p-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center text-yellow-800">
                  ⏳ Menunggu Approve ({pendingRegs.length})
                </h3>
                <div className="space-y-4 max-h-48 overflow-y-auto">
                  {pendingRegs.map(reg => (
                    <div key={reg.id} className="flex items-center p-4 bg-yellow-50 rounded-2xl border-2 border-yellow-200">
                      <div className="w-12 h-12 bg-yellow-200 rounded-xl flex items-center justify-center mr-4">
                        <span className="text-2xl">⏳</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold">{reg.ukm_nama}</div>
                        <div className="text-sm text-gray-600 capitalize">{reg.type}</div>
                      </div>
                      <span className="px-4 py-2 bg-yellow-200 text-yellow-800 rounded-full text-sm font-bold">
                        Pending
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* UKM TERDAFTAR */}
            {ukmTerdaftar.length > 0 && (
              <div className="bg-white shadow-2xl rounded-3xl p-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center text-emerald-800">
                  🏛️ UKM Terdaftar ({ukmTerdaftar.length})
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ukmTerdaftar.map(ukm => (
                    <div key={ukm.id} className="group p-6 bg-emerald-50 rounded-2xl border-2 border-emerald-200 hover:shadow-xl hover:-translate-y-1 transition-all">
                      {ukm.gambar && (
                        <img src={ukm.gambar} alt={ukm.nama} className="w-full h-32 object-cover rounded-xl mb-4 group-hover:scale-105 transition-transform" />
                      )}
                      <h4 className="font-bold text-lg mb-2 line-clamp-1">{ukm.nama}</h4>
                      {ukm.wa_group && (
                        <a href={`https://wa.me/${ukm.wa_group}`} 
                           className="block w-full bg-green-500 text-white py-3 px-6 rounded-xl text-center font-semibold hover:bg-green-600 transition-all mt-4"
                           target="_blank" rel="noopener noreferrer">
                          📱 WA Group
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KEGIATAN IKUT + WA LINK */}
            {kegiatanIkut.length > 0 && (
              <div className="bg-white shadow-2xl rounded-3xl p-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center text-orange-800">
                  🎯 Kegiatan Terdaftar ({kegiatanIkut.length})
                </h3>
                <div className="space-y-4">
                  {kegiatanIkut.map(reg => (
                    <div key={reg.id} className="flex items-center p-6 bg-orange-50 rounded-2xl border-2 border-orange-200">
                      <div className="w-16 h-16 bg-orange-200 rounded-2xl flex items-center justify-center mr-6 text-2xl">
                        🎯
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg">{reg.ukm_nama}</div>
                        <div className="text-orange-800 font-semibold">{reg.kegiatan_nama}</div>
                      </div>
                      {reg.link_wa && (
                        <a href={`https://wa.me/${reg.link_wa}`} 
                           className="ml-4 bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-all flex items-center"
                           target="_blank" rel="noopener noreferrer">
                          📱 Info WA
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ✅ ACTION BUTTONS */}
        <div className="grid md:grid-cols-3 gap-6 pt-12 border-t-4 border-emerald-100 bg-white rounded-3xl p-12 mt-12">
          {role !== 'admin' && (
            <button 
              onClick={() => navigate('/anggota')}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold py-6 px-8 rounded-2xl shadow-xl hover:shadow-2xl hover:from-emerald-700 hover:to-emerald-800 transition-all text-xl"
            >
              📝 Daftar UKM
            </button>
          )}
          <button 
            onClick={() => navigate('/kegiatan')}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-6 px-8 rounded-2xl shadow-xl hover:shadow-2xl hover:from-orange-600 hover:to-orange-700 transition-all text-xl"
          >
            🎯 Ikut Kegiatan
          </button>
          <button 
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold py-6 px-8 rounded-2xl shadow-xl hover:shadow-2xl hover:from-gray-600 hover:to-gray-700 transition-all text-xl"
          >
            🏠 Home
          </button>
        </div>

        {/* LOGOUT */}
        <div className="text-center mt-12">
          <button 
            onClick={() => {
              localStorage.clear();
              toast.success('Logout berhasil');
              navigate('/login');
            }}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-4 px-12 rounded-2xl shadow-xl hover:shadow-2xl hover:from-red-600 hover:to-red-700 transition-all text-xl"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}
