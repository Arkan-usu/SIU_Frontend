import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AnggotaManager = ({ ukmList, onRefresh }) => {
  const [selectedUkmId, setSelectedUkmId] = useState('');
  const [formAnggota, setFormAnggota] = useState({
    id: null, nama: '', nim: '', jabatan: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormAnggota({ ...formAnggota, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUkmId || !formAnggota.nama || !formAnggota.nim) {
      toast.error('Pilih UKM dan isi nama + NIM!');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (isEditing && formAnggota.id) {
        await axios.put(`/ukm/${selectedUkmId}/anggota/${formAnggota.id}`, formAnggota, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('✅ Anggota diperbarui');
      } else {
        await axios.post(`/ukm/${selectedUkmId}/anggota`, formAnggota, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('✅ Anggota ditambahkan');
      }
      
      setFormAnggota({ id: null, nama: '', nim: '', jabatan: '' });
      setIsEditing(false);
      setSelectedUkmId('');
      onRefresh();
    } catch (error) {
      toast.error('Gagal simpan anggota');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (anggota, ukmId) => {
    setFormAnggota(anggota);
    setSelectedUkmId(ukmId);
    setIsEditing(true);
  };

  const handleDelete = async (angId, ukmId) => {
    if (window.confirm('Yakin hapus anggota?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/ukm/${ukmId}/anggota/${angId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('✅ Anggota dihapus');
        onRefresh();
      } catch {
        toast.error('Gagal hapus anggota');
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* FORM ANGGOTA */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-3xl border-2 border-purple-200">
        <h3 className="text-3xl font-bold mb-6 text-gray-800">👥 Tambah/Edit Anggota</h3>
        
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
          <select 
            value={selectedUkmId} 
            onChange={(e) => setSelectedUkmId(e.target.value)}
            className="p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-400 text-lg"
            required
          >
            <option value="">Pilih UKM</option>
            {ukmList.map(ukm => (
              <option key={ukm.id} value={ukm.id}>{ukm.nama}</option>
            ))}
          </select>
          
          <input name="nama" placeholder="Nama Anggota" value={formAnggota.nama} 
            onChange={handleInputChange} className="p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-400 text-lg" required />
          
          <input name="nim" placeholder="NIM" value={formAnggota.nim} 
            onChange={handleInputChange} className="p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-400 text-lg" required />
          
          <input name="jabatan" placeholder="Jabatan (opsional)" value={formAnggota.jabatan} 
            onChange={handleInputChange} className="p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-400 text-lg" />
          
          <div className="md:col-span-2 space-x-4">
            <button type="submit" disabled={loading || !selectedUkmId} 
              className="flex-1 bg-purple-600 text-white py-4 px-8 rounded-2xl font-bold text-xl hover:bg-purple-700 shadow-xl">
              {loading ? '⏳' : (isEditing ? 'Update' : 'Tambah')}
            </button>
            {isEditing && (
              <button type="button" onClick={() => {setFormAnggota({}); setIsEditing(false); setSelectedUkmId('');}} 
                className="flex-1 bg-gray-500 text-white py-4 px-8 rounded-2xl font-bold hover:bg-gray-600">
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LIST ANGGOTA */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ukmList.map(ukm => (
          ukm.anggota && ukm.anggota.length > 0 && (
            <div key={ukm.id} className="bg-white p-6 rounded-2xl shadow-xl">
              <h4 className="text-xl font-bold mb-4 text-gray-800">{ukm.nama} ({ukm.anggota.length})</h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {ukm.anggota.map(ang => (
                  <div key={ang.id} className="p-4 bg-gray-50 rounded-xl border-l-4 border-purple-400 hover:bg-gray-100 flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{ang.nama}</div>
                      <div className="text-sm text-gray-600">{ang.nim}</div>
                      {ang.jabatan && <div className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full mt-1">{ang.jabatan}</div>}
                    </div>
                    <div className="space-x-2">
                      <button onClick={() => handleEdit(ang, ukm.id)} 
                        className="bg-yellow-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-yellow-600">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(ang.id, ukm.id)} 
                        className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-600">
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

export default AnggotaManager;
