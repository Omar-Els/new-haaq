import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FaTrash, FaBroom, FaEye, FaClock } from 'react-icons/fa';
import { 
  clearAllNotifications, 
  clearOldNotifications, 
  clearReadNotifications 
} from '../features/notifications/notificationsSlice';
import './NotificationCleanup.css';

const NotificationCleanup = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(state => state.notifications.notifications);

  // إحصائيات الإشعارات
  const totalNotifications = notifications.length;
  const readNotifications = notifications.filter(n => n.read).length;
  const unreadNotifications = totalNotifications - readNotifications;
  
  // الإشعارات القديمة (أكثر من ساعة)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const oldNotifications = notifications.filter(n => 
    new Date(n.timestamp) < oneHourAgo
  ).length;

  // تنظيف جميع الإشعارات
  const handleClearAll = () => {
    if (confirm(`هل تريد حذف جميع الإشعارات (${totalNotifications} إشعار)؟`)) {
      dispatch(clearAllNotifications());
    }
  };

  // تنظيف الإشعارات القديمة
  const handleClearOld = () => {
    if (oldNotifications === 0) {
      alert('لا توجد إشعارات قديمة للحذف');
      return;
    }
    
    if (confirm(`هل تريد حذف الإشعارات القديمة (${oldNotifications} إشعار)؟`)) {
      dispatch(clearOldNotifications());
    }
  };

  // تنظيف الإشعارات المقروءة
  const handleClearRead = () => {
    if (readNotifications === 0) {
      alert('لا توجد إشعارات مقروءة للحذف');
      return;
    }
    
    if (confirm(`هل تريد حذف الإشعارات المقروءة (${readNotifications} إشعار)؟`)) {
      dispatch(clearReadNotifications());
    }
  };

  return (
    <div className="notification-cleanup">
      <h3>🧹 تنظيف الإشعارات</h3>
      <p>إدارة وتنظيف الإشعارات لتوفير المساحة وتحسين الأداء</p>

      {/* إحصائيات الإشعارات */}
      <div className="notification-stats">
        <div className="stat-item">
          <div className="stat-number">{totalNotifications}</div>
          <div className="stat-label">إجمالي الإشعارات</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{unreadNotifications}</div>
          <div className="stat-label">غير مقروءة</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{readNotifications}</div>
          <div className="stat-label">مقروءة</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{oldNotifications}</div>
          <div className="stat-label">قديمة (+1 ساعة)</div>
        </div>
      </div>

      {/* أزرار التنظيف */}
      <div className="cleanup-actions">
        <motion.button
          className="cleanup-action-btn clear-read-btn"
          onClick={handleClearRead}
          disabled={readNotifications === 0}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaEye />
          <span>حذف المقروءة ({readNotifications})</span>
        </motion.button>

        <motion.button
          className="cleanup-action-btn clear-old-btn"
          onClick={handleClearOld}
          disabled={oldNotifications === 0}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaClock />
          <span>حذف القديمة ({oldNotifications})</span>
        </motion.button>

        <motion.button
          className="cleanup-action-btn clear-all-btn"
          onClick={handleClearAll}
          disabled={totalNotifications === 0}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaTrash />
          <span>حذف الكل ({totalNotifications})</span>
        </motion.button>
      </div>

      {/* معلومات مفيدة */}
      <div className="cleanup-info">
        <h4>💡 نصائح لإدارة الإشعارات:</h4>
        <ul>
          <li>✅ <strong>حذف المقروءة:</strong> يحذف الإشعارات التي قرأتها بالفعل</li>
          <li>✅ <strong>حذف القديمة:</strong> يحذف الإشعارات الأقدم من ساعة واحدة</li>
          <li>✅ <strong>حذف الكل:</strong> يحذف جميع الإشعارات (استخدم بحذر)</li>
          <li>⚡ <strong>تلقائي:</strong> النظام يحد من الإشعارات المتكررة تلقائياً</li>
          <li>💾 <strong>توفير المساحة:</strong> الإشعارات لا تُحفظ في localStorage</li>
        </ul>
      </div>

      {/* تحذير إذا كانت الإشعارات كثيرة */}
      {totalNotifications > 30 && (
        <div className="cleanup-warning">
          <FaBroom />
          <div>
            <strong>تحذير:</strong> لديك {totalNotifications} إشعار. 
            يُنصح بتنظيف الإشعارات لتحسين الأداء.
          </div>
        </div>
      )}

      {/* رسالة إذا لم توجد إشعارات */}
      {totalNotifications === 0 && (
        <div className="no-notifications">
          <FaBroom />
          <div>
            <strong>ممتاز!</strong> لا توجد إشعارات للتنظيف.
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCleanup;
