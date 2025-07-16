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
import { signInWithGoogle, signInWithFacebook, loginWithEmailAndPassword } from "../utils/firebase";
import "../features/auth/auth.css";

/**
 * Login Component
 *
 * This component handles user login with email/password, Google, or Facebook.
 * It includes form validation and animated transitions using Framer Motion.
 */
const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

    if (!formData.email) {
      errors.email = "البريد الإلكتروني مطلوب";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "البريد الإلكتروني غير صالح";
    }

    if (!formData.password) {
      errors.password = "كلمة المرور مطلوبة";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        dispatch(loginStart());
        const user = await loginWithEmailAndPassword(formData.email, formData.password);
        dispatch(loginSuccess(user));
      } catch (error) {
        dispatch(loginFailure(error.message || "فشل تسجيل الدخول"));
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
      className="login-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="card" variants={itemVariants}>
        <h2>تسجيل الدخول</h2>

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
              autoComplete="current-password"
            />
            {formErrors.password && <div className="error-text">{formErrors.password}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </button>
        </form>

        <div className="social-login">
          <p>أو تسجيل الدخول باستخدام</p>
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
            ليس لديك حساب؟{" "}
            <Link to="/register">إنشاء حساب جديد</Link>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Login;

// Sources:
// - Framer Motion: https://www.framer.com/motion/
// - Firebase Auth: https://firebase.google.com/docs/auth

