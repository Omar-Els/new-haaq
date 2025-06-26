import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

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

// Loading fallback
const LoadingFallback = () => (
  <div className="loading-fallback">
    <h2>جاري التحميل...</h2>
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;

