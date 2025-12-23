import { useLocation } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../App";

export default function Sidebar({ isOpen, onClose, navigate, onLogout }) {
  const location = useLocation();
  const { role } = useContext(UserContext);

  const MenuItem = ({ label, page }) => (
    <button
      onClick={() => {
        navigate(page);
        onClose();
      }}
      className={`w-full p-3 my-2 rounded-lg font-semibold transition ${
        location.pathname === page
          ? "bg-gray-200 text-black"
          : "bg-white text-black hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div
      className={`fixed top-0 right-0 h-full w-64
      bg-gradient-to-br from-emerald-300 via-emerald-500 to-emerald-700
      p-6 shadow-xl z-40 transition-transform duration-300 flex flex-col

      overflow-y-auto md:overflow-visible overscroll-contain

      ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      {/* HEADER */}
      <h3 className="sticky top-0 bg-emerald-600 text-center text-lg font-bold mb-6 py-2 z-10">
        Menu
      </h3>

      {/* MENU NAVBAR — HANYA MUNCUL DI SIDEBAR SAAT HP */}
      <div className="md:hidden">
        <MenuItem label="Home" page="/" />
        <MenuItem label="Laporan" page="/laporan" />
        <MenuItem label="Anggota" page="/anggota" />
        <MenuItem label="Kegiatan" page="/kegiatan" />
        <MenuItem label="Kalender" page="/kalender" />
        <hr className="my-4 border-black/30" />
      </div>

      {/* MENU SIDEBAR — SEMUA DEVICE */}
      <MenuItem label="Profil" page="/profile" />
      <MenuItem label="Pengaturan" page="/settings" />

      {role === "admin" && (
        <MenuItem label="Panel Admin" page="/admin" />
      )}

      {/* AUTH BUTTONS */}
      <div className="mt-auto text-black">
        <button
          onClick={() => {
            navigate("/login");
            onClose();
          }}
          className="w-full p-3 bg-gray-800 my-2 rounded-lg font-bold hover:bg-gray-400 transition text-white"
        >
          Login
        </button>

        <button
          onClick={() => {
            navigate("/register");
            onClose();
          }}
          className="w-full p-3 bg-gray-800 my-2 rounded-lg font-bold hover:bg-gray-400 transition text-white"
        >
          Register
        </button>

        <button
          onClick={() => {
            onLogout();
            onClose();
          }}
          className="w-full p-3 bg-gray-800 my-2 rounded-lg font-bold hover:bg-gray-400 transition text-white"
        >
          Logout
        </button>
      </div>
    </div>
  );
}