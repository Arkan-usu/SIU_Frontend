// components/AuthGuard.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../App'; // ✅ Path benar

const AuthGuard = ({ children }) => {
  const location = useLocation();
  const { token, role } = useContext(UserContext);
  
  if (!token || role !== 'admin') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

export default AuthGuard;
