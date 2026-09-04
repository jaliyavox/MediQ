// LOCKED FILE - every route is already wired to a page file.
// Build your page inside your own file; nobody needs to edit this one.
// If a route really must change, say so in the group chat first.
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import Clinics from './pages/Clinics';
import BookToken from './pages/BookToken';
import Pharmacies from './pages/Pharmacies';
import Doctors from './pages/Doctors';
import DoctorRegister from './pages/DoctorRegister';
import DoctorLogin from './pages/DoctorLogin';
import DoctorDashboard from './pages/DoctorDashboard';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/clinics" element={<Clinics />} />
            <Route path="/book" element={<BookToken />} />
            <Route path="/pharmacies" element={<Pharmacies />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctor/register" element={<DoctorRegister />} />
            <Route path="/doctor/login" element={<DoctorLogin />} />
            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoute>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}
