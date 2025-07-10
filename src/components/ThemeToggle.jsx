import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toggleTheme } from "../features/ui/themeSlice";
import "./ThemeToggle.css";

/**
 * ThemeToggle Component
 *
 * This component provides a toggle button to switch between light and dark themes.
 * It uses Framer Motion for smooth animations and Redux for state management.
 */
const ThemeToggle = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.ui?.theme?.mode) || "light";

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <motion.div
      className="theme-toggle"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <button
        onClick={handleToggle}
        className="theme-toggle-button"
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        <motion.div
          className="toggle-icon-container"
          animate={{ rotate: theme === "dark" ? 180 : 0 }}
          transition={{ duration: 0.5 }}
        >
          {theme === "light" ? (
            <span role="img" aria-label="Light mode">
              ☀️
            </span>
          ) : (
            <span role="img" aria-label="Dark mode">
              🌙
            </span>
          )}
        </motion.div>
      </button>
    </motion.div>
  );
};

export default ThemeToggle;

// Sources:
// - Framer Motion: https://www.framer.com/motion/
// - Dark Mode Toggle: https://css-tricks.com/a-dark-mode-toggle-with-react-and-localStorage/
