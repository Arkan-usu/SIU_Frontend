import React, { useState, useEffect, useContext } from "react";
import axios from 'axios';
import { UserContext } from '../App'; // Sesuaikan path
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const days = ["Ming", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function Kalender() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [kegiatan, setKegiatan] = useState([]);
  const [kegiatanData, setKegiatanData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ AUTH CONTEXT
  const { token, user, loading: authLoading } = useContext(UserContext);
  const navigate = useNavigate();

  // ✅ CHECK LOGIN STATUS
  useEffect(() => {
    if (!authLoading && !token) {
      toast.error('Login diperlukan untuk melihat kalender kegiatan!');
      navigate('/login');
    }
  }, [token, authLoading, navigate]);

  // ✔ FETCH KEGIATAN DARI BACKEND (SAMA)
  useEffect(() => {
    if (!token) return; // Skip jika belum login

    const fetchKegiatan = async () => {
      try {
        const res = await axios.get("/ukm", {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Gabungkan kegiatan dari semua UKM
        const allEvents = res.data.flatMap((ukm) =>
          ukm.kegiatan.map((k) => ({
            ...k,
            ukm_nama: ukm.nama,
            tanggal: k.tanggal?.split("T")[0] // ✔ FIX format tanggal
          }))
        );

        setKegiatanData(allEvents);
      } catch (err) {
        console.error("Gagal fetch kegiatan:", err);
        toast.error('Gagal memuat kegiatan');
      } finally {
        setLoading(false);
      }
    };

    fetchKegiatan();
  }, [token]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const dates = [];
  for (let i = 0; i < firstDay; i++) dates.push(null);
  for (let i = 1; i <= totalDays; i++) dates.push(i);

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  // ✔ KLIK TANGGAL → TAMPILKAN KEGIATAN HARI ITU (SAMA)
  const handleDateClick = (day) => {
    if (!day) return;

    const m = (month + 1).toString().padStart(2, "0");
    const d = day.toString().padStart(2, "0");
    const fullDate = `${year}-${m}-${d}`;

    setSelectedDate(fullDate);

    // Filter kegiatan pada hari itu
    const eventToday = kegiatanData.filter((k) => k.tanggal === fullDate);

    setKegiatan(eventToday);
  };

  const closePanel = () => {
    setSelectedDate(null);
    setKegiatan([]);
  };

  // ✅ LOADING AUTH + DATA
  if (authLoading || loading) {
    return (
      <div className="w-full text-center py-10 text-xl font-semibold text-gray-600 flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mr-4"></div>
        Memuat kalender...
      </div>
    );
  }

  // ✅ NO TOKEN → SHOW LOGIN PROMPT (TETAP DI HALAMAN)
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center py-12 px-4">
        <Toaster />
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-12 text-center border border-emerald-200">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-4">🔐 Login Diperlukan</h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Login untuk melihat jadwal kegiatan UKM lengkap.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 px-8 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl hover:from-emerald-700 hover:to-emerald-800 transform hover:-translate-y-1 transition-all duration-200"
            >
              🚀 Masuk Sekarang
            </button>
            
            <button
              onClick={() => navigate('/register')}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-8 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl hover:from-blue-600 hover:to-blue-700 transform hover:-translate-y-1 transition-all duration-200"
            >
              📝 Belum Punya Akun?
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mt-8">
            Atau <button onClick={() => navigate('/')} className="text-emerald-600 hover:underline font-semibold">kembali ke Home</button>
          </p>
        </div>
      </div>
    );
  }

  // ✅ KALENDER NORMAL (SAMA PERSIS)
  return (
    <>
      <Toaster />
      <div className="relative min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex justify-center items-start py-12 px-4">

        {/* KONTEN KALENDER - IDENTIK */}
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 border border-emerald-100">

          <div className="flex justify-between items-center mb-8">
            <button
              onClick={prevMonth}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl shadow hover:shadow-lg transition-all"
            >
              ←
            </button>

            <h2 className="text-3xl font-serif italic text-emerald-600">
              {currentDate.toLocaleString("id-ID", { month: "long", year: "numeric" })}
            </h2>

            <button
              onClick={nextMonth}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl shadow hover:shadow-lg transition-all"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 text-center font-semibold text-gray-700 mb-4">
            {days.map((d) => (
              <div key={d} className="py-2 text-sm">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-3">
            {dates.map((date, i) => {
              const isToday =
                date &&
                date === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();

              // ✔ FIX: cek kegiatan (format sudah sama)
              const fullDate =
                date &&
                `${year}-${String(month + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;

              const hasEvent = kegiatanData.some((k) => k.tanggal === fullDate);

              return (
                <div
                  key={i}
                  onClick={() => handleDateClick(date)}
                  className={`relative h-20 flex items-center justify-center rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.02]
                    ${
                      date
                        ? isToday
                          ? "bg-emerald-600 text-white font-bold shadow-lg"
                          : hasEvent
                          ? "bg-orange-100 border-orange-300 hover:bg-orange-200 font-semibold"
                          : "bg-gray-50 hover:bg-emerald-100 border-emerald-200"
                        : "bg-transparent border-none cursor-default"
                    }
                  `}
                >
                  {date || ""}

                  {/* ✔ INDICATOR DOT */}
                  {hasEvent && (
                    <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-red-500 shadow-md border-2 border-white"></span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* PANEL KEGIATAN - IDENTIK */}
        {selectedDate && (
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl border-l border-emerald-200 z-50 animate-slideLeft">
            <div className="p-5 border-b bg-gradient-to-r from-emerald-600 to-emerald-700 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">
                Kegiatan<br />
                <span className="text-sm opacity-90">{selectedDate}</span>
              </h2>

              <button
                onClick={closePanel}
                className="text-white text-xl hover:scale-110 transition-all duration-200"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto h-full">
              {kegiatan.length === 0 ? (
                <p className="text-gray-500 italic text-center py-8">Tidak ada kegiatan.</p>
              ) : (
                <ul className="space-y-4">
                  {kegiatan.map((k, idx) => (
                    <li
                      key={idx}
                      className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <p className="font-bold text-lg text-emerald-800 mb-1">{k.nama}</p>
                      <p className="text-sm text-gray-600 italic mb-2">UKM: {k.ukm_nama}</p>

                      {k.deskripsi && (
                        <p className="text-sm text-gray-700 mb-3 leading-relaxed">{k.deskripsi}</p>
                      )}

                      {k.link_wa && (
                        <a
                          href={`https://wa.me/${k.link_wa.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 shadow-md transition-all duration-200"
                        >
                          📱 Join WA Group
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ANIMASI PANEL */}
        <style>{`
          @keyframes slideLeft {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          .animate-slideLeft {
            animation: slideLeft 0.3s ease-out;
          }
        `}</style>
      </div>
    </>
  );
}

export default Kalender;
