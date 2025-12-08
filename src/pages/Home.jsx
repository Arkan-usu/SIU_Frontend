import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { logosiu } from '../assets';

function Home() {
  const navigate = useNavigate();

  // State untuk animasi judul (tetap sama)
  const [titleIndex, setTitleIndex] = useState(1);
  const titleText = 'Selamat Datang di SIU';
  const titleChars = titleText.split('');

  // State untuk toggle item (tetap sama)
  const [showItems, setShowItems] = useState(false);

  // State untuk animasi scroll (tetap sama)
  const [isVisible, setIsVisible] = useState(false);
  const ukmSectionRef = useRef(null);

  // State untuk animasi fade-in section logo (tetap sama)
  const [logoVisible, setLogoVisible] = useState(false);

  // *** STATE BARU: Data UKM dari API ***
  const [ukmList, setUkmList] = useState([]);
  const [loadingUkm, setLoadingUkm] = useState(true);
  const [apiError, setApiError] = useState(false);

  // *** FETCH UKM DARI API (sinkron dengan pagesAdmin) ***
  useEffect(() => {
    const fetchUkm = async () => {
      try {
        setLoadingUkm(true);
        // Ganti dengan URL JSON Server Anda atau backend API
        const response = await axios.get('http://localhost:3001/ukm');
        setUkmList(response.data);
        setApiError(false);
      } catch (error) {
        console.error('Error fetching UKM:', error);
        setApiError(true);
      } finally {
        setLoadingUkm(false);
      }
    };

    fetchUkm();
  }, []);

  // useEffect untuk animasi judul (tetap sama)
  useEffect(() => {
    const interval = setInterval(() => {
      setTitleIndex((prevIndex) => {
        if (prevIndex < titleChars.length) {
          return prevIndex + 1;
        } else {
          return 1;
        }
      });
    }, 150);
    return () => clearInterval(interval);
  }, [titleChars.length]);

  // useEffect untuk animasi scroll (tetap sama)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ukmSectionRef.current) {
      observer.observe(ukmSectionRef.current);
    }

    return () => {
      if (ukmSectionRef.current) {
        observer.unobserve(ukmSectionRef.current);
      }
    };
  }, []);

  // useEffect untuk animasi fade-in section logo (tetap sama)
  useEffect(() => {
    const interval = setInterval(() => {
      setLogoVisible((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const displayedTitle = titleChars.slice(0, titleIndex).join('');

  return (
    <div>
      <div className='bg-gradient-to-br from-emerald-300 via-emerald-500 to-emerald-700 pb-10 relative overflow-hidden'>
        {/* Elemen dekoratif (tetap sama) */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-200 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-400 rounded-full opacity-15 blur-2xl animate-pulse delay-1000"></div>
        
        {/* Hero Section (tetap sama) */}
        <div className="text-center mb-12 py-16 relative z-10">
          <h1 className="text-7xl font-extrabold text-gray-800 mb-4 mt-4 drop-shadow-lg font-serif">{displayedTitle}</h1>
          <p className="text-2xl text-white mb-8 mt-8 drop-shadow-md font-serif">Platform Sistem Informasi UKM. Dapatkan informasi detail dan terbaru UKM yang anda Minati.</p>
          <button 
            className="bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-emerald-700 hover:scale-110 transition duration-200 mt-8"
            onClick={() => setShowItems(!showItems)}
          >
            About US
          </button>
        </div>

        {/* Section Fitur (tetap sama) */}
        <div className={`container mx-auto overflow-hidden transition-all duration-500 ${showItems ? 'max-h-96' : 'max-h-0'}`}>
          <div className="grid md:grid-cols-3 gap-8 mb-16 px-4">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:scale-105 hover:-translate-y-2 transition duration-200 cursor-pointer border-l-4 border-emerald-500">
              <h2 className="text-2xl font-bold text-emerald-600 mb-2">Anggota</h2>
              <p>Kelola daftar anggota UKM dengan mudah.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:scale-105 hover:-translate-y-2 transition duration-200 cursor-pointer border-l-4 border-emerald-500">
              <h2 className="text-2xl font-bold text-emerald-600 mb-2">Forum</h2>
              <p>Diskusikan ide dan berbagi informasi.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:scale-105 hover:-translate-y-2 transition duration-200 cursor-pointer border-l-4 border-emerald-500">
              <h2 className="text-2xl font-bold text-emerald-600 mb-2">Kegiatan</h2>
              <p>Lihat dan ikuti kegiatan terbaru.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Logo (tetap sama) */}
      <div className={`flex flex-col lg:flex-row min-h-screen bg-gradient-to-r from-gray-50 to-gray-100 transition-all duration-1000 ${logoVisible ? 'opacity-100 scale-100' : 'opacity-90 scale-95'}`}>
        <div className="lg:w-1/2 flex items-center justify-center p-12 bg-emerald-50 hover:bg-emerald-100 transition duration-500">
          <div className="text-center lg:text-left max-w-lg">
            <h2 className="text-5xl font-bold text-gray-800 mb-6 leading-tight drop-shadow-sm">Tentang Sistem Informasi UKM (SIU)</h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              SIU adalah platform inovatif yang dirancang untuk memfasilitasi mahasiswa dalam mengelola dan berpartisipasi di Unit Kegiatan Mahasiswa (UKM). 
              Dengan fitur-fitur seperti manajemen anggota, forum diskusi, dan pelacakan kegiatan, SIU membantu membangun komunitas yang lebih terhubung dan produktif. 
              Temukan UKM favorit Anda dan mulai berkontribusi hari ini!
            </p>
            <button className="bg-emerald-600 text-white px-8 py-4 rounded-lg shadow-lg hover:bg-emerald-700 hover:scale-110 transition duration-200 text-lg font-semibold">
              Jelajahi UKM
            </button>
          </div>
        </div>
        <div className="lg:w-1/2 relative overflow-hidden group">
          <img 
            src={logosiu} 
            alt="Logo SIU" 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
          />
          <div className="absolute inset-0 bg-emerald-500 opacity-0 group-hover:opacity-20 transition duration-500"></div>
        </div>
      </div>

      {/* *** SECTION UKM - SUDAH DISINKRON DENGAN API *** */}
      <div className="container mx-auto px-4 py-16" ref={ukmSectionRef}>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4 drop-shadow-sm">UKM yang Tersedia</h2>
          <p className="text-lg text-gray-600">Jelajahi berbagai Unit Kegiatan Mahasiswa di kampus kami.</p>
        </div>

        {/* Loading State */}
        {loadingUkm && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            <p className="mt-4 text-gray-600">Memuat daftar UKM...</p>
          </div>
        )}

        {/* Error State */}
        {apiError && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Gagal memuat data UKM. Silakan refresh halaman.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Data UKM */}
        {!loadingUkm && !apiError && (
          <div className={`grid md:grid-cols-2 lg:grid-cols-4 gap-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {ukmList.length > 0 ? ukmList.map((ukm, index) => (
              <div 
                key={ukm.id}
                className={`bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:scale-105 hover:-translate-y-2 transition duration-200 cursor-pointer border-t-4 border-emerald-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 150}ms` }}
                onClick={() => navigate(`/ukm/${ukm.id}`)}
              >
                <div className="w-full h-32 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">{ukm.nama}</span>
                </div>
                <h3 className="text-xl font-semibold text-emerald-600 mb-2">{ukm.nama}</h3>
                <p className="text-gray-700 mb-4 line-clamp-2">{ukm.deskripsi}</p>
                <div className="text-sm text-gray-600 mb-4 space-y-1">
                  <p><strong>Anggota:</strong> {ukm.anggota?.length || 0}</p>
                  <p><strong>Kegiatan:</strong> {ukm.kegiatan?.length || 0}</p>
                  <p><strong>Laporan:</strong> {ukm.laporan?.length || 0}</p>
                </div>
              </div>
            )) : (
              <p className="col-span-full text-center text-gray-600 py-12">Belum ada UKM tersedia.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
