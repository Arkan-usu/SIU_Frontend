import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserContext } from "../App";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const days = ["Ming", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function Kalender() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [kegiatan, setKegiatan] = useState([]);
  const [kegiatanData, setKegiatanData] = useState([]);
  const [loading, setLoading] = useState(true);

  const { token, loading: authLoading } = useContext(UserContext);
  const navigate = useNavigate();

  // 🔒 CEK LOGIN
  useEffect(() => {
    if (!authLoading && !token) {
      toast.error("Login diperlukan untuk melihat kalender!");
      navigate("/login");
    }
  }, [token, authLoading, navigate]);

  // 📡 FETCH KEGIATAN
  useEffect(() => {
    if (!token) return;

    const fetchKegiatan = async () => {
      try {
        const res = await axios.get("/ukm", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const events = res.data.flatMap((ukm) =>
          ukm.kegiatan.map((k) => ({
            ...k,
            ukm_nama: ukm.nama,
            tanggal: k.tanggal?.split("T")[0]
          }))
        );

        setKegiatanData(events);
      } catch {
        toast.error("Gagal memuat kegiatan");
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

  const isPastDate = (date) => {
    if (!date) return false;
    const check = new Date(year, month, date);
    check.setHours(0, 0, 0, 0);
    return check < today;
  };

  const handleDateClick = (day) => {
    if (!day) return;

    const fullDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const events = kegiatanData.filter((k) => k.tanggal === fullDate);

    setSelectedDate(fullDate);
    setKegiatan(events);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-gray-600">
        <div className="animate-spin h-10 w-10 border-b-2 border-emerald-600 rounded-full mr-4"></div>
        Memuat kalender...
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex justify-center py-12 px-4">

        {/* 📅 KALENDER */}
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-8 border border-emerald-100">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl shadow hover:scale-105 transition"
            >
              ←
            </button>

            <h2 className="text-3xl font-bold text-emerald-700">
              {currentDate.toLocaleString("id-ID", { month: "long", year: "numeric" })}
            </h2>

            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl shadow hover:scale-105 transition"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 text-center font-semibold text-gray-700 mb-4">
            {days.map((d) => <div key={d}>{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-3">
            {dates.map((date, i) => {
              const fullDate =
                date &&
                `${year}-${String(month + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;

              const hasEvent = kegiatanData.some((k) => k.tanggal === fullDate);
              const isPast = isPastDate(date);
              const isToday =
                date &&
                date === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();

              return (
                <div
                  key={i}
                  onClick={() => {
                    if (!date) return;
                    if (isPast && !hasEvent) return;
                    handleDateClick(date);
                  }}
                  className={`relative h-20 flex items-center justify-center rounded-2xl text-lg font-semibold transition-all
                    ${
                      !date
                        ? "bg-transparent"
                        : isPast && !hasEvent
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : isPast && hasEvent
                        ? "bg-blue-200 text-blue-800 hover:bg-blue-300 cursor-pointer"
                        : isToday
                        ? "bg-emerald-600 text-white shadow-xl scale-105"
                        : hasEvent
                        ? "bg-orange-100 hover:bg-orange-200 cursor-pointer"
                        : "bg-gray-50 hover:bg-emerald-100 cursor-pointer"
                    }
                  `}
                >
                  {date}
                </div>
              );
            })}
          </div>
        </div>

        {/* 📌 PANEL KEGIATAN */}
        {selectedDate && (
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl border-l z-50 animate-slide">
            <div className="p-5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">{selectedDate}</h3>
              <button onClick={() => setSelectedDate(null)}>✕</button>
            </div>

            <div className="p-5 overflow-y-auto h-full">
              {kegiatan.length === 0 ? (
                <p className="text-center text-gray-500 italic">Tidak ada kegiatan</p>
              ) : (
                <ul className="space-y-4">
                  {kegiatan.map((k, i) => (
                    <li
                      key={i}
                      className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 shadow"
                    >
                      <p className="font-bold text-emerald-800">{k.nama}</p>
                      <p className="text-sm italic text-gray-600">UKM: {k.ukm_nama}</p>
                      {k.deskripsi && <p className="text-sm mt-2">{k.deskripsi}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <style>{`
          .animate-slide {
            animation: slideIn 0.3s ease-out;
          }
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>
      </div>
    </>
  );
}

export default Kalender;
