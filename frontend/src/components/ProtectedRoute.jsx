// OWNER: Member A
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { doctor, loading } = useAuth();

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!doctor) return <Navigate to="/doctor/login" replace />;
  return children;
}
