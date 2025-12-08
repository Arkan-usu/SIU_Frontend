import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../App";
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const FormContainer = ({ children, title }) => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-300 via-emerald-500 to-emerald-700 flex items-center justify-center p-6">
    <div className="bg-gray-800 p-8 rounded-xl shadow-xl max-w-sm w-full">
      <h2 className="text-center text-3xl font-bold mb-6 text-white">{title}</h2>
      {children}
    </div>
  </div>
);

export default function Register() {
  const [nama, setNama] = useState("");        // ✅ Backend field
  const [nim, setNim] = useState("");          // ✅ Backend field
  const [email, setEmail] = useState("");
  const [fakultas, setFakultas] = useState(""); // ✅ Backend field
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { setUser, setToken, setRole } = useContext(UserContext);

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleRegister = async () => {
    if (!nama || !nim || !email || !fakultas || !password || !confirmPassword) {
      toast.error("Semua field harus diisi!");
      return;
    }
    if (!isValidEmail(email)) {
      toast.error("Email tidak valid!");
      return;
    }
    if (password.length < 6) {
      toast.error("Password minimal 6 karakter!");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Password tidak cocok!");
      return;
    }

    try {
      toast.loading("Mendaftar...", { id: "register" });
      
      // ✅ REAL BACKEND API
      const response = await axios.post('/auth/register', {
        nama, nim, email, fakultas, password
      });
      
      toast.success("Registrasi berhasil! Silakan login.", { id: "register" });
      
      // Clear form
      setNama(""); setNim(""); setEmail(""); setFakultas(""); 
      setPassword(""); setConfirmPassword("");
      
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      toast.error(error.response?.data?.error || "Gagal registrasi!", { id: "register" });
      console.error("Register error:", error);
    }
  };

  return (
    <FormContainer title="Daftar Akun Baru">
      <Toaster />
      <input className="w-full p-3 my-2 rounded-lg bg-white" placeholder="Nama Lengkap" value={nama} onChange={(e) => setNama(e.target.value)} />
      <input className="w-full p-3 my-2 rounded-lg bg-white" placeholder="NIM" value={nim} onChange={(e) => setNim(e.target.value)} />
      <input className="w-full p-3 my-2 rounded-lg bg-white" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full p-3 my-2 rounded-lg bg-white" placeholder="Fakultas/Prodi" value={fakultas} onChange={(e) => setFakultas(e.target.value)} />
      <input className="w-full p-3 my-2 rounded-lg bg-white" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <input className="w-full p-3 my-2 rounded-lg bg-white" placeholder="Konfirmasi Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
      
      <button onClick={handleRegister} className="w-full p-3 mt-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
        Daftar
      </button>
      
      <button onClick={() => navigate("/login")} className="w-full p-3 mt-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500">
        Sudah Punya Akun? Login
      </button>
    </FormContainer>
  );
}
