import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCloud, FaSync, FaWifi, FaCheckCircle,
  FaExclamationTriangle, FaClock, FaTimes
} from 'react-icons/fa';
import cloudSync from '../services/cloudSync';
import './SyncIndicator.css';

/**
 * SyncIndicator Component
 * 
 * مؤشر حالة المزامنة السحابية
 */
const SyncIndicator = ({ onClick }) => {
  const [syncStatus, setSyncStatus] = useState(cloudSync.getSyncStatus());
  const [showTooltip, setShowTooltip] = useState(false);
  const [lastSyncMessage, setLastSyncMessage] = useState('');

  useEffect(() => {
    // تحديث حالة المزامنة
    const interval = setInterval(() => {
      setSyncStatus(cloudSync.getSyncStatus());
    }, 1000);

    // الاستماع لأحداث المزامنة
    const handleSyncEvent = (event) => {
      const { type, message } = event.detail;
      setLastSyncMessage(message);
      setSyncStatus(cloudSync.getSyncStatus());
      
      // إظهار التولتيب لثواني قليلة عند حدوث مزامنة
      if (type === 'success') {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 3000);
      }
    };

    window.addEventListener('cloudSync', handleSyncEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener('cloudSync', handleSyncEvent);
    };
  }, []);

  // تحديد أيقونة الحالة
  const getStatusIcon = () => {
    if (!syncStatus.isOnline) {
      return <FaTimes className="status-icon offline" />;
    }
    
    if (syncStatus.pendingChanges > 0) {
      return <FaSync className="status-icon syncing spinning" />;
    }
    
    return <FaCheckCircle className="status-icon synced" />;
  };

  // تحديد رسالة الحالة
  const getStatusMessage = () => {
    if (!syncStatus.isOnline) {
      return 'غير متصل بالإنترنت';
    }
    
    if (syncStatus.pendingChanges > 0) {
      return `جاري المزامنة (${syncStatus.pendingChanges} تغيير)`;
    }
    
    if (syncStatus.lastSyncTime) {
      const timeDiff = Date.now() - syncStatus.lastSyncTime.getTime();
      const minutes = Math.floor(timeDiff / 60000);
      
      if (minutes < 1) {
        return 'تم المزامنة الآن';
      } else if (minutes < 60) {
        return `تم المزامنة منذ ${minutes} دقيقة`;
      } else {
        const hours = Math.floor(minutes / 60);
        return `تم المزامنة منذ ${hours} ساعة`;
      }
    }
    
    return 'لم تتم المزامنة بعد';
  };

  // تحديد لون الحالة
  const getStatusColor = () => {
    if (!syncStatus.isOnline) return 'offline';
    if (syncStatus.pendingChanges > 0) return 'syncing';
    return 'synced';
  };

  return (
    <div className="sync-indicator-container">
      <motion.div
        className={`sync-indicator ${getStatusColor()}`}
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="إدارة النسخ الاحتياطية والمزامنة"
      >
        <FaCloud className="cloud-icon" />
        {getStatusIcon()}
        
        {/* مؤشر التغييرات المعلقة */}
        {syncStatus.pendingChanges > 0 && (
          <motion.div
            className="pending-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            {syncStatus.pendingChanges}
          </motion.div>
        )}
      </motion.div>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className="sync-tooltip"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="tooltip-header">
              <FaCloud />
              <span>حالة المزامنة</span>
            </div>
            
            <div className="tooltip-content">
              <div className="tooltip-item">
                <span>الحالة:</span>
                <span className={getStatusColor()}>{getStatusMessage()}</span>
              </div>
              
              <div className="tooltip-item">
                <span>الاتصال:</span>
                <span className={syncStatus.isOnline ? 'online' : 'offline'}>
                  {syncStatus.isOnline ? 'متصل' : 'غير متصل'}
                </span>
              </div>
              
              {syncStatus.pendingChanges > 0 && (
                <div className="tooltip-item">
                  <span>التغييرات المعلقة:</span>
                  <span>{syncStatus.pendingChanges}</span>
                </div>
              )}
              
              {lastSyncMessage && (
                <div className="tooltip-message">
                  {lastSyncMessage}
                </div>
              )}
            </div>
            
            <div className="tooltip-footer">
              اضغط لإدارة النسخ الاحتياطية
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SyncIndicator;
