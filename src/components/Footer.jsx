import { NavLink } from "react-router-dom"; // ✅ IMPORT INI

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Section About */}
          <div>
            <h3 className="text-xl font-bold text-emerald-400 mb-4">SIU</h3>
            <p className="text-gray-300">
              Platform Sistem Informasi UKM untuk mahasiswa. Dapatkan informasi detail dan terbaru tentang Unit Kegiatan Mahasiswa di kampus kami.
            </p>
          </div>

          {/* Section Quick Links - ✅ NAVLINK */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <NavLink 
                  to="/" 
                  className="text-gray-300 hover:text-emerald-400 transition block py-1"
                  style={({ isActive }) => ({
                    color: isActive ? '#10b981' : '#d1d5db'
                  })}
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/laporan" 
                  className="text-gray-300 hover:text-emerald-400 transition block py-1"
                  style={({ isActive }) => ({
                    color: isActive ? '#10b981' : '#d1d5db'
                  })}
                >
                  Laporan
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/anggota" 
                  className="text-gray-300 hover:text-emerald-400 transition block py-1"
                  style={({ isActive }) => ({
                    color: isActive ? '#10b981' : '#d1d5db'
                  })}
                >
                  Anggota
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/kegiatan" 
                  className="text-gray-300 hover:text-emerald-400 transition block py-1"
                  style={({ isActive }) => ({
                    color: isActive ? '#10b981' : '#d1d5db'
                  })}
                >
                  Kegiatan
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Section Follow Us - ✅ EXTERNAL LINKS */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="https://facebook.com/siuukm" target="_blank" rel="noopener noreferrer" 
                 className="text-gray-300 hover:text-emerald-400 transition text-2xl" title="Facebook">
                📘
              </a>
              <a href="https://twitter.com/siuukm" target="_blank" rel="noopener noreferrer" 
                 className="text-gray-300 hover:text-emerald-400 transition text-2xl" title="Twitter">
                🐦
              </a>
              <a href="https://instagram.com/siuukm" target="_blank" rel="noopener noreferrer" 
                 className="text-gray-300 hover:text-emerald-400 transition text-2xl" title="Instagram">
                📷
              </a>
              <a href="https://linkedin.com/company/siuukm" target="_blank" rel="noopener noreferrer" 
                 className="text-gray-300 hover:text-emerald-400 transition text-2xl" title="LinkedIn">
                💼
              </a>
            </div>
          </div>

          {/* Section Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <p className="text-gray-300 mb-2">Email: info@siu.com</p>
            <p className="text-gray-300 mb-2">Phone: +62 123 456 789</p>
            <p className="text-gray-300">Address: Kampus Universitas, Kota</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">&copy; 2025 SIU. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
