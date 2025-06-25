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

// لا نحمل الإشعارات من localStorage لتوفير المساحة
// const savedNotifications = getNotificationsFromStorage();

// Initial state - بدء بإشعارات فارغة
const initialState = {
  notifications: [], // بدء فارغ لتوفير المساحة
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

      // إذا كانت الإشعارات معطلة، لا تضيف شيئاً
      if (!notificationSettings.enabled) {
        console.log('🔕 الإشعارات معطلة');
        return;
      }

      const payload = action.payload;
      const message = payload.message || '';
      const type = payload.type || 'info';

      // منع الإشعارات المتكررة (نفس الرسالة خلال آخر 30 ثانية)
      const now = new Date();
      const thirtySecondsAgo = new Date(now.getTime() - 30000);

      const isDuplicate = state.notifications.some(notification =>
        notification.message === message &&
        notification.type === type &&
        new Date(notification.timestamp) > thirtySecondsAgo
      );

      if (isDuplicate) {
        console.log('🔄 تم تجاهل إشعار مكرر:', message);
        return;
      }

      // تحديد الحد الأقصى للإشعارات (50 إشعار)
      const MAX_NOTIFICATIONS = 50;
      if (state.notifications.length >= MAX_NOTIFICATIONS) {
        // حذف أقدم الإشعارات
        state.notifications = state.notifications.slice(0, MAX_NOTIFICATIONS - 1);
        console.log('🧹 تم حذف الإشعارات القديمة للحفاظ على المساحة');
      }

      // إنشاء الإشعار الجديد
      const newNotification = {
        id: generateUniqueId(),
        timestamp: now.toISOString(),
        read: false,
        ...payload
      };

      // إضافة الإشعار في المقدمة
      state.notifications.unshift(newNotification);

      // حذف الإشعارات من localStorage (لا نحفظها لتوفير المساحة)
      // saveNotificationsToStorage(state.notifications);

      console.log(`📢 تم إضافة إشعار جديد: ${message}`);
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
      console.log('🗑️ تم حذف إشعار');
    },

    // تنظيف جميع الإشعارات
    clearAllNotifications: (state) => {
      state.notifications = [];
      console.log('🧹 تم مسح جميع الإشعارات');
    },

    // تنظيف الإشعارات القديمة (أكثر من ساعة)
    clearOldNotifications: (state) => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const initialCount = state.notifications.length;

      state.notifications = state.notifications.filter(notification =>
        new Date(notification.timestamp) > oneHourAgo
      );

      const removedCount = initialCount - state.notifications.length;
      if (removedCount > 0) {
        console.log(`🧹 تم حذف ${removedCount} إشعار قديم`);
      }
    },

    // تنظيف الإشعارات المقروءة
    clearReadNotifications: (state) => {
      const initialCount = state.notifications.length;

      state.notifications = state.notifications.filter(notification =>
        !notification.read
      );

      const removedCount = initialCount - state.notifications.length;
      if (removedCount > 0) {
        console.log(`🧹 تم حذف ${removedCount} إشعار مقروء`);
      }
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
  deleteNotification,
  clearAllNotifications,
  clearOldNotifications,
  clearReadNotifications
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


