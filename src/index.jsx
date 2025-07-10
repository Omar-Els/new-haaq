import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './app/store';
import App from './App';
import './index.css';
import { fetchNotifications, addNotification } from './features/notifications/notificationsSlice';
import { fetchInitiatives } from './features/initiatives/initiativesSlice';
import { fetchBeneficiaries } from './features/beneficiaries/beneficiariesSlice';
import { fetchTransactions, calculateStats } from './features/finance/financeSlice';
import { getUserFromStorage } from './utils/firebase';
import { loginSuccess } from './features/auth/authSlice';

// معالجة أحداث تسجيل الدخول لعرض إشعارات الترحيب
const handleLoginSuccess = () => {
  // التحقق مما إذا كانت هذه هي المرة الأولى التي يقوم فيها المستخدم بتسجيل الدخول
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

  if (currentUser) {
    const userKey = `user_welcomed_${currentUser.uid}`;
    const userWelcomed = localStorage.getItem(userKey);

    if (!userWelcomed) {
      // عرض إشعار ترحيب فقط في المرة الأولى التي يقوم فيها المستخدم بتسجيل الدخول
      store.dispatch(addNotification({
        type: 'info',
        message: 'مرحبًا بك في دعوة الحق'
      }));

      // وضع علامة على أن المستخدم قد تم الترحيب به بإشعار
      localStorage.setItem(userKey, 'true');

      // حفظ الإشعارات في التخزين المحلي (للتأكد من أن الإشعار الجديد تم حفظه)
      const currentNotifications = store.getState().notifications.notifications;
      localStorage.setItem('notifications', JSON.stringify(currentNotifications));
    }
  }
};

// Suscribirse a cambios en el estado de autenticación
store.subscribe(() => {
  const state = store.getState();
  const isAuthenticated = state.auth?.user !== null;
  const wasAuthenticated = window.wasAuthenticated || false;

  // Si el usuario acaba de iniciar sesión
  if (isAuthenticated && !wasAuthenticated) {
    handleLoginSuccess();
    window.wasAuthenticated = true;
  } else if (!isAuthenticated) {
    window.wasAuthenticated = false;
  }
});

// استعادة حالة المستخدم عند تحميل التطبيق
const savedUser = getUserFromStorage();
if (savedUser) {
  console.log('Restoring user session:', savedUser.displayName);
  store.dispatch(loginSuccess(savedUser));
}

// سيتم تحميل البيانات لاحقًا في Promise.all

// Create a custom event to notify when data is loaded
const dataLoadedEvent = new CustomEvent('appDataLoaded');

// Wait for all data to be loaded
Promise.all([
  store.dispatch(fetchNotifications()),
  store.dispatch(fetchInitiatives()),
  store.dispatch(fetchBeneficiaries()),
  store.dispatch(fetchTransactions())
]).then(() => {
  // Calculate financial statistics
  store.dispatch(calculateStats());
  // Dispatch event when all data is loaded
  window.dispatchEvent(dataLoadedEvent);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);



