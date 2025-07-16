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

  return (
    <div className="toast-container">
      <AnimatePresence>
        {visibleToasts.map(toast => (
          <motion.div
            key={toast.toastId}
            className={`toast-notification ${toast.type || 'info'}`}
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            layout
          >
            <div className="toast-content">
              {getIcon(toast.type)}
              <div className="toast-message">{toast.message}</div>
            </div>
            <button
              className="toast-close"
              onClick={() => dismissToast(toast.id)}
              aria-label="إغلاق الإشعار"
            >
              <FaTimes />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastNotifications;
