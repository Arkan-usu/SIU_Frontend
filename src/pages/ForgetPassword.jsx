import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleResetPassword = async () => {
    if (!email) {
      toast.error("Email harus diisi!");
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Format email tidak valid!");
      return;
    }

    try {
      setLoading(true);
      toast.loading("Mengirim email reset...", { id: "reset" });
      
      // ✅ REAL BACKEND API
      const response = await axios.post('/auth/forgot-password', { email });
      
      toast.success("📧 Email reset password terkirim! Cek inbox/spam.", { id: "reset" });
      
      // Clear form
      setEmail("");
      
      // Auto redirect ke login
      setTimeout(() => navigate("/login"), 2500);
      
    } catch (error) {
      toast.error(error.response?.data?.error || "Gagal kirim email reset!", { id: "reset" });
      console.error("Reset password error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer title="Lupa Password">
      <Toaster />
      
      <p className="text-center text-sm mb-6 text-white/90 leading-relaxed">
        Masukkan email Anda untuk menerima link reset password.
      </p>

      <input
        className="w-full p-3 my-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
        placeholder="Masukkan email Anda"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />

      <button
        onClick={handleResetPassword}
        disabled={loading || !email}
        className={`w-full p-3 mt-4 rounded-lg text-white font-medium transition-all duration-200 flex items-center justify-center ${
          loading || !email
            ? 'bg-gray-500 cursor-not-allowed'
            : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:scale-[1.02] shadow-md'
        }`}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Mengirim...
          </>
        ) : (
          "Kirim Reset Password"
        )}
      </button>

      <button
        onClick={() => navigate("/login")}
        disabled={loading}
        className="w-full p-3 mt-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition duration-200 disabled:opacity-50"
      >
        Kembali ke Login
      </button>

      <button
        onClick={() => navigate("/")}
        disabled={loading}
        className="w-full p-3 mt-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition duration-200 disabled:opacity-50"
      >
        Kembali ke Home
      </button>
    </FormContainer>
  );
}
