import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { selectTheme } from './features/ui/themeSlice';
import { selectIsAuthenticated, loginSuccess } from './features/auth/authSlice';
import { fetchBeneficiaries } from './features/beneficiaries/beneficiariesSlice';
import { fetchTransactions } from './features/finance/financeSlice';
import { saveAppState, loadAppState } from './utils/stateManager';
import { setupScrollManager, restoreScrollPosition } from './utils/scrollManager';
import { StorageManager } from './utils/storageManager';
import { getUserFromStorage } from './utils/firebase';
import { store } from './app/store';
import Navbar from './components/Navbar';
import FloatingActionButton from './components/FloatingActionButton';
import ScrollToTop from './components/ScrollToTop';
import ToastNotifications from './components/ToastNotifications';
import AppRoutes from './routes';
import './App.css';

function App() {
  const theme = useSelector(selectTheme);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Apply theme class to body
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [theme]);

  // Save current app state when location changes
  useEffect(() => {
    saveAppState({
      currentPath: location.pathname,
      searchParams: location.search,
      timestamp: Date.now()
    });
  }, [location]);

  // Load saved state on initial render
  useEffect(() => {
    const savedState = loadAppState();

    // If there's a saved path and we're on the root path, navigate to the saved path
    if (savedState && savedState.currentPath && location.pathname === '/') {
      navigate(savedState.currentPath + (savedState.searchParams || ''), { replace: true });
    }
  }, [navigate, location.pathname]);

  // التأكد من استمرار جلسة المستخدم
  useEffect(() => {
    // إذا لم يكن المستخدم مسجل الدخول، حاول استعادة الجلسة
    if (!isAuthenticated) {
      const savedUser = getUserFromStorage();
      if (savedUser) {
        console.log('Restoring user session in App component');
        dispatch(loginSuccess(savedUser));
      }
    }
  }, [isAuthenticated, dispatch]);

  // تحميل البيانات من localStorage عند بدء التطبيق
  useEffect(() => {
    console.log('Loading data from localStorage...');

    // فحص ومراقبة مساحة التخزين
    console.log('🚀 بدء مراقبة مساحة التخزين...');
    StorageManager.displayStorageInfo();
    StorageManager.startStorageMonitoring();

    // تحميل بيانات المستفيدين
    dispatch(fetchBeneficiaries()).then((result) => {
      if (result.type === 'beneficiaries/fetchBeneficiaries/fulfilled') {
        console.log('Beneficiaries loaded:', result.payload.length, 'items');
      }
    });

    // تحميل بيانات المعاملات المالية
    dispatch(fetchTransactions()).then((result) => {
      if (result.type === 'finance/fetchTransactions/fulfilled') {
        console.log('Transactions loaded:', result.payload.length, 'items');
      }
    });
  }, [dispatch]);

  // Setup scroll position management
  useEffect(() => {
    // إعداد مدير التمرير
    const cleanup = setupScrollManager();

    // استعادة موضع التمرير عند تغيير المسار
    const handleRouteChange = () => {
      // استخدم setTimeout لضمان تحميل المحتوى الجديد قبل استعادة موضع التمرير
      setTimeout(() => {
        restoreScrollPosition();
      }, 100);
    };

    // إضافة مستمع لتغييرات المسار
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      cleanup();
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // State to track if FAB is active (for positioning ScrollToTop button)
  const [isFabActive, setIsFabActive] = useState(false);

  // Update FAB state when authentication changes
  useEffect(() => {
    setIsFabActive(isAuthenticated);
  }, [isAuthenticated]);

  // Add scroll-to-top functionality to the window object for global access
  useEffect(() => {
    window.scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };
  }, []);

  // Setup settings listeners
  useEffect(() => {
    // Initialize notification settings
    if (typeof window !== 'undefined') {
      window.notificationSettings = {
        enabled: true,
        sound: true,
        duration: 5000,
        email: false
      };
    }

    // Listen for settings changed events
    const handleSettingsChanged = (event) => {
      console.log('Settings changed:', event.detail);

      // Apply any additional app-wide changes based on settings
      const settings = event.detail;

      // Example: Apply theme change immediately
      if (settings.appearance && settings.appearance.theme) {
        document.body.className = settings.appearance.theme === 'dark' ? 'dark-theme' : '';
      }
    };

    window.addEventListener('settingsChanged', handleSettingsChanged);

    // Listen for auto save events
    const handleAutoSave = () => {
      console.log('Auto save triggered in App component');
      // Save app state
      saveAppState({
        currentPath: location.pathname,
        searchParams: location.search,
        timestamp: Date.now()
      });
    };

    window.addEventListener('autoSave', handleAutoSave);

    return () => {
      window.removeEventListener('settingsChanged', handleSettingsChanged);
      window.removeEventListener('autoSave', handleAutoSave);
    };
  }, []);

  // تأكد من ظهور زر التوب أب في الشاشات الصغيرة
  useEffect(() => {
    // إضافة فئة CSS للجسم للتعامل مع الشاشات الصغيرة
    if (window.innerWidth <= 768) {
      document.body.classList.add('mobile-view');
    }

    const handleResize = () => {
      if (window.innerWidth <= 768) {
        document.body.classList.add('mobile-view');
      } else {
        document.body.classList.remove('mobile-view');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={`app ${theme === 'dark' ? 'dark-theme' : ''} ${isFabActive ? 'fab-active' : ''}`}>
      <Navbar />
      <main className="main-content">
        <AppRoutes />
      </main>
      <ScrollToTop scrollThreshold={300} />
      {/* إزالة الشرط لضمان ظهور الزر دائمًا للاختبار */}
      <FloatingActionButton />
      <ToastNotifications />
    </div>
  );
}

export default App;




