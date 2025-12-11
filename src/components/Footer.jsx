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

          {/* Section Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-emerald-400 transition">Home</a></li>
              <li><a href="/laporan" className="text-gray-300 hover:text-emerald-400 transition">Laporan</a></li>
              <li><a href="/anggota" className="text-gray-300 hover:text-emerald-400 transition">Anggota</a></li>
              <li><a href="/kegiatan" className="text-gray-300 hover:text-emerald-400 transition">Kegiatan</a></li>
            </ul>
          </div>

          {/* Section Follow Us (Social Media) */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-emerald-400 transition text-2xl">📘</a>  {/* Facebook */}
              <a href="#" className="text-gray-300 hover:text-emerald-400 transition text-2xl">🐦</a>  {/* Twitter */}
              <a href="#" className="text-gray-300 hover:text-emerald-400 transition text-2xl">📷</a>  {/* Instagram */}
              <a href="#" className="text-gray-300 hover:text-emerald-400 transition text-2xl">💼</a>  {/* LinkedIn */}
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
