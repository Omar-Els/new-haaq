import { useEffect } from 'react';
import { useSelector, useDispatch, useStore } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  selectAllNotifications,
  selectNotificationsLoading,
  selectNotificationsError
} from '../features/notifications/notificationsSlice';

/**
 * Notifications Component
 *
 * This component displays notifications about missing beneficiary data
 * and errors that occur during application usage.
 */
const Notifications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const store = useStore();

  // استخدام selectors من Redux
  const notifications = useSelector(selectAllNotifications);
  const isLoading = useSelector(selectNotificationsLoading);
  const error = useSelector(selectNotificationsError);

  useEffect(() => {
    // جلب الإشعارات من Redux
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleDeleteNotification = (id) => {
    dispatch(deleteNotification(id));
  };

  const handleNotificationClick = (notification) => {
    // Mark as read first
    dispatch(markAsRead(notification.id));

    // Handle different action types
    if (notification.actionType === 'EDIT_BENEFICIARY' && notification.actionData) {
      const { beneficiaryId, missingFields } = notification.actionData;

      // Navigate to edit page with query params
      navigate(`/beneficiary/${beneficiaryId}/edit?focus=${missingFields[0]}`);
    }

    // Handle ID images notifications
    if (notification.actionType === 'EDIT_BENEFICIARY_IMAGES' && notification.actionData) {
      const { beneficiaryId, missingFields } = notification.actionData;

      // Navigate to edit page with focus on the first missing image
      navigate(`/beneficiary/${beneficiaryId}/edit?focus=${missingFields[0]}`);
    }
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';

    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'تاريخ غير صالح';
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  // Get notification description based on action data
  const getNotificationDescription = (notification) => {
    if (notification.actionType === 'EDIT_BENEFICIARY' && notification.actionData) {
      const { missingFields } = notification.actionData;

      // Check if missing fields include ID images
      if (missingFields.includes('spouseIdImage') || missingFields.includes('wifeIdImage')) {
        return 'انقر هنا لرفع صور البطاقات المطلوبة';
      }

      return 'انقر هنا لإكمال البيانات الناقصة';
    }

    // Special case for ID images notifications
    if (notification.actionType === 'EDIT_BENEFICIARY_IMAGES' && notification.actionData) {
      return 'انقر هنا لرفع صور البطاقات المطلوبة';
    }

    return '';
  };

  // Check if notification is clickable
  const isClickable = (notification) => {
    return notification.actionType && notification.actionData;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      className="notifications-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="page-header" variants={itemVariants}>
        <h1>الإشعارات</h1>
        {notifications.some(n => !n.read) && (
          <motion.button
            className="btn btn-secondary"
            onClick={handleMarkAllAsRead}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            تعليم الكل كمقروء
          </motion.button>
        )}
      </motion.div>

      {isLoading ? (
        <div className="loading-message">جاري تحميل البيانات...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <motion.div className="notifications-list" variants={containerVariants}>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <motion.div
                key={notification.id}
                className={`notification-card card ${notification.read ? 'read' : 'unread'} ${isClickable(notification) ? 'clickable' : ''}`}
                variants={itemVariants}
                whileHover={{ y: -5, boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
                onClick={() => isClickable(notification) && handleNotificationClick(notification)}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <p className="notification-message">{notification.message}</p>
                  <p className="notification-date">{formatDate(notification.timestamp)}</p>
                  {isClickable(notification) && (
                    <p className="notification-action-hint">{getNotificationDescription(notification)}</p>
                  )}
                </div>
                <div className="notification-actions">
                  {!notification.read && (
                    <motion.button
                      className="action-btn read"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      تعليم كمقروء
                    </motion.button>
                  )}
                  <motion.button
                    className="action-btn delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNotification(notification.id);
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    حذف
                  </motion.button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div className="no-results" variants={itemVariants}>
              <p>لا توجد إشعارات</p>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Notifications;





