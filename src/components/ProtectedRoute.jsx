import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import { useEffect, useState } from 'react';
import './ProtectedRoute.css';

/**
 * ProtectedRoute Component
 *
 * This component is used to protect routes that require authentication.
 * If the user is not authenticated, they will be redirected to the login page.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @returns {React.ReactNode} - The protected route
 */
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [isChecking, setIsChecking] = useState(true);
  const [hasLocalUser, setHasLocalUser] = useState(false);

  // التحقق من وجود مستخدم في التخزين المحلي
  useEffect(() => {
    try {
      const userJSON = localStorage.getItem('currentUser');
      if (userJSON) {
        const user = JSON.parse(userJSON);
        if (user && user.uid) {
          setHasLocalUser(true);
        }
      }
    } catch (error) {
      console.error('Error checking local storage for user:', error);
    }
    setIsChecking(false);
  }, []);

  // انتظار التحقق من التخزين المحلي
  if (isChecking) {
    return <div className="loading-container">جاري التحميل...</div>;
  }

  // إذا كان المستخدم غير مسجل الدخول ولا يوجد مستخدم في التخزين المحلي
  if (!isAuthenticated && !hasLocalUser) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

// Source: React Router v6 documentation
// https://reactrouter.com/docs/en/v6/examples/auth

