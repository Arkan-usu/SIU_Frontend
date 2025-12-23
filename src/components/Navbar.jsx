import { NavLink } from "react-router-dom";

export default function Navbar({ toggleSidebar }) {
  const baseClass =
    "text-gray-300 text-lg font-serif italic transition duration-200 hover:text-emerald-400";

  const activeClass =
    "text-emerald-400 border-b-2 border-emerald-400";

  const NavItem = ({ label, page }) => (
    <NavLink
      to={page}
      className={({ isActive }) =>
        isActive
          ? `${baseClass} ${activeClass}`
          : baseClass
      }
    >
      {label}
    </NavLink>
  );

  return (
    <div className="fixed top-0 left-0 w-full h-20 bg-gray-800 flex items-center px-6 shadow-md z-50 border-b border-gray-700">
      
      {/* LOGO */}
      <h2 className="text-emerald-400 text-4xl font-serif italic ml-6">
        SIU
      </h2>

      {/* MENU */}
      <div className="flex flex-1 justify-center gap-16">
        <NavItem label="Home" page="/" />
        <NavItem label="Laporan" page="/laporan" />
        <NavItem label="Anggota" page="/anggota" />
        <NavItem label="Kegiatan" page="/kegiatan" />
        <NavItem label="Kalender" page="/kalender" />
      </div>

      {/* SIDEBAR BUTTON (tetap tombol) */}
      <button
        onClick={toggleSidebar}
        className="ml-auto w-10 h-10 rounded-full text-emerald-400 text-2xl
                   flex items-center justify-center hover:bg-gray-700 transition"
      >
        ☰
      </button>
    </div>
  );
}
