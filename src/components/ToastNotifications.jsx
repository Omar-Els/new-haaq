import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaInfoCircle, FaExclamationTriangle, FaTimesCircle, FaTimes } from 'react-icons/fa';
import { selectAllNotifications } from '../features/notifications/notificationsSlice';
import './ToastNotifications.css';

/**
 * ToastNotifications Component
 *
 * Displays toast notifications based on the notifications in the Redux store.
 * Respects user notification settings from the settings store.
 */
const ToastNotifications = () => {
  const notifications = useSelector(selectAllNotifications);
  const [visibleToasts, setVisibleToasts] = useState([]);

  // Get notification settings from window object (set by settingsSlice)
  const getNotificationSettings = () => {
    return window.notificationSettings || {
      enabled: true,
      sound: true,
      duration: 5000, // Default 5 seconds
      email: false
    };
  };

  // Play notification sound if enabled
  const playNotificationSound = () => {
    const settings = getNotificationSettings();
    if (settings.enabled && settings.sound) {
      try {
        // Check if AudioContext is supported and user has interacted with the page
        if (window.AudioContext || window.webkitAudioContext) {
          // Create a simple beep sound only after user interaction
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();

          // Check if AudioContext is allowed to start
          if (audioContext.state === 'suspended') {
            // Don't try to play sound if AudioContext is suspended
            console.log('AudioContext is suspended, skipping sound');
            return;
          }

          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.type = 'sine';
          oscillator.frequency.value = 800;
          gainNode.gain.value = 0.1;

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.start();
          setTimeout(() => {
            oscillator.stop();
            audioContext.close(); // Clean up AudioContext
          }, 200);
        }
      } catch (error) {
        console.log('Notification sound disabled due to browser policy:', error.message);
      }
    }
  };

  // Watch for new notifications
  useEffect(() => {
    const settings = getNotificationSettings();

    // If notifications are disabled, don't show toasts
    if (!settings.enabled) {
      return;
    }

    // Check for new notifications (unread and not already in visibleToasts)
    const newNotifications = notifications.filter(
      notification =>
        !notification.read &&
        !visibleToasts.some(toast => toast.id === notification.id)
    );

    if (newNotifications.length > 0) {
      // Add new notifications to visible toasts
      setVisibleToasts(prev => {
        // Remove any existing toasts with the same notification IDs to prevent duplicates
        const filteredPrev = prev.filter(existingToast =>
          !newNotifications.some(newNotif => newNotif.id === existingToast.id)
        );

        return [
          ...filteredPrev,
          ...newNotifications.map((notification, index) => ({
            ...notification,
            toastId: `toast-${notification.id}-${Date.now()}-${index}`,
            visible: true,
            // Auto-dismiss after duration from settings
            autoDismiss: setTimeout(() => {
              dismissToast(notification.id);
            }, settings.duration)
          }))
        ];
      });

      // Play sound for the first new notification (only if user has interacted with page)
      if (newNotifications.length > 0) {
        // Add a small delay to ensure the notification is rendered first
        setTimeout(() => {
          playNotificationSound();
        }, 100);
      }
    }
  }, [notifications]);

  // Clean up timeouts when component unmounts
  useEffect(() => {
    return () => {
      visibleToasts.forEach(toast => {
        if (toast.autoDismiss) {
          clearTimeout(toast.autoDismiss);
        }
      });
    };
  }, [visibleToasts]);

  // Dismiss a toast
  const dismissToast = (id) => {
    setVisibleToasts(prev => {
      // Clear timeout for the dismissed toast
      const toastToDismiss = prev.find(toast => toast.id === id);
      if (toastToDismiss && toastToDismiss.autoDismiss) {
        clearTimeout(toastToDismiss.autoDismiss);
      }

      return prev.map(toast =>
        toast.id === id
          ? { ...toast, visible: false }
          : toast
      );
    });

    // Remove from array after animation completes
    setTimeout(() => {
      setVisibleToasts(prev => prev.filter(toast => toast.id !== id));
    }, 300);
  };

  // Get icon based on notification type
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="toast-icon success" />;
      case 'error':
        return <FaTimesCircle className="toast-icon error" />;
      case 'warning':
        return <FaExclamationTriangle className="toast-icon warning" />;
      case 'info':
      default:
        return <FaInfoCircle className="toast-icon info" />;
    }
  };

  // دالة لتحديد إذا كانت الخلفية فاتحة أم غامقة
  const isColorLight = (color) => {
    if (!color) return true;
    // إزالة # إذا موجود
    color = color.replace('#', '');
    // دعم rgb/rgba
    if (color.startsWith('rgb')) {
      const rgb = color.match(/\d+/g).map(Number);
      // صيغة: [r,g,b]
      const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
      return brightness > 150;
    }
    // hex
    if (color.length === 3) {
      color = color.split('').map(x => x + x).join('');
    }
    const r = parseInt(color.substr(0,2),16);
    const g = parseInt(color.substr(2,2),16);
    const b = parseInt(color.substr(4,2),16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 150;
  };

  // دالة لإرجاع لون النص المناسب حسب الخلفية
  const getAdaptiveTextColor = (bgColor) => {
    return isColorLight(bgColor) ? '#222' : '#fff';
  };

  return (
    <div className="toast-container">
      <AnimatePresence>
        {visibleToasts.map(toast => {
          // جلب لون الخلفية الفعلي من CSS
          let bgColor = getComputedStyle(document.documentElement).getPropertyValue('--card-bg') || '#fff';
          // إذا كان هناك نوع خاص (success, error, ...)
          if (toast.type === 'success') bgColor = getComputedStyle(document.documentElement).getPropertyValue('--success-color') || bgColor;
          if (toast.type === 'error') bgColor = getComputedStyle(document.documentElement).getPropertyValue('--error-color') || bgColor;
          if (toast.type === 'warning') bgColor = getComputedStyle(document.documentElement).getPropertyValue('--warning-color') || bgColor;
          if (toast.type === 'info') bgColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color') || bgColor;

          const adaptiveTextColor = getAdaptiveTextColor(bgColor.trim());

          return (
            <motion.div
              key={toast.toastId}
              className={`toast-notification ${toast.type || 'info'}`}
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              layout
              style={{ color: adaptiveTextColor }}
            >
              <div className="toast-content">
                {getIcon(toast.type)}
                <div className="toast-message adaptive-text">{toast.message}</div>
              </div>
              <button
                className="toast-close adaptive-text"
                onClick={() => dismissToast(toast.id)}
                aria-label="إغلاق الإشعار"
                style={{ color: adaptiveTextColor }}
              >
                <FaTimes />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastNotifications;
