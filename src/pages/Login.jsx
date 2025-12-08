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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setUser, setToken, setRole } = useContext(UserContext);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Email dan password harus diisi!");
      return;
    }

    try {
      toast.loading("Login...", { id: "login" });
      
      const response = await axios.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setToken(token);
      setUser(user);
      setRole(user.role);
      
      toast.success(`Login berhasil sebagai ${user.role}!`, { id: "login" });
      
      setTimeout(() => {
        if (user.role === 'admin') {
          navigate("/admin");
        } else {
          navigate("/profile");
        }
      }, 1500);
      
    } catch (error) {
      toast.error(error.response?.data?.error || "Login gagal!", { id: "login" });
    }
  };

  return (
    <FormContainer title="Masuk ke SIU">
      <Toaster />
      
      {/* EMAIL INPUT */}
      <input 
        className="w-full p-3 my-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400" 
        placeholder="Email" 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      
      {/* PASSWORD INPUT */}
      <input 
        className="w-full p-3 my-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400" 
        placeholder="Password" 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      
      {/* ✅ TOMBOL LUPA PASSWORD */}
      <div className="text-right mb-4">
        <button
          onClick={() => navigate("/forgot-password")}
          className="text-sm text-emerald-400 hover:text-emerald-300 hover:underline transition-colors duration-200 font-medium"
        >
          Lupa Password?
        </button>
      </div>
      
      {/* LOGIN BUTTON */}
      <button 
        onClick={handleLogin} 
        className="w-full p-3 mt-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
      >
        Masuk
      </button>
      
      {/* REGISTER BUTTON */}
      <button 
        onClick={() => navigate("/register")} 
        className="w-full p-3 mt-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-all duration-200"
      >
        Belum Punya Akun? Daftar
      </button>
    </FormContainer>
  );
}
