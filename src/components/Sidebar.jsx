import { useLocation } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../App";
import toast from 'react-hot-toast';

export default function Sidebar({ isOpen, onClose, navigate, onLogout }) {
  const location = useLocation();
  const { user, token, role, loading } = useContext(UserContext); // ✅ FULL USER STATE

  const MenuItem = ({ label, page, icon }) => (
    <button
      onClick={() => {
        navigate(page);
        onClose();
      }}
      className={`w-full p-4 my-2 rounded-xl font-semibold flex items-center space-x-3 transition-all duration-200 shadow-md ${
        location.pathname === page
          ? "bg-white/20 backdrop-blur-sm text-white shadow-white/20 scale-105"
          : "bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:shadow-lg hover:scale-102 text-white/90"
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </button>
  );

  // ✅ LOADING STATE
  if (loading) {
    return (
      <div className={`fixed top-0 right-0 h-full w-64 bg-gradient-to-br from-emerald-300 via-emerald-500 to-emerald-700 text-white p-6 shadow-xl z-40 transition-transform duration-300 flex flex-col items-center justify-center ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <p className="mt-4 text-white/80">Loading...</p>
      </div>
    );
  }

  return (
    <div
      className={`fixed top-0 right-0 h-full w-64 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 text-white p-6 shadow-2xl z-40 backdrop-blur-xl
      transition-all duration-300 flex flex-col border-l-4 border-white/20
      ${isOpen ? "translate-x-0 scale-100" : "translate-x-full scale-95"}`}
    >
      {/* ✅ HEADER DYNAMIC */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/20">
        <h3 className="text-2xl font-bold bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
          {token ? `Hi, ${user?.nama?.split(' ')[0] || 'User'}` : "SIU UKM"}
        </h3>
        <button 
          onClick={onClose}
          className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all hover:rotate-90"
        >
          ✕
        </button>
      </div>

      {/* ✅ GUEST (BELUM LOGIN) */}
      {!token ? (
        <div className="space-y-3 mb-8">
          <div className="text-center py-6 bg-gray-800 rounded-2xl backdrop-blur-sm">
            <div className="text-4xl mb-2">👋</div>
            <p className="text-white/90 font-medium">Belum login</p>
          </div>
          
          <MenuItem label="Login" page="/login" icon="🔐" />
          <MenuItem label="Daftar" page="/register" icon="📝" />
        </div>
      ) : (
        <>
          {/* ✅ USER LOGGED IN - MAIN MENU */}
          <div className="space-y-2 mb-8 flex-1">
            <MenuItem label="Beranda" page="/" icon="🏠" />
            <MenuItem label="Anggota" page="/anggota" icon="👥" />
            <MenuItem label="Kegiatan" page="/kegiatan" icon="🎯" />
            <MenuItem label="Profil" page="/profile" icon="👤" />
            
            {/* 🔥 ADMIN MENU - HANYA ADMIN */}
            {role === "admin" && (
              <div className="pt-4 border-t border-white/20 mt-4">
                <p className="text-white/70 text-xs uppercase font-bold tracking-wider mb-3 px-3">ADMIN</p>
                <MenuItem label="Panel Admin" page="/admin" icon="🛠️" />
              </div>
            )}
          </div>

          {/* ✅ USER LOGGED IN - BOTTOM ACTIONS */}
          <div className="space-y-2 pt-6 border-t border-white/20">
            <button
             onClick={() => {
              localStorage.clear();
              toast.success('Logout berhasil');
              navigate('/login');
            }}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-4 px-12 rounded-2xl shadow-xl hover:shadow-2xl hover:from-red-600 hover:to-red-700 transition-all text-xl"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
