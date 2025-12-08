// src/guards/UserGuard.js
import { Navigate } from 'react-router-dom';
import { useUser } from '../data/UserContext';

const UserGuard = ({ children }) => {
  const { user } = useUser();
  const userToken = localStorage.getItem('user_token');
  
  if (!userToken && !user?.name) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default UserGuard;
