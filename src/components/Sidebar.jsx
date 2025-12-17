import { useLocation } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../App";
import toast from "react-hot-toast";

export default function Sidebar({ isOpen, onClose, navigate }) {
  const location = useLocation();
  const { user, token, role, loading } = useContext(UserContext);

  const MenuItem = ({ label, page, icon }) => (
    <button
      onClick={() => {
        navigate(page);
        onClose();
      }}
      className={`w-full p-4 my-2 rounded-xl font-semibold flex items-center gap-3 transition-all shadow-md
        ${
          location.pathname === page
            ? "bg-white/20 text-white scale-105"
            : "bg-white/10 hover:bg-white/20 text-white/90"
        }`}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </button>
  );

  if (loading) {
    return (
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600
        text-white p-6 shadow-xl z-40 transition-transform duration-300
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed top-0 right-0 h-full w-64 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600
      text-white p-6 shadow-2xl z-40 transition-transform duration-300
      ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 border-b border-white/20 pb-4">
        <h3 className="text-xl font-bold">
          {token ? `Hi, ${user?.nama?.split(" ")[0] || "User"}` : "SIU UKM"}
        </h3>
        <button onClick={onClose} className="text-xl">✕</button>
      </div>

      {/* ===== MOBILE NAVBAR MENU (SAMA DENGAN DESKTOP) ===== */}
      <div className="md:hidden mb-6">
        <MenuItem label="Home" page="/" icon="🏠" />
        <MenuItem label="Laporan" page="/laporan" icon="📄" />
        <MenuItem label="Anggota" page="/anggota" icon="👥" />
        <MenuItem label="Kegiatan" page="/kegiatan" icon="🎯" />
        <MenuItem label="Kalender" page="/kalender" icon="📅" />
      </div>

      {!token ? (
        <>
          <MenuItem label="Login" page="/login" icon="🔐" />
          <MenuItem label="Daftar" page="/register" icon="📝" />
        </>
      ) : (
        <>
          <MenuItem label="Profil" page="/profile" icon="👤" />

          {role === "admin" && (
            <div className="mt-4 border-t border-white/20 pt-4">
              <MenuItem label="Panel Admin" page="/admin" icon="🛠️" />
            </div>
          )}

          <div className="mt-auto pt-6 border-t border-white/20">
            <button
              onClick={() => {
                localStorage.clear();
                toast.success("Logout berhasil");
                navigate("/login");
              }}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 py-3 rounded-xl font-bold"
            >
              🚪 Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}