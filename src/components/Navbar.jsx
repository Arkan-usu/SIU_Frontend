import { NavLink } from "react-router-dom";

export default function Navbar({ toggleSidebar }) {
  const activeClass = " text-white shadow-lg";
  const baseClass = "px-6 py-3 bg-gradient-to-br from-emerald-300 via-emerald-500 to-emerald-700 text-black font-bold rounded-full hover:bg-green-700 shadow-md text-sm transition";

  const NavItem = ({ label, page }) => (
    <NavLink
      to={page}
      className={({ isActive }) => isActive ? `${baseClass} ${activeClass}` : baseClass} 
    >
      {label}
    </NavLink>
  );

  return (
    <div className="fixed top-0 left-0 w-full h-20 bg-gray-800 flex items-center px-6 shadow-md z-50 border-b ">
      <h2 className="text-emerald-400 text-4xl font-serif ml-6 italic">SIU</h2>
      
      <div className="flex flex-1 justify-center gap-20 font-serif italic ">
        <NavItem label="Home" page="/"/>
        <NavItem label="Laporan" page="/laporan" />
        <NavItem label="Anggota" page="/anggota" />
        <NavItem label="Kegiatan" page="/kegiatan" />
        <NavItem label="Kalender" page="/kalender" />
      </div>

      <button
        onClick={toggleSidebar}
        className="ml-auto bg-gradient-to-br from-emerald-300 via-emerald-500 to-emerald-700 w-10 h-10 rounded-full text-black text-xl flex items-center justify-center hover:bg-green-700 transition"
      >
        ☰
      </button>
    </div>
  );
}
