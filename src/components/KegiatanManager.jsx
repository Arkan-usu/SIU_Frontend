import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// ✅ UTILITY FORMAT TANGGAL
const formatTanggal = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const options = { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    weekday: 'short'
  };
  
  return date.toLocaleDateString('id-ID', options).replace(',', ' •');
};

const KegiatanManager = ({ ukmList, onRefresh }) => {
  const [selectedUkmId, setSelectedUkmId] = useState('');
  const [formKegiatan, setFormKegiatan] = useState({
    id: null, 
    nama: '', 
    deskripsi: '', 
    tanggal: '',
    link_wa: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormKegiatan({ ...formKegiatan, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUkmId || !formKegiatan.nama) {
      toast.error('Pilih UKM dan isi nama kegiatan!');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (isEditing && formKegiatan.id) {
        await axios.put(`/ukm/${selectedUkmId}/kegiatan/${formKegiatan.id}`, formKegiatan, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('✅ Kegiatan diperbarui');
      } else {
        await axios.post(`/ukm/${selectedUkmId}/kegiatan`, formKegiatan, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('✅ Kegiatan ditambahkan');
      }
      
      // ✅ RESET FORM
      setFormKegiatan({ id: null, nama: '', deskripsi: '', tanggal: '', link_wa: '' });
      setIsEditing(false);
      setSelectedUkmId('');
      onRefresh();
    } catch (error) {
      toast.error('Gagal simpan kegiatan');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (kegiatan, ukmId) => {
    setFormKegiatan({
      ...kegiatan,
      tanggal: kegiatan.tanggal ? kegiatan.tanggal.split('T')[0] : '' // ✅ FORMAT INPUT DATE
    });
    setSelectedUkmId(ukmId);
    setIsEditing(true);
  };

  const handleDelete = async (kegId, ukmId) => {
    if (window.confirm('Yakin hapus kegiatan?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/ukm/${ukmId}/kegiatan/${kegId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('✅ Kegiatan dihapus');
        onRefresh();
      } catch {
        toast.error('Gagal hapus kegiatan');
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* FORM KEGIATAN */}
      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-8 rounded-3xl border-2 border-orange-200">
        <h3 className="text-3xl font-bold mb-6 text-gray-800">🎯 Tambah/Edit Kegiatan</h3>
        
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
          {/* UKM SELECT */}
          <select 
            value={selectedUkmId} 
            onChange={(e) => setSelectedUkmId(e.target.value)}
            className="p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-400 text-lg"
            required
          >
            <option value="">Pilih UKM</option>
            {ukmList.map(ukm => (
              <option key={ukm.id} value={ukm.id}>{ukm.nama}</option>
            ))}
          </select>
          
          {/* NAMA KEGIATAN */}
          <input 
            name="nama" 
            placeholder="Nama Kegiatan" 
            value={formKegiatan.nama} 
            onChange={handleInputChange} 
            className="p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-400 text-lg" 
            required 
          />
          
          {/* TANGGAL */}
          <input 
            name="tanggal" 
            type="date" 
            value={formKegiatan.tanggal} 
            onChange={handleInputChange} 
            className="p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-400 text-lg" 
          />
          
          {/* WA LINK */}
          <input 
            name="link_wa" 
            placeholder="Link WA (628xxxxxxxxx)" 
            value={formKegiatan.link_wa} 
            onChange={handleInputChange}
            className="p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-400 text-lg" 
          />
          
          {/* DESKRIPSI */}
          <textarea 
            name="deskripsi" 
            placeholder="Deskripsi kegiatan" 
            value={formKegiatan.deskripsi} 
            onChange={handleInputChange} 
            className="md:col-span-2 p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-400 h-32 text-lg" 
          />
          
          {/* BUTTONS */}
          <div className="md:col-span-2 flex gap-4">
            <button 
              type="submit" 
              disabled={loading || !selectedUkmId || !formKegiatan.nama}
              className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white py-4 px-8 rounded-2xl font-bold text-xl hover:from-orange-700 hover:to-orange-800 shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Menyimpan...' : (isEditing ? '✏️ Update Kegiatan' : '➕ Tambah Kegiatan')}
            </button>
            {isEditing && (
              <button 
                type="button" 
                onClick={() => { 
                  setFormKegiatan({ id: null, nama: '', deskripsi: '', tanggal: '', link_wa: '' }); 
                  setIsEditing(false); 
                  setSelectedUkmId(''); 
                }} 
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-4 px-8 rounded-2xl font-bold hover:from-gray-600 hover:to-gray-700 shadow-xl transition-all"
              >
                ❌ Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LIST KEGIATAN - ✅ TANGGAL CANTIK */}
      <div>
        <h4 className="text-2xl font-bold mb-6 text-gray-800">📋 Daftar Kegiatan ({ukmList.reduce((sum, ukm) => sum + (ukm.kegiatan?.length || 0), 0)})</h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ukmList.map(ukm => 
            ukm.kegiatan && ukm.kegiatan.length > 0 && (
              <div key={ukm.id} className="bg-white rounded-3xl shadow-xl hover:shadow-2xl p-6 border border-gray-100 group">
                {/* UKM HEADER */}
                <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl border-l-4 border-orange-400">
                  <h5 className="font-bold text-xl text-gray-800 mb-1">{ukm.nama}</h5>
                  <p className="text-sm text-gray-600">{ukm.anggota?.length || 0} anggota</p>
                </div>
                
                {/* KEGIATAN LIST */}
                <div className="space-y-4">
                  {ukm.kegiatan.map(keg => (
                    <div key={keg.id} className="p-6 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-md border border-gray-200 transition-all group-hover:scale-[1.02]">
                      {/* KEGIATAN INFO */}
                      <div className="mb-4">
                        <h6 className="font-bold text-lg text-gray-800 line-clamp-1">{keg.nama}</h6>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1 mb-3">
                          <span>📅 {formatTanggal(keg.tanggal)}</span>
                          {keg.link_wa && (
                            <a href={`https://wa.me/${keg.link_wa}`} target="_blank" className="text-green-600 hover:text-green-700 font-semibold" rel="noopener noreferrer">
                              📱 WA
                            </a>
                          )}
                        </div>
                        <p className="text-gray-700 line-clamp-2 leading-relaxed">{keg.deskripsi}</p>
                      </div>
                      
                      {/* ACTION BUTTONS */}
                      <div className="flex gap-2 pt-4 border-t border-gray-200">
                        <button 
                          onClick={() => handleEdit(keg, ukm.id)} 
                          className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white py-2 px-4 rounded-xl text-sm font-semibold hover:from-yellow-500 hover:to-yellow-600 shadow-lg hover:shadow-xl transition-all"
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(keg.id, ukm.id)} 
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-xl text-sm font-semibold hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default KegiatanManager;
