import { createSlice } from '@reduxjs/toolkit';

// Helper function to generate unique IDs
let notificationCounter = 0;
const generateUniqueId = () => {
  notificationCounter += 1;
  return `notification-${Date.now()}-${notificationCounter}-${Math.random().toString(36).substr(2, 9)}`;
};

// Helper functions for localStorage
const getNotificationsFromStorage = () => {
  try {
    const notifications = localStorage.getItem('notifications');
    if (notifications) {
      return JSON.parse(notifications);
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error getting notifications from storage:', error);
    return [];
  }
};

const saveNotificationsToStorage = (notifications) => {
  try {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  } catch (error) {
    console.error('Error saving notifications to storage:', error);
  }
};

// استرجاع الإشعارات من التخزين المحلي عند بدء التطبيق
const savedNotifications = getNotificationsFromStorage();

// Initial state with notifications from localStorage
const initialState = {
  notifications: savedNotifications,
  isLoading: false,
  error: null
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    fetchNotificationsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchNotificationsSuccess: (state, action) => {
      state.isLoading = false;
      state.notifications = action.payload;
    },
    fetchNotificationsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    addNotification: (state, action) => {
      // Check notification settings
      const notificationSettings = window.notificationSettings || {
        enabled: true
      };

      // Create the notification with unique ID
      const newNotification = {
        id: generateUniqueId(),
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload
      };

      // Only add notification if notifications are enabled
      if (notificationSettings.enabled) {
        state.notifications.unshift(newNotification);

        // حفظ الإشعارات في التخزين المحلي
        saveNotificationsToStorage(state.notifications);

        // If email notifications are enabled and it's an important notification
        if (notificationSettings.email &&
            (newNotification.type === 'error' || newNotification.important)) {
          // This would be where you'd send an email notification
          // For now, just log it
          console.log('Would send email notification:', newNotification);
        }
      } else {
        console.log('Notification suppressed due to user settings:', newNotification);
      }
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
        // حفظ الإشعارات في التخزين المحلي
        saveNotificationsToStorage(state.notifications);
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      // حفظ الإشعارات في التخزين المحلي
      saveNotificationsToStorage(state.notifications);
    },
    deleteNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
      // حفظ الإشعارات في التخزين المحلي
      saveNotificationsToStorage(state.notifications);
    }
  }
});

export const {
  fetchNotificationsStart,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
  addNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = notificationsSlice.actions;

// Thunk for fetching notifications
export const fetchNotifications = () => async (dispatch) => {
  try {
    dispatch(fetchNotificationsStart());

    // استرجاع الإشعارات من التخزين المحلي
    const savedNotifications = getNotificationsFromStorage();

    // إذا لم تكن هناك إشعارات محفوظة، أضف إشعار ترحيب افتراضي
    if (savedNotifications.length === 0) {
      const defaultNotification = {
        id: generateUniqueId(),
        type: 'info',
        message: 'مرحبًا بك في دعوة الحق',
        timestamp: new Date().toISOString(),
        read: false
      };

      // إضافة الإشعار الافتراضي إلى التخزين المحلي
      saveNotificationsToStorage([defaultNotification]);

      // إرجاع الإشعار الافتراضي
      setTimeout(() => {
        dispatch(fetchNotificationsSuccess([defaultNotification]));
      }, 300);
    } else {
      // إرجاع الإشعارات المحفوظة
      setTimeout(() => {
        dispatch(fetchNotificationsSuccess(savedNotifications));
      }, 300);
    }
  } catch (error) {
    dispatch(fetchNotificationsFailure(error.message));
  }
};

// Selectors
export const selectAllNotifications = (state) => state.notifications.notifications;
export const selectNotificationsLoading = (state) => state.notifications.isLoading;
export const selectNotificationsError = (state) => state.notifications.error;

export default notificationsSlice.reducer;


