import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const KegiatanManager = ({ ukmList, onRefresh }) => {
  const [selectedUkmId, setSelectedUkmId] = useState('');
  const [formKegiatan, setFormKegiatan] = useState({
    id: null, nama: '', deskripsi: '', tanggal: ''
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
      
      setFormKegiatan({ id: null, nama: '', deskripsi: '', tanggal: '' });
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
    setFormKegiatan(kegiatan);
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
          
          <input name="nama" placeholder="Nama Kegiatan" value={formKegiatan.nama} 
            onChange={handleInputChange} className="p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-400 text-lg" required />
          
          <input name="tanggal" type="date" placeholder="Tanggal" value={formKegiatan.tanggal} 
            onChange={handleInputChange} className="p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-400 text-lg" />
          
          <textarea name="deskripsi" placeholder="Deskripsi kegiatan" value={formKegiatan.deskripsi} 
            onChange={handleInputChange} className="md:col-span-2 p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-400 h-24 text-lg" />
          
          <div className="md:col-span-2 space-x-4">
            <button type="submit" disabled={loading || !selectedUkmId} 
              className="flex-1 bg-orange-600 text-white py-4 px-8 rounded-2xl font-bold text-xl hover:bg-orange-700 shadow-xl">
              {loading ? '⏳' : (isEditing ? 'Update' : 'Tambah')}
            </button>
            {isEditing && (
              <button type="button" onClick={() => {setFormKegiatan({}); setIsEditing(false); setSelectedUkmId('');}} 
                className="flex-1 bg-gray-500 text-white py-4 px-8 rounded-2xl font-bold hover:bg-gray-600">
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LIST KEGIATAN */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ukmList.map(ukm => (
          ukm.kegiatan && ukm.kegiatan.length > 0 && (
            <div key={ukm.id} className="bg-white p-6 rounded-2xl shadow-xl">
              <h4 className="text-xl font-bold mb-4 text-gray-800">{ukm.nama}</h4>
              <div className="space-y-3">
                {ukm.kegiatan.map(keg => (
                  <div key={keg.id} className="p-4 bg-gray-50 rounded-xl border-l-4 border-orange-400 hover:bg-gray-100">
                    <div className="font-semibold text-lg mb-1">{keg.nama}</div>
                    <div className="text-sm text-gray-600 mb-2">{keg.tanggal}</div>
                    <p className="text-sm text-gray-700 line-clamp-2">{keg.deskripsi}</p>
                    <div className="flex space-x-2 mt-3 pt-3 border-t">
                      <button onClick={() => handleEdit(keg, ukm.id)} 
                        className="flex-1 bg-yellow-500 text-white py-1 px-3 rounded-lg text-sm font-semibold hover:bg-yellow-600">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(keg.id, ukm.id)} 
                        className="flex-1 bg-red-500 text-white py-1 px-3 rounded-lg text-sm font-semibold hover:bg-red-600">
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default KegiatanManager;
