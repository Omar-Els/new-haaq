import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import HealthcarePage from '../features/healthcare/HealthcarePage';

// Lazy loading components
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Home = lazy(() => import('../pages/Home'));
const Initiatives = lazy(() => import('../pages/Initiatives'));
const Finance = lazy(() => import('../pages/Finance'));
const Notifications = lazy(() => import('../pages/Notifications'));
const AboutDaawa = lazy(() => import('../pages/AboutDaawa'));
const Reports = lazy(() => import('../pages/Reports'));
const Settings = lazy(() => import('../pages/Settings'));
const Volunteers = lazy(() => import('../pages/Volunteers'));
const JoinVolunteer = lazy(() => import('../pages/JoinVolunteer'));
const VolunteerThankYou = lazy(() => import('../pages/VolunteerThankYou'));
const Beneficiaries = lazy(() => import('../pages/Beneficiaries'));
const Sheets = lazy(() => import('../pages/Sheets'));
const VolunteerRegistration = lazy(() => import('../pages/VolunteerRegistration'));
const Gallery = lazy(() => import('../pages/Gallery'));
const QuranMemorization = lazy(() => import('../pages/QuranMemorization'));

// Loading fallback
const LoadingFallback = () => (
  <div className="loading-fallback">
    <h2 className="adaptive-text">جاري التحميل...</h2>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/initiatives"
          element={
            <ProtectedRoute>
              <Initiatives />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance"
          element={
            <ProtectedRoute>
              <Finance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <AboutDaawa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteers"
          element={
            <ProtectedRoute>
              <Volunteers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/beneficiaries"
          element={
            <ProtectedRoute>
              <Beneficiaries />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sheets"
          element={
            <ProtectedRoute>
              <Sheets />
            </ProtectedRoute>
          }
        />
        <Route path="/join-volunteer" element={<JoinVolunteer />} />
        <Route path="/volunteer-thank-you" element={<VolunteerThankYou />} />
        <Route
          path="/volunteer-registration"
          element={
            <ProtectedRoute>
              <VolunteerRegistration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gallery"
          element={
            <ProtectedRoute>
              <Gallery />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quran"
          element={
            <ProtectedRoute>
              <QuranMemorization />
            </ProtectedRoute>
          }
        />
        <Route path="/healthcare" element={<HealthcarePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;

