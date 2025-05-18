import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import ThemeToggle from './ThemeToggle';
import { FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';
import './Navbar.css';

const MENU_STATE_KEY = 'navbar_menu_state';

/**
 * Navbar Component
 *
 * This component displays the navigation bar with links to different pages.
 * It also includes a theme toggle button and user authentication controls.
 */
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 990);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Use memoized selectors to prevent unnecessary re-renders
  const auth = useSelector(state => state.auth);
  const notifications = useSelector(state => state.notifications);

  // Derive values from state with useMemo to prevent new object creation on each render
  const isAuthenticated = useMemo(() => {
    return Boolean(auth?.user);
  }, [auth?.user]);

  const user = useMemo(() => {
    return auth?.user || null;
  }, [auth?.user]);

  const unreadNotifications = useMemo(() => {
    if (!notifications?.notifications) return [];
    return notifications.notifications.filter(n => !n.read);
  }, [notifications?.notifications]);

  // Check if dropdown is open
  const isDropdownOpen = activeDropdown !== null;

  // Load saved menu state on initial render
  useEffect(() => {
    try {
      const savedMenuState = localStorage.getItem(MENU_STATE_KEY);
      if (savedMenuState) {
        const { isOpen, activeDropdownId, timestamp } = JSON.parse(savedMenuState);

        // Only restore state if it's less than 1 hour old
        const now = Date.now();
        const stateAge = now - (timestamp || 0);
        const maxAge = 60 * 60 * 1000; // 1 hour

        if (stateAge <= maxAge) {
          setIsMenuOpen(isOpen);
          setActiveDropdown(activeDropdownId);
        }
      }
    } catch (error) {
      console.error('Error loading menu state:', error);
    }
  }, []);

  // Save menu state when it changes
  useEffect(() => {
    try {
      localStorage.setItem(MENU_STATE_KEY, JSON.stringify({
        isOpen: isMenuOpen,
        activeDropdownId: activeDropdown,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error saving menu state:', error);
    }
  }, [isMenuOpen, activeDropdown]);

  // Close menu when route changes
  useEffect(() => {
    if (isMobileView) {
      setIsMenuOpen(false);
    }
  }, [location.pathname, isMobileView]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 990);
      if (window.innerWidth >= 990) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {isMobileView && (
          <div className="menu-icon" onClick={toggleMenu}>
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </div>
        )}

        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          دعوة الحق
        </Link>

        <ul className={isMenuOpen ? "nav-menu active" : "nav-menu"}>
          {isAuthenticated ? (
            <>
              <li className="nav-item">
                <Link to="/" className="nav-link" onClick={closeMenu}>
                  الرئيسية
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/initiatives" className="nav-link" onClick={closeMenu}>
                  المبادرات
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/finance" className="nav-link" onClick={closeMenu}>
                  الماليات
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/notifications" className="nav-link" onClick={closeMenu}>
                  الإشعارات
                  {unreadNotifications.length > 0 && (
                    <span className="notification-badge">{unreadNotifications.length}</span>
                  )}
                </Link>
              </li>

              {isMobileView ? (
                <>
                  <li className="nav-item">
                    <Link to="/reports" className="nav-link" onClick={closeMenu}>
                      التقارير
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/settings" className="nav-link" onClick={closeMenu}>
                      الإعدادات
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/about" className="nav-link" onClick={closeMenu}>
                      عن دعوة الحق
                    </Link>
                  </li>
                  <li className="nav-item">
                    <button className="logout-btn" onClick={handleLogout}>
                      تسجيل الخروج
                    </button>
                  </li>
                </>
              ) : (
                <li className="nav-item dropdown">
                  <button
                    className="dropdown-toggle"
                    onClick={() => toggleDropdown('more')}
                  >
                    المزيد <FaChevronDown className={activeDropdown === 'more' ? "rotate" : ""} />
                  </button>
                  {activeDropdown === 'more' && (
                    <ul className="dropdown-menu">
                      <li>
                        <Link to="/reports" onClick={closeMenu}>
                          التقارير
                        </Link>
                      </li>
                      <li>
                        <Link to="/settings" onClick={closeMenu}>
                          الإعدادات
                        </Link>
                      </li>
                      <li>
                        <Link to="/about" onClick={closeMenu}>
                          عن دعوة الحق
                        </Link>
                      </li>
                      <li>
                        <button onClick={handleLogout}>
                          تسجيل الخروج
                        </button>
                      </li>
                    </ul>
                  )}
                </li>
              )}
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link" onClick={closeMenu}>
                  تسجيل الدخول
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link" onClick={closeMenu}>
                  إنشاء حساب
                </Link>
              </li>
            </>
          )}

          <li className="theme-toggle-container">
            <ThemeToggle />
          </li>
        </ul>

        {!isMobileView && isAuthenticated && user && (
          <div className="user-info">
            <span className="user-name">{user.displayName}</span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

// Source: Responsive Navbar with React
// https://css-tricks.com/responsive-navigation-bar-with-react/










