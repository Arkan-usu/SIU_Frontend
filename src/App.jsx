import { useState, createContext, useContext, useEffect } from "react";
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  useLocation, 
  useNavigate,
  Navigate 
} from "react-router-dom";
import axios from 'axios';

// ✅ AXIOS CONFIG - VERCEL PRODUCTION
axios.defaults.baseURL = import.meta.env.MODE === 'production' 
  ? 'https://siu-backend-theta.vercel.app/'
  : 'http://localhost:3001/';
axios.defaults.headers.post['Content-Type'] = 'application/json';

export const UserContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        const userData = JSON.parse(savedUser);
        setRole(userData.role || 'user');
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, token, setToken, role, setRole, loading }}>
      {children}
    </UserContext.Provider>
  );
}

// ✅ COMPONENTS
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import AuthGuard from "./components/AuthGuard"; // ✅ CRITICAL

// ✅ PAGES
import Home from "./pages/Home";
import DetailUKM from './pages/DetailUKM';
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgetPassword";
import Profile from "./pages/Profile";
import Anggota from "./pages/Anggota";
import Kegiatan from "./pages/Kegiatan";
import Laporan from "./pages/Laporan";
import AdminDashboard from "./pages/AdminPage";
import NotFound from './pages/NotFound';
import Kalender from "./pages/Kalender";

function AppContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { token, role, loading } = useContext(UserContext);

  const toggleSidebar = () => setIsSidebarOpen(v => !v);
  const fullScreen = ["/login", "/register", "/forgot-password"].includes(location.pathname);
  const handleNavigate = (page) => navigate(page);
  
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      {!fullScreen && <Navbar toggleSidebar={toggleSidebar} />}
      
      <div className={!fullScreen ? "pt-16" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ukm/:id" element={<DetailUKM />} />
          <Route path="/anggota" element={<Anggota />} />
          <Route path="/kegiatan" element={<Kegiatan />} />
          <Route path="/laporan" element={<Laporan />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/kalender" element={<Kalender />} />
          
          {/* ✅ AUTHGUARD - CLEANER */}
          <Route 
            path="/admin" 
            element={
              <AuthGuard>
                <AdminDashboard />
              </AuthGuard>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        navigate={handleNavigate} 
        onLogout={handleLogout} 
      />
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {!fullScreen && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}
