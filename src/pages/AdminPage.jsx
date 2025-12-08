import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import UkmManager from '../components/ukmManager'; 
import PendaftarTable from '../components/PendaftarTable';
import KegiatanManager from '../components/KegiatanManager';
import LaporanManager from '../components/LaporanManager';
import AnggotaManager from '../components/AnggotaManager';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('ukm');
  const [ukmList, setUkmList] = useState([]);
  const [pendaftar, setPendaftar] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ AUTO REFRESH DATA
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [pendaftarRes, ukmRes] = await Promise.all([
        axios.get('/pendaftar', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/ukm', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setPendaftar(pendaftarRes.data || []);
      setUkmList(ukmRes.data || []);
    } catch (error) {
      toast.error('Gagal memuat data admin');
      console.error('Admin data error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Toaster />
      
      {/* HEADER */}
      <div className="bg-white p-8 rounded-3xl shadow-2xl mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
          🛠️ Panel Admin SIU UKM
        </h1>
        <p className="text-xl text-gray-600">Kelola UKM, pendaftar, kegiatan, laporan, dan anggota</p>
        
        {/* STATS */}
        <div className="grid md:grid-cols-5 gap-6 mt-8">
          <div className="text-center p-6 bg-emerald-50 rounded-2xl">
            <div className="text-4xl font-bold text-emerald-600">{ukmList.length}</div>
            <div className="text-sm font-semibold text-emerald-700">UKM</div>
          </div>
          <div className="text-center p-6 bg-blue-50 rounded-2xl">
            <div className="text-4xl font-bold text-blue-600">{pendaftar.filter(p => p.status === 'pending').length}</div>
            <div className="text-sm font-semibold text-blue-700">Pending</div>
          </div>
          <div className="text-center p-6 bg-green-50 rounded-2xl">
            <div className="text-4xl font-bold text-green-600">
              {ukmList.reduce((sum, ukm) => sum + (ukm.anggota?.length || 0), 0)}
            </div>
            <div className="text-sm font-semibold text-green-700">Total Anggota</div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white rounded-3xl shadow-2xl p-1 mb-8">
        <div className="flex bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl p-1">
          {[
            { id: 'ukm', label: '🏛️ UKM', component: <UkmManager ukmList={ukmList} onRefresh={fetchAllData} /> },
            { id: 'pendaftar', label: '📋 Pendaftar', component: <PendaftarTable pendaftar={pendaftar} onRefresh={fetchAllData} /> },
            { id: 'kegiatan', label: '🎯 Kegiatan', component: <KegiatanManager ukmList={ukmList} onRefresh={fetchAllData} /> },
            { id: 'anggota', label: '👥 Anggota', component: <AnggotaManager ukmList={ukmList} onRefresh={fetchAllData} /> },
            { id: 'laporan', label: '📊 Laporan', component: <LaporanManager ukmList={ukmList} onRefresh={fetchAllData} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-xl scale-105'
                  : 'text-gray-700 hover:bg-gray-100 hover:scale-[1.02]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ACTIVE TAB CONTENT */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 min-h-[600px]">
        {activeTab === 'ukm' && <UkmManager ukmList={ukmList} onRefresh={fetchAllData} />}
        {activeTab === 'pendaftar' && <PendaftarTable pendaftar={pendaftar} onRefresh={fetchAllData} />}
        {activeTab === 'kegiatan' && <KegiatanManager ukmList={ukmList} onRefresh={fetchAllData} />}
        {activeTab === 'anggota' && <AnggotaManager ukmList={ukmList} onRefresh={fetchAllData} />}
        {activeTab === 'laporan' && <LaporanManager ukmList={ukmList} onRefresh={fetchAllData} />}
      </div>
    </div>
  );
};

export default AdminDashboard;
