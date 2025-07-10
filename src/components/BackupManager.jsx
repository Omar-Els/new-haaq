import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCloud, FaDownload, FaUpload, FaSync, FaFileExport,
  FaFileImport, FaShieldAlt, FaClock, FaWifi, FaTimes,
  FaCheckCircle, FaExclamationTriangle, FaInfoCircle
} from 'react-icons/fa';
import cloudSync from '../services/cloudSync';
import { addNotification } from '../features/notifications/notificationsSlice';
import './BackupManager.css';

/**
 * BackupManager Component
 * 
 * مكون إدارة النسخ الاحتياطية والمزامنة السحابية
 */
const BackupManager = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  
  const [syncStatus, setSyncStatus] = useState(cloudSync.getSyncStatus());
  const [isLoading, setIsLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState(null);
  const [autoBackup, setAutoBackup] = useState(true);

  useEffect(() => {
    // تحديث حالة المزامنة كل ثانية
    const interval = setInterval(() => {
      setSyncStatus(cloudSync.getSyncStatus());
    }, 1000);

    // الاستماع لأحداث المزامنة
    const handleSyncEvent = (event) => {
      const { type, message } = event.detail;
      dispatch(addNotification({ type, message }));
      
      if (type === 'success') {
        setSyncStatus(cloudSync.getSyncStatus());
      }
    };

    window.addEventListener('cloudSync', handleSyncEvent);

    // تحميل آخر نسخة احتياطية
    const lastBackupTime = localStorage.getItem('lastBackupTime');
    if (lastBackupTime) {
      setLastBackup(new Date(lastBackupTime));
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('cloudSync', handleSyncEvent);
    };
  }, [dispatch]);

  // مزامنة فورية
  const handleManualSync = async () => {
    setIsLoading(true);
    try {
      await cloudSync.syncPendingChanges();
      await cloudSync.syncFromCloud();
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'فشل في المزامنة'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // إنشاء نسخة احتياطية
  const handleCreateBackup = async () => {
    setIsLoading(true);
    try {
      await cloudSync.createBackup();
      const now = new Date();
      setLastBackup(now);
      localStorage.setItem('lastBackupTime', now.toISOString());
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'فشل في إنشاء النسخة الاحتياطية'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // استعادة من النسخة الاحتياطية
  const handleRestoreBackup = async () => {
    if (!window.confirm('هل أنت متأكد من استعادة النسخة الاحتياطية؟ سيتم استبدال البيانات الحالية.')) {
      return;
    }

    setIsLoading(true);
    try {
      await cloudSync.restoreFromBackup();
      window.location.reload(); // إعادة تحميل الصفحة لتحديث البيانات
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'فشل في استعادة النسخة الاحتياطية'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // تصدير البيانات
  const handleExportData = () => {
    try {
      const exportData = cloudSync.exportAllData();
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `elhaq-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      dispatch(addNotification({
        type: 'success',
        message: 'تم تصدير البيانات بنجاح'
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'فشل في تصدير البيانات'
      }));
    }
  };

  // استيراد البيانات
  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        await cloudSync.importData(importData);
        window.location.reload(); // إعادة تحميل الصفحة
      } catch (error) {
        dispatch(addNotification({
          type: 'error',
          message: 'فشل في استيراد البيانات - تأكد من صحة الملف'
        }));
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="backup-manager-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="backup-manager-modal"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="backup-header">
            <div className="header-content">
              <FaCloud className="header-icon" />
              <div>
                <h2>إدارة النسخ الاحتياطية</h2>
                <p>مزامنة البيانات والنسخ الاحتياطية السحابية</p>
              </div>
            </div>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>

          {/* Status Section */}
          <div className="status-section">
            <div className="status-card">
              <div className="status-header">
                <h3>حالة المزامنة</h3>
                {syncStatus.isOnline ? (
                  <FaWifi className="status-icon online" />
                ) : (
                  <FaTimes className="status-icon offline" />
                )}
              </div>
              
              <div className="status-details">
                <div className="status-item">
                  <span>الاتصال:</span>
                  <span className={syncStatus.isOnline ? 'online' : 'offline'}>
                    {syncStatus.isOnline ? 'متصل' : 'غير متصل'}
                  </span>
                </div>
                
                <div className="status-item">
                  <span>التغييرات المعلقة:</span>
                  <span>{syncStatus.pendingChanges}</span>
                </div>
                
                <div className="status-item">
                  <span>آخر مزامنة:</span>
                  <span>
                    {syncStatus.lastSyncTime 
                      ? syncStatus.lastSyncTime.toLocaleString('ar-EG')
                      : 'لم تتم بعد'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="actions-section">
            <div className="actions-grid">
              
              {/* مزامنة فورية */}
              <motion.button
                className="action-btn sync"
                onClick={handleManualSync}
                disabled={isLoading || !syncStatus.isOnline}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaSync className={isLoading ? 'spinning' : ''} />
                <div>
                  <h4>مزامنة فورية</h4>
                  <p>مزامنة البيانات مع السحابة</p>
                </div>
              </motion.button>

              {/* إنشاء نسخة احتياطية */}
              <motion.button
                className="action-btn backup"
                onClick={handleCreateBackup}
                disabled={isLoading || !syncStatus.isOnline}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaShieldAlt />
                <div>
                  <h4>نسخة احتياطية</h4>
                  <p>إنشاء نسخة احتياطية سحابية</p>
                </div>
              </motion.button>

              {/* استعادة النسخة الاحتياطية */}
              <motion.button
                className="action-btn restore"
                onClick={handleRestoreBackup}
                disabled={isLoading || !syncStatus.isOnline}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaDownload />
                <div>
                  <h4>استعادة</h4>
                  <p>استعادة من النسخة الاحتياطية</p>
                </div>
              </motion.button>

              {/* تصدير البيانات */}
              <motion.button
                className="action-btn export"
                onClick={handleExportData}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaFileExport />
                <div>
                  <h4>تصدير</h4>
                  <p>تصدير البيانات كملف</p>
                </div>
              </motion.button>

              {/* استيراد البيانات */}
              <motion.label
                className="action-btn import"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaFileImport />
                <div>
                  <h4>استيراد</h4>
                  <p>استيراد البيانات من ملف</p>
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  style={{ display: 'none' }}
                />
              </motion.label>

            </div>
          </div>

          {/* Info Section */}
          <div className="info-section">
            <div className="info-card">
              <FaInfoCircle className="info-icon" />
              <div className="info-content">
                <h4>معلومات مهمة</h4>
                <ul>
                  <li>المزامنة تتم تلقائياً كل 30 ثانية عند وجود تغييرات</li>
                  <li>البيانات محمية ومشفرة في السحابة</li>
                  <li>يمكن الوصول للبيانات من أي جهاز بعد المزامنة</li>
                  <li>النسخ الاحتياطية تحفظ تلقائياً عند كل تغيير مهم</li>
                </ul>
              </div>
            </div>

            {lastBackup && (
              <div className="last-backup">
                <FaClock />
                <span>آخر نسخة احتياطية: {lastBackup.toLocaleString('ar-EG')}</span>
              </div>
            )}
          </div>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-spinner">
                <FaSync className="spinning" />
                <p>جاري المعالجة...</p>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BackupManager;
