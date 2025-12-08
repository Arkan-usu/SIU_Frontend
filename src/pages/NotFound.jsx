// src/pages/NotFound.js
import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-300 via-emerald-500 to-emerald-700 flex items-center justify-center p-6">
      <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md w-full">
        <div className="text-8xl mb-6">😅</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Halaman Tidak Ditemukan</h1>
        <p className="text-lg text-gray-600 mb-8">Maaf, halaman yang Anda cari tidak ada.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}

export default NotFound;
