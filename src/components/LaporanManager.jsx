import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const LaporanManager = ({ ukmList, onRefresh }) => {
  const [selectedUkmId, setSelectedUkmId] = useState('');
  const [formLaporan, setFormLaporan] = useState({
    id: null, kegiatan: '', peserta: '', biaya: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormLaporan({ ...formLaporan, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUkmId || !formLaporan.kegiatan || !formLaporan.peserta) {
      toast.error('Pilih UKM dan isi kegiatan + peserta!');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (isEditing && formLaporan.id) {
        await axios.put(`/ukm/${selectedUkmId}/laporan/${formLaporan.id}`, formLaporan, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('✅ Laporan diperbarui');
      } else {
        await axios.post(`/ukm/${selectedUkmId}/laporan`, formLaporan, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('✅ Laporan ditambahkan');
      }
      
      setFormLaporan({ id: null, kegiatan: '', peserta: '', biaya: '' });
      setIsEditing(false);
      setSelectedUkmId('');
      onRefresh();
    } catch (error) {
      toast.error('Gagal simpan laporan');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (laporan, ukmId) => {
    setFormLaporan(laporan);
    setSelectedUkmId(ukmId);
    setIsEditing(true);
  };

  const handleDelete = async (lapId, ukmId) => {
    if (window.confirm('Yakin hapus laporan?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/ukm/${ukmId}/laporan/${lapId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('✅ Laporan dihapus');
        onRefresh();
      } catch {
        toast.error('Gagal hapus laporan');
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* FORM LAPORAN */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-3xl border-2 border-indigo-200">
        <h3 className="text-3xl font-bold mb-6 text-gray-800">📊 Tambah/Edit Laporan</h3>
        
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
          <select 
            value={selectedUkmId} 
            onChange={(e) => setSelectedUkmId(e.target.value)}
            className="p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-400 text-lg"
            required
          >
            <option value="">Pilih UKM</option>
            {ukmList.map(ukm => (
              <option key={ukm.id} value={ukm.id}>{ukm.nama}</option>
            ))}
          </select>
          
          <input name="kegiatan" placeholder="Nama Kegiatan" value={formLaporan.kegiatan} 
            onChange={handleInputChange} className="p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-400 text-lg" required />
          
          <input name="peserta" type="number" placeholder="Jumlah Peserta" value={formLaporan.peserta} 
            onChange={handleInputChange} className="p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-400 text-lg" required />
          
          <input name="biaya" type="number" placeholder="Biaya (Rp)" value={formLaporan.biaya} 
            onChange={handleInputChange} className="p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-400 text-lg" />
          
          <div className="md:col-span-2 space-x-4">
            <button type="submit" disabled={loading || !selectedUkmId} 
              className="flex-1 bg-indigo-600 text-white py-4 px-8 rounded-2xl font-bold text-xl hover:bg-indigo-700 shadow-xl">
              {loading ? '⏳' : (isEditing ? 'Update' : 'Tambah')}
            </button>
            {isEditing && (
              <button type="button" onClick={() => {setFormLaporan({}); setIsEditing(false); setSelectedUkmId('');}} 
                className="flex-1 bg-gray-500 text-white py-4 px-8 rounded-2xl font-bold hover:bg-gray-600">
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LIST LAPORAN */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ukmList.map(ukm => (
          ukm.laporan && ukm.laporan.length > 0 && (
            <div key={ukm.id} className="bg-white p-6 rounded-2xl shadow-xl">
              <h4 className="text-xl font-bold mb-4 text-gray-800">{ukm.nama} ({ukm.laporan.length})</h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {ukm.laporan.map(lap => (
                  <div key={lap.id} className="p-4 bg-gray-50 rounded-xl border-l-4 border-indigo-400 hover:bg-gray-100 flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{lap.kegiatan}</div>
                      <div className="text-sm text-gray-600">Peserta: {lap.peserta}</div>
                      {lap.biaya && <div className="text-sm text-green-600 font-semibold">Rp {lap.biaya.toLocaleString()}</div>}
                    </div>
                    <div className="space-x-2">
                      <button onClick={() => handleEdit(lap, ukm.id)} 
                        className="bg-yellow-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-yellow-600">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(lap.id, ukm.id)} 
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

export default LaporanManager;
