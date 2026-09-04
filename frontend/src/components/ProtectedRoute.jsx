import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { provider, loading } = useAuth();

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (!provider) return <Navigate to="/login" replace />;
  return children;
}
