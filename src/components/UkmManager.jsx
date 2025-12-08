import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const UkmManager = ({ ukmList, onRefresh }) => {
  const [formUkm, setFormUkm] = useState({
    id: null, nama: '', deskripsi: '', gambar: '', wa_group: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormUkm({ ...formUkm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formUkm.nama || !formUkm.deskripsi) {
      toast.error('Nama dan deskripsi wajib!');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (isEditing && formUkm.id) {
        await axios.put(`/ukm/${formUkm.id}`, formUkm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('✅ UKM diperbarui');
      } else {
        await axios.post('/ukm', formUkm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('✅ UKM ditambahkan');
      }
      
      setFormUkm({ id: null, nama: '', deskripsi: '', gambar: '', wa_group: '' });
      setIsEditing(false);
      onRefresh();
    } catch (error) {
      toast.error('Gagal simpan UKM');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ukm) => {
    setFormUkm(ukm);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin hapus UKM?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/ukm/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('✅ UKM dihapus');
        onRefresh();
      } catch {
        toast.error('Gagal hapus');
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* FORM UKM */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border-2 border-blue-200">
        <h3 className="text-3xl font-bold mb-8 text-gray-800">
          {isEditing ? '✏️ Edit UKM' : '➕ Tambah UKM Baru'}
        </h3>
        
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
          <input name="nama" placeholder="Nama UKM" value={formUkm.nama} onChange={handleInputChange}
            className="p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-400 text-lg" required />
          <input name="wa_group" placeholder="WA Group (opsional)" value={formUkm.wa_group} onChange={handleInputChange}
            className="p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-400 text-lg" />
          <textarea name="deskripsi" placeholder="Deskripsi UKM" value={formUkm.deskripsi} onChange={handleInputChange}
            className="md:col-span-2 p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-400 h-32 text-lg" required />
          <input name="gambar" type="url" placeholder="URL Gambar UKM" value={formUkm.gambar} onChange={handleInputChange}
            className="p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-400 text-lg" />
          
          <div className="md:col-span-2 space-x-4">
            <button type="submit" disabled={loading} className="flex-1 bg-emerald-600 text-white py-4 px-8 rounded-2xl font-bold text-xl hover:bg-emerald-700 shadow-xl">
              {loading ? '⏳' : (isEditing ? 'Update' : 'Tambah')}
            </button>
            {isEditing && (
              <button type="button" onClick={() => {setFormUkm({}); setIsEditing(false);}} 
                className="flex-1 bg-gray-500 text-white py-4 px-8 rounded-2xl font-bold hover:bg-gray-600">
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* UKM LIST */}
      <div>
        <h4 className="text-2xl font-bold mb-6 text-gray-800">📋 Daftar UKM ({ukmList.length})</h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ukmList.map(ukm => (
            <div key={ukm.id} className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all group">
              {ukm.gambar && (
                <img src={ukm.gambar} alt={ukm.nama} className="w-full h-48 object-cover rounded-xl mb-4 group-hover:scale-105 transition-transform" />
              )}
              <h5 className="text-xl font-bold mb-2">{ukm.nama}</h5>
              <p className="text-gray-600 mb-4 line-clamp-2">{ukm.deskripsi}</p>
              <div className="flex space-x-2">
                <button onClick={() => handleEdit(ukm)} className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-xl font-semibold hover:bg-yellow-600">
                  ✏️ Edit
                </button>
                <button onClick={() => handleDelete(ukm.id)} className="flex-1 bg-red-500 text-white py-2 px-4 rounded-xl font-semibold hover:bg-red-600">
                  🗑️ Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UkmManager;
