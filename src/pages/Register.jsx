import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
} from "../features/auth/authSlice";
import { registerWithEmailAndPassword, signInWithGoogle, signInWithFacebook } from "../utils/firebase";
import "../features/auth/auth.css";

/**
 * Register Component
 *
 * This component handles user registration with email/password, Google, or Facebook.
 * It includes form validation and animated transitions using Framer Motion.
 */
const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name) {
      errors.name = "الاسم مطلوب";
    }

    if (!formData.email) {
      errors.email = "البريد الإلكتروني مطلوب";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "البريد الإلكتروني غير صالح";
    }

    if (!formData.password) {
      errors.password = "كلمة المرور مطلوبة";
    } else if (formData.password.length < 6) {
      errors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "تأكيد كلمة المرور مطلوب";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "كلمات المرور غير متطابقة";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        dispatch(loginStart());
        const user = await registerWithEmailAndPassword(
          formData.name,
          formData.email,
          formData.password
        );
        dispatch(loginSuccess(user));
      } catch (error) {
        dispatch(loginFailure(error.message || "فشل إنشاء الحساب"));
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      dispatch(loginStart());
      const user = await signInWithGoogle();
      dispatch(loginSuccess(user));
    } catch (error) {
      dispatch(loginFailure(error.message || "فشل تسجيل الدخول باستخدام Google"));
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      dispatch(loginStart());
      const user = await signInWithFacebook();
      dispatch(loginSuccess(user));
    } catch (error) {
      dispatch(loginFailure(error.message || "فشل تسجيل الدخول باستخدام Facebook"));
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      className="register-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="card" variants={itemVariants}>
        {/* شعار الجمعية */}
        <div className="auth-logo">
          <div className="logo-container">
            <div className="logo-icon open">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div className="logo-text">
              <h1>دعوة الحق</h1>
              <p>جمعية خيرية مفتوحة</p>
            </div>
          </div>
        </div>
        
        <h2>إنشاء حساب جديد</h2>

        {authError && (
          <motion.div
            className="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {authError}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">الاسم</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={formErrors.name ? "error" : ""}
              autoComplete="name"
            />
            {formErrors.name && <div className="error-text">{formErrors.name}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="email">البريد الإلكتروني</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={formErrors.email ? "error" : ""}
              autoComplete="email"
            />
            {formErrors.email && <div className="error-text">{formErrors.email}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="password">كلمة المرور</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={formErrors.password ? "error" : ""}
              autoComplete="new-password"
            />
            {formErrors.password && <div className="error-text">{formErrors.password}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">تأكيد كلمة المرور</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={formErrors.confirmPassword ? "error" : ""}
              autoComplete="new-password"
            />
            {formErrors.confirmPassword && (
              <div className="error-text">{formErrors.confirmPassword}</div>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
          </button>
        </form>

        <div className="social-login">
          <p>أو إنشاء حساب باستخدام</p>
          <div className="social-buttons">
            <button
              type="button"
              className="btn btn-google"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              Google
            </button>
            <button
              type="button"
              className="btn btn-facebook"
              onClick={handleFacebookSignIn}
              disabled={isLoading}
            >
              Facebook
            </button>
          </div>
        </div>

        <div className="auth-footer">
          <p>
            لديك حساب بالفعل؟{" "}
            <Link to="/login">تسجيل الدخول</Link>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Register;

// Sources:
// - Framer Motion: https://www.framer.com/motion/
// - Firebase Auth: https://firebase.google.com/docs/auth

