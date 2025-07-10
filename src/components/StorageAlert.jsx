import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaTimes, FaBroom, FaDatabase } from 'react-icons/fa';
import { StorageManager } from '../utils/storageManager';
import './StorageAlert.css';

const StorageAlert = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [storageInfo, setStorageInfo] = useState(null);
  const [isCleaning, setIsCleaning] = useState(false);

  useEffect(() => {
    const checkStorage = () => {
      const info = StorageManager.getStorageInfo();
      setStorageInfo(info);
      
      if (info && info.usagePercentage > 85) {
        setShowAlert(true);
      } else {
        setShowAlert(false);
      }
    };

    // فحص فوري
    checkStorage();

    // فحص دوري كل 30 ثانية
    const interval = setInterval(checkStorage, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleQuickClean = async () => {
    setIsCleaning(true);
    
    try {
      StorageManager.performEmergencyCleanup();
      
      // تحديث معلومات التخزين بعد التنظيف
      setTimeout(() => {
        const newInfo = StorageManager.getStorageInfo();
        setStorageInfo(newInfo);
        
        if (newInfo.usagePercentage < 85) {
          setShowAlert(false);
        }
        
        setIsCleaning(false);
      }, 2000);
    } catch (error) {
      console.error('خطأ في التنظيف السريع:', error);
      setIsCleaning(false);
    }
  };

  const handleMigrateToIndexedDB = async () => {
    if (confirm(
      'هل تريد ترحيل جميع البيانات إلى IndexedDB الآن؟\n\n' +
      'المزايا:\n' +
      '• مساحة تخزين أكبر بكثير (عدة جيجابايت)\n' +
      '• أداء أفضل مع البيانات الكبيرة\n' +
      '• إدارة أفضل للصور والملفات\n' +
      '• لا مزيد من مشاكل امتلاء المساحة\n\n' +
      'سيتم الاحتفاظ بنسخة احتياطية من البيانات الحالية.'
    )) {
      setIsCleaning(true);

      try {
        // استيراد أدوات الترحيل
        const { migrateData } = await import('../utils/indexedDBManager');

        // تنفيذ الترحيل
        const success = await migrateData();

        if (success) {
          alert('تم ترحيل البيانات إلى IndexedDB بنجاح!\n\nالآن لديك مساحة تخزين أكبر بكثير.');

          // إخفاء التنبيه
          setShowAlert(false);

          // إعادة تحميل الصفحة لتطبيق التغييرات
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          alert('فشل في ترحيل البيانات. تحقق من دعم المتصفح لـ IndexedDB.');
        }
      } catch (error) {
        console.error('خطأ في الترحيل:', error);
        alert('حدث خطأ أثناء الترحيل: ' + error.message);
      } finally {
        setIsCleaning(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowAlert(false);
    
    // إعادة إظهار التنبيه بعد 5 دقائق إذا لم تحل المشكلة
    setTimeout(() => {
      const info = StorageManager.getStorageInfo();
      if (info && info.usagePercentage > 85) {
        setShowAlert(true);
      }
    }, 300000); // 5 دقائق
  };

  return (
    <AnimatePresence>
      {showAlert && (
        <motion.div
          className="storage-alert-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="storage-alert"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <div className="alert-header">
              <div className="alert-icon">
                <FaExclamationTriangle />
              </div>
              <h3>تحذير: مساحة التخزين ممتلئة!</h3>
              <button 
                className="close-btn"
                onClick={handleDismiss}
                aria-label="إغلاق التنبيه"
              >
                <FaTimes />
              </button>
            </div>

            <div className="alert-content">
              <div className="storage-info">
                <div className="usage-bar">
                  <div 
                    className="usage-fill"
                    style={{ 
                      width: `${storageInfo?.usagePercentage || 0}%`,
                      backgroundColor: storageInfo?.usagePercentage > 95 ? '#e74c3c' : 
                                     storageInfo?.usagePercentage > 85 ? '#f39c12' : '#2ecc71'
                    }}
                  />
                </div>
                <div className="usage-text">
                  <span>المساحة المستخدمة: {storageInfo?.usedMB} MB من {storageInfo?.totalMB} MB</span>
                  <span className="percentage">({storageInfo?.usagePercentage}%)</span>
                </div>
              </div>

              <p className="alert-message">
                مساحة التخزين المحلي ممتلئة تقريباً. هذا قد يؤثر على أداء التطبيق وقدرتك على حفظ بيانات جديدة.
              </p>

              <div className="alert-actions">
                <motion.button
                  className="action-btn quick-clean-btn"
                  onClick={handleQuickClean}
                  disabled={isCleaning}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaBroom />
                  {isCleaning ? 'جاري التنظيف...' : 'تنظيف سريع'}
                </motion.button>

                <motion.button
                  className="action-btn migrate-btn"
                  onClick={handleMigrateToIndexedDB}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaDatabase />
                  ترحيل إلى IndexedDB
                </motion.button>
              </div>

              <div className="alert-benefits">
                <h4>💡 فوائد الترحيل إلى IndexedDB:</h4>
                <ul>
                  <li>✅ مساحة تخزين أكبر (عدة جيجابايت)</li>
                  <li>✅ أداء أفضل مع البيانات الكبيرة</li>
                  <li>✅ إدارة أفضل للصور والملفات</li>
                  <li>✅ لا مزيد من مشاكل امتلاء المساحة</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StorageAlert;
