import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSave, FaMoon, FaSun, FaLanguage, FaUserCog, FaBell, FaLock,
  FaDatabase, FaUndo, FaPalette, FaFont, FaCheck, FaTimes, FaUser,
  FaFileExcel, FaFilePdf, FaFileCsv, FaTrash, FaDownload, FaHdd,
  FaShieldAlt, FaUserShield
} from 'react-icons/fa';
import { toggleTheme, selectTheme, setTheme } from '../features/ui/themeSlice';
import { addNotification } from '../features/notifications/notificationsSlice';
import {
  updateSettings,
  resetSettings,
  selectAllSettings,
  selectAppearanceSettings,
  selectNotificationSettings,
  selectAccountSettings,
  selectPrivacySettings,
  selectDataSettings
} from '../features/settings/settingsSlice';
import { StorageManager } from '../utils/storageManager';
import { dbManager, getDatabaseInfo, migrateData } from '../utils/indexedDBManager';
import DataCleanupButton from '../components/DataCleanupButton';
import NotificationCleanup from '../components/NotificationCleanup';
import RoleSwitcher from '../components/RoleSwitcher';
import './Settings.css';

/**
 * Settings Component
 *
 * This component provides a user interface for changing application settings.
 */
const Settings = () => {
  const dispatch = useDispatch();
  const currentTheme = useSelector(selectTheme);

  // استخدام الإعدادات من Redux
  const allSettings = useSelector(selectAllSettings);
  const appearanceSettings = useSelector(selectAppearanceSettings);
  const notificationSettings = useSelector(selectNotificationSettings);
  const accountSettings = useSelector(selectAccountSettings);
  const privacySettings = useSelector(selectPrivacySettings);
  const dataSettings = useSelector(selectDataSettings);

  // حالة المكون
  const [activeTab, setActiveTab] = useState('appearance');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [previewSettings, setPreviewSettings] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [storageInfo, setStorageInfo] = useState(null);
  const [isCleaningStorage, setIsCleaningStorage] = useState(false);
  const [databaseInfo, setDatabaseInfo] = useState(null);
  const [isMigrating, setIsMigrating] = useState(false);

  // مراجع للعناصر
  const colorPickerRef = useRef(null);
  const avatarInputRef = useRef(null);

  // نسخة محلية من الإعدادات للتعديل
  const [localSettings, setLocalSettings] = useState({
    appearance: { ...appearanceSettings },
    notifications: { ...notificationSettings },
    account: { ...accountSettings },
    privacy: { ...privacySettings },
    data: { ...dataSettings }
  });

  // تحديث النسخة المحلية عند تغير الإعدادات في Redux
  useEffect(() => {
    setLocalSettings({
      appearance: { ...appearanceSettings },
      notifications: { ...notificationSettings },
      account: { ...accountSettings },
      privacy: { ...privacySettings },
      data: { ...dataSettings }
    });
  }, [appearanceSettings, notificationSettings, accountSettings, privacySettings, dataSettings]);

  // تحديث معلومات التخزين عند فتح تبويب البيانات
  useEffect(() => {
    if (activeTab === 'data') {
      const updateStorageInfo = async () => {
        // معلومات localStorage
        const info = StorageManager.getStorageInfo();
        setStorageInfo(info);

        // معلومات IndexedDB
        try {
          const dbInfo = await getDatabaseInfo();
          setDatabaseInfo(dbInfo);
        } catch (error) {
          console.warn('لا يمكن الحصول على معلومات IndexedDB:', error);
          setDatabaseInfo(null);
        }
      };

      updateStorageInfo();

      // تحديث كل 5 ثوان
      const interval = setInterval(updateStorageInfo, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // التحقق من وجود تغييرات
  useEffect(() => {
    const checkChanges = () => {
      if (
        JSON.stringify(localSettings.appearance) !== JSON.stringify(appearanceSettings) ||
        JSON.stringify(localSettings.notifications) !== JSON.stringify(notificationSettings) ||
        JSON.stringify(localSettings.account) !== JSON.stringify(accountSettings) ||
        JSON.stringify(localSettings.privacy) !== JSON.stringify(privacySettings) ||
        JSON.stringify(localSettings.data) !== JSON.stringify(dataSettings)
      ) {
        setHasChanges(true);
      } else {
        setHasChanges(false);
      }
    };

    checkChanges();
  }, [localSettings, appearanceSettings, notificationSettings, accountSettings, privacySettings, dataSettings]);

  // تطبيق المعاينة
  useEffect(() => {
    if (showPreview && previewSettings) {
      // تطبيق المعاينة على العناصر المرئية دون حفظ
      const applyPreview = () => {
        // تطبيق حجم الخط
        document.documentElement.style.setProperty('--font-size-preview', getFontSizeValue(previewSettings.appearance.fontSize));
        document.body.classList.add('preview-mode');

        // تطبيق الألوان
        document.documentElement.style.setProperty('--primary-color-preview', previewSettings.appearance.primaryColor);
        document.documentElement.style.setProperty('--secondary-color-preview', previewSettings.appearance.secondaryColor);
      };

      applyPreview();

      // إزالة المعاينة عند إلغاء التحديد
      return () => {
        document.body.classList.remove('preview-mode');
      };
    }
  }, [showPreview, previewSettings]);

  // وظيفة مساعدة للحصول على قيمة حجم الخط
  const getFontSizeValue = (size) => {
    switch (size) {
      case 'small':
        return '0.875rem';
      case 'large':
        return '1.125rem';
      case 'medium':
      default:
        return '1rem';
    }
  };

  // معالجة تبديل السمة
  const handleThemeToggle = () => {
    const newTheme = localSettings.appearance.theme === 'light' ? 'dark' : 'light';

    // تحديث الإعدادات المحلية
    setLocalSettings({
      ...localSettings,
      appearance: {
        ...localSettings.appearance,
        theme: newTheme
      }
    });

    // معاينة التغيير
    setPreviewSettings({
      ...localSettings,
      appearance: {
        ...localSettings.appearance,
        theme: newTheme
      }
    });
    setShowPreview(true);
  };

  // معالجة تغيير الإعدادات
  const handleSettingChange = (category, setting, value) => {
    // تحديث الإعدادات المحلية
    const updatedSettings = {
      ...localSettings,
      [category]: {
        ...localSettings[category],
        [setting]: value
      }
    };

    setLocalSettings(updatedSettings);

    // معاينة التغيير
    setPreviewSettings(updatedSettings);
    setShowPreview(true);
  };

  // معالجة حفظ الإعدادات
  const handleSaveSettings = () => {
    // حفظ الإعدادات في Redux
    Object.keys(localSettings).forEach(category => {
      dispatch(updateSettings({
        category,
        settings: localSettings[category]
      }));
    });

    // تحديث السمة في Redux
    dispatch(setTheme(localSettings.appearance.theme));

    // إظهار إشعار نجاح
    dispatch(addNotification({
      type: 'success',
      message: 'تم حفظ الإعدادات بنجاح'
    }));

    // إيقاف المعاينة
    setShowPreview(false);
    setPreviewSettings(null);
    setHasChanges(false);
  };

  // معالجة إعادة تعيين الإعدادات
  const handleResetSettings = () => {
    setShowResetConfirm(true);
  };

  // تأكيد إعادة تعيين الإعدادات
  const confirmResetSettings = () => {
    // إعادة تعيين الإعدادات في Redux
    dispatch(resetSettings());

    // إظهار إشعار
    dispatch(addNotification({
      type: 'info',
      message: 'تم إعادة تعيين الإعدادات إلى الإعدادات الافتراضية'
    }));

    // إغلاق مربع التأكيد
    setShowResetConfirm(false);

    // إيقاف المعاينة
    setShowPreview(false);
    setPreviewSettings(null);
    setHasChanges(false);
  };

  // إلغاء التغييرات
  const handleCancelChanges = () => {
    // إعادة تعيين الإعدادات المحلية إلى قيم Redux
    setLocalSettings({
      appearance: { ...appearanceSettings },
      notifications: { ...notificationSettings },
      account: { ...accountSettings },
      privacy: { ...privacySettings },
      data: { ...dataSettings }
    });

    // إيقاف المعاينة
    setShowPreview(false);
    setPreviewSettings(null);
    setHasChanges(false);

    // إظهار إشعار
    dispatch(addNotification({
      type: 'info',
      message: 'تم إلغاء التغييرات'
    }));
  };

  // تنظيف التخزين
  const handleCleanupStorage = async () => {
    setIsCleaningStorage(true);

    try {
      const beforeInfo = StorageManager.getStorageInfo();
      StorageManager.cleanupStorage();
      StorageManager.compressLargeData();
      const afterInfo = StorageManager.getStorageInfo();

      if (beforeInfo && afterInfo) {
        const savedMB = ((beforeInfo.used - afterInfo.used) / 1024 / 1024).toFixed(2);
        dispatch(addNotification({
          type: 'success',
          message: `تم تنظيف التخزين بنجاح! تم توفير ${savedMB} MB`
        }));
      } else {
        dispatch(addNotification({
          type: 'success',
          message: 'تم تنظيف التخزين بنجاح!'
        }));
      }

      // تحديث معلومات التخزين
      setStorageInfo(StorageManager.getStorageInfo());
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'حدث خطأ أثناء تنظيف التخزين'
      }));
    } finally {
      setIsCleaningStorage(false);
    }
  };

  // تنظيف شامل مع النسخ الاحتياطي
  const handleFullCleanup = async () => {
    if (confirm('هل أنت متأكد من التنظيف الشامل؟ سيتم تصدير نسخة احتياطية أولاً.')) {
      setIsCleaningStorage(true);

      try {
        const result = StorageManager.performFullCleanup();

        dispatch(addNotification({
          type: 'success',
          message: 'تم التنظيف الشامل بنجاح! تم تصدير نسخة احتياطية.'
        }));

        // تحديث معلومات التخزين
        setStorageInfo(result);
      } catch (error) {
        dispatch(addNotification({
          type: 'error',
          message: 'حدث خطأ أثناء التنظيف الشامل'
        }));
      } finally {
        setIsCleaningStorage(false);
      }
    }
  };

  // تصدير البيانات
  const handleExportData = () => {
    try {
      StorageManager.exportDataBeforeCleanup();
      dispatch(addNotification({
        type: 'success',
        message: 'تم تصدير البيانات بنجاح!'
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'حدث خطأ أثناء تصدير البيانات'
      }));
    }
  };

  // ترحيل البيانات إلى IndexedDB
  const handleMigrateToIndexedDB = async () => {
    if (confirm(
      'هل تريد ترحيل جميع البيانات من localStorage إلى IndexedDB؟\n\n' +
      'المزايا:\n' +
      '• مساحة تخزين أكبر بكثير (عدة جيجابايت)\n' +
      '• أداء أفضل مع البيانات الكبيرة\n' +
      '• إدارة أفضل للصور والملفات\n' +
      '• لا مزيد من مشاكل امتلاء المساحة\n\n' +
      'سيتم الاحتفاظ بنسخة احتياطية من البيانات الحالية.'
    )) {
      setIsMigrating(true);

      try {
        // تصدير نسخة احتياطية أولاً
        StorageManager.exportDataBeforeCleanup();

        // ترحيل البيانات
        const success = await migrateData();

        if (success) {
          dispatch(addNotification({
            type: 'success',
            message: 'تم ترحيل البيانات إلى IndexedDB بنجاح! الآن لديك مساحة تخزين أكبر.'
          }));

          // تحديث معلومات التخزين
          const dbInfo = await getDatabaseInfo();
          setDatabaseInfo(dbInfo);

          // اقتراح مسح localStorage بعد الترحيل الناجح
          setTimeout(() => {
            if (confirm(
              'تم الترحيل بنجاح!\n\n' +
              'هل تريد مسح البيانات القديمة من localStorage لتوفير مساحة؟\n' +
              '(البيانات محفوظة بأمان في IndexedDB)'
            )) {
              localStorage.removeItem('beneficiaries');
              localStorage.removeItem('transactions');
              localStorage.removeItem('beneficiaries_backup');
              localStorage.removeItem('transactions_backup');

              dispatch(addNotification({
                type: 'info',
                message: 'تم مسح البيانات القديمة من localStorage'
              }));

              // تحديث معلومات localStorage
              const info = StorageManager.getStorageInfo();
              setStorageInfo(info);
            }
          }, 2000);
        } else {
          dispatch(addNotification({
            type: 'error',
            message: 'فشل في ترحيل البيانات. تحقق من دعم المتصفح لـ IndexedDB.'
          }));
        }
      } catch (error) {
        console.error('خطأ في الترحيل:', error);
        dispatch(addNotification({
          type: 'error',
          message: 'حدث خطأ أثناء ترحيل البيانات: ' + error.message
        }));
      } finally {
        setIsMigrating(false);
      }
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
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
      className={`settings-container ${showPreview ? 'preview-active' : ''}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="page-header" variants={itemVariants}>
        <h1>الإعدادات</h1>

        {hasChanges && (
          <div className="settings-status">
            <span className="status-badge">تم التعديل</span>
            <div className="header-actions">
              <motion.button
                className="btn btn-secondary"
                onClick={handleCancelChanges}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaTimes /> إلغاء
              </motion.button>
              <motion.button
                className="btn btn-primary"
                onClick={handleSaveSettings}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaSave /> حفظ التغييرات
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>

      {showPreview && (
        <motion.div
          className="preview-banner"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="preview-message">
            <FaCheck /> أنت في وضع المعاينة. التغييرات لن يتم حفظها حتى تضغط على "حفظ التغييرات".
          </div>
        </motion.div>
      )}

      <motion.div className="settings-content" variants={itemVariants}>
        <div className="settings-sidebar">
          <button
            className={`settings-tab ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            <FaSun /> المظهر
          </button>
          <button
            className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <FaBell /> الإشعارات
          </button>
          <button
            className={`settings-tab ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            <FaUserCog /> الحساب
          </button>
          <button
            className={`settings-tab ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <FaLock /> الخصوصية
          </button>
          <button
            className={`settings-tab ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            <FaDatabase /> البيانات
          </button>
          <button
            className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <FaShieldAlt /> الأمان والصلاحيات
          </button>

          <div className="settings-actions-sidebar">
            <button
              className="btn btn-reset"
              onClick={handleResetSettings}
            >
              <FaUndo /> إعادة تعيين
            </button>
          </div>
        </div>

        <div className="settings-panel">
          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h2>إعدادات المظهر</h2>

              <div className="setting-item">
                <div className="setting-label">المظهر</div>
                <div className="setting-control">
                  <div className="theme-options">
                    <button
                      className={`theme-option ${localSettings.appearance.theme === 'light' ? 'active' : ''}`}
                      onClick={() => handleSettingChange('appearance', 'theme', 'light')}
                    >
                      <div className="theme-preview light-preview">
                        <FaSun />
                      </div>
                      <span>فاتح</span>
                    </button>
                    <button
                      className={`theme-option ${localSettings.appearance.theme === 'dark' ? 'active' : ''}`}
                      onClick={() => handleSettingChange('appearance', 'theme', 'dark')}
                    >
                      <div className="theme-preview dark-preview">
                        <FaMoon />
                      </div>
                      <span>داكن</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-label">الألوان الرئيسية</div>
                <div className="setting-control">
                  <div className="color-pickers">
                    <div className="color-picker">
                      <label>اللون الرئيسي</label>
                      <div className="color-preview" style={{ backgroundColor: localSettings.appearance.primaryColor }}>
                        <input
                          type="color"
                          value={localSettings.appearance.primaryColor}
                          onChange={(e) => handleSettingChange('appearance', 'primaryColor', e.target.value)}
                          ref={colorPickerRef}
                        />
                      </div>
                    </div>
                    <div className="color-picker">
                      <label>اللون الثانوي</label>
                      <div className="color-preview" style={{ backgroundColor: localSettings.appearance.secondaryColor }}>
                        <input
                          type="color"
                          value={localSettings.appearance.secondaryColor}
                          onChange={(e) => handleSettingChange('appearance', 'secondaryColor', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-label">حجم الخط</div>
                <div className="setting-control">
                  <div className="font-size-options">
                    <button
                      className={`font-size-option ${localSettings.appearance.fontSize === 'small' ? 'active' : ''}`}
                      onClick={() => handleSettingChange('appearance', 'fontSize', 'small')}
                    >
                      <FaFont className="font-small" />
                      <span>صغير</span>
                    </button>
                    <button
                      className={`font-size-option ${localSettings.appearance.fontSize === 'medium' ? 'active' : ''}`}
                      onClick={() => handleSettingChange('appearance', 'fontSize', 'medium')}
                    >
                      <FaFont className="font-medium" />
                      <span>متوسط</span>
                    </button>
                    <button
                      className={`font-size-option ${localSettings.appearance.fontSize === 'large' ? 'active' : ''}`}
                      onClick={() => handleSettingChange('appearance', 'fontSize', 'large')}
                    >
                      <FaFont className="font-large" />
                      <span>كبير</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-label">اتجاه الصفحة</div>
                <div className="setting-control">
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="rtl-toggle"
                      checked={localSettings.appearance.rtl}
                      onChange={(e) => handleSettingChange('appearance', 'rtl', e.target.checked)}
                    />
                    <label htmlFor="rtl-toggle"></label>
                    <span>{localSettings.appearance.rtl ? 'من اليمين إلى اليسار' : 'من اليسار إلى اليمين'}</span>
                  </div>
                </div>
              </div>

              <div className="setting-preview">
                <h3>معاينة</h3>
                <div className={`preview-box ${localSettings.appearance.theme}`}>
                  <div className="preview-header" style={{ backgroundColor: localSettings.appearance.primaryColor }}>
                    <div className="preview-title">معاينة المظهر</div>
                  </div>
                  <div className="preview-content">
                    <div className="preview-text">هذا نص تجريبي لمعاينة حجم الخط والألوان.</div>
                    <button className="preview-button" style={{ backgroundColor: localSettings.appearance.secondaryColor }}>
                      زر تجريبي
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>إعدادات الإشعارات</h2>

              <div className="setting-item">
                <div className="setting-label">تفعيل الإشعارات</div>
                <div className="setting-control">
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="notifications-toggle"
                      checked={localSettings.notifications.enableNotifications}
                      onChange={(e) => handleSettingChange('notifications', 'enableNotifications', e.target.checked)}
                    />
                    <label htmlFor="notifications-toggle"></label>
                    <span>{localSettings.notifications.enableNotifications ? 'مفعل' : 'غير مفعل'}</span>
                  </div>
                </div>
              </div>

              {localSettings.notifications.enableNotifications && (
                <>
                  <div className="setting-item">
                    <div className="setting-label">صوت الإشعارات</div>
                    <div className="setting-control">
                      <div className="toggle-switch">
                        <input
                          type="checkbox"
                          id="sound-toggle"
                          checked={localSettings.notifications.notificationSound}
                          onChange={(e) => handleSettingChange('notifications', 'notificationSound', e.target.checked)}
                        />
                        <label htmlFor="sound-toggle"></label>
                        <span>{localSettings.notifications.notificationSound ? 'مفعل' : 'غير مفعل'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-label">
                      <label htmlFor="notification-duration">مدة ظهور الإشعار (ثواني)</label>
                    </div>
                    <div className="setting-control">
                      <div className="range-slider">
                        <input
                          type="range"
                          id="notification-duration"
                          min="1"
                          max="10"
                          value={localSettings.notifications.notificationDuration}
                          onChange={(e) => handleSettingChange('notifications', 'notificationDuration', parseInt(e.target.value, 10))}
                          aria-label="مدة ظهور الإشعار بالثواني"
                        />
                        <span className="range-value">{localSettings.notifications.notificationDuration} ثواني</span>
                      </div>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-label">إشعارات البريد الإلكتروني</div>
                    <div className="setting-control">
                      <div className="toggle-switch">
                        <input
                          type="checkbox"
                          id="email-toggle"
                          checked={localSettings.notifications.emailNotifications}
                          onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                        />
                        <label htmlFor="email-toggle"></label>
                        <span>{localSettings.notifications.emailNotifications ? 'مفعل' : 'غير مفعل'}</span>
                      </div>
                    </div>
                  </div>

                  {localSettings.notifications.emailNotifications && (
                    <div className="setting-info">
                      <p>
                        سيتم إرسال إشعارات البريد الإلكتروني إلى العنوان المحدد في إعدادات الحساب.
                        {!localSettings.account.email && (
                          <span className="warning-text"> يرجى تحديد عنوان بريد إلكتروني في إعدادات الحساب.</span>
                        )}
                      </p>
                    </div>
                  )}
                </>
              )}

              <div className="setting-preview">
                <h3>معاينة الإشعارات</h3>
                <div className="notification-preview">
                  <div className={`notification-item ${localSettings.notifications.enableNotifications ? '' : 'disabled'}`}>
                    <div className="notification-icon success">
                      <FaCheck />
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">إشعار تجريبي</div>
                      <div className="notification-message">هذا مثال على كيفية ظهور الإشعارات في النظام.</div>
                    </div>
                  </div>

                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      if (localSettings.notifications.enableNotifications) {
                        dispatch(addNotification({
                          type: 'info',
                          message: 'هذا إشعار تجريبي لمعاينة الإعدادات'
                        }));
                      }
                    }}
                    disabled={!localSettings.notifications.enableNotifications}
                  >
                    <FaBell /> عرض إشعار تجريبي
                  </button>
                </div>
              </div>

              {/* مكون تنظيف الإشعارات */}
              <NotificationCleanup />
            </div>
          )}

          {activeTab === 'account' && (
            <div className="settings-section">
              <h2>إعدادات الحساب</h2>

              <div className="account-header">
                <div className="avatar-container">
                  <label htmlFor="avatar-upload" className="avatar-label">الصورة الشخصية</label>
                  <div
                    className="avatar-preview"
                    style={{
                      backgroundImage: localSettings.account.avatar ?
                        `url(${localSettings.account.avatar})` :
                        'none'
                    }}
                  >
                    {!localSettings.account.avatar && <FaUser />}
                    <button
                      className="avatar-upload-btn"
                      onClick={() => avatarInputRef.current.click()}
                      aria-label="تغيير الصورة الشخصية"
                    >
                      تغيير
                    </button>
                    <input
                      type="file"
                      id="avatar-upload"
                      ref={avatarInputRef}
                      style={{ display: 'none' }}
                      accept="image/*"
                      aria-label="رفع صورة شخصية"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            handleSettingChange('account', 'avatar', reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="account-info">
                  <div className="setting-item">
                    <div className="setting-label">
                      <label htmlFor="display-name">اسم العرض</label>
                    </div>
                    <div className="setting-control">
                      <input
                        type="text"
                        id="display-name"
                        value={localSettings.account.displayName}
                        onChange={(e) => handleSettingChange('account', 'displayName', e.target.value)}
                        placeholder="أدخل اسم العرض"
                        autoComplete="name"
                        aria-label="اسم العرض"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <label htmlFor="account-email">البريد الإلكتروني</label>
                </div>
                <div className="setting-control">
                  <input
                    type="email"
                    id="account-email"
                    value={localSettings.account.email}
                    onChange={(e) => handleSettingChange('account', 'email', e.target.value)}
                    placeholder="أدخل البريد الإلكتروني"
                    autoComplete="email"
                    aria-label="البريد الإلكتروني"
                  />
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-label">اللغة</div>
                <div className="setting-control">
                  <div className="language-options">
                    <button
                      className={`language-option ${localSettings.account.language === 'ar' ? 'active' : ''}`}
                      onClick={() => handleSettingChange('account', 'language', 'ar')}
                    >
                      <span className="language-flag">🇪🇬</span>
                      <span>العربية</span>
                    </button>
                    <button
                      className={`language-option ${localSettings.account.language === 'en' ? 'active' : ''}`}
                      onClick={() => handleSettingChange('account', 'language', 'en')}
                    >
                      <span className="language-flag">🇺🇸</span>
                      <span>الإنجليزية</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="setting-preview">
                <h3>معاينة الحساب</h3>
                <div className="account-preview">
                  <div className="account-card">
                    <div className="account-card-header">
                      <div
                        className="account-card-avatar"
                        style={{
                          backgroundImage: localSettings.account.avatar ?
                            `url(${localSettings.account.avatar})` :
                            'none'
                        }}
                      >
                        {!localSettings.account.avatar && <FaUser />}
                      </div>
                      <div className="account-card-name">
                        {localSettings.account.displayName || 'المستخدم'}
                      </div>
                    </div>
                    <div className="account-card-body">
                      <div className="account-card-email">
                        {localSettings.account.email || 'لم يتم تحديد بريد إلكتروني'}
                      </div>
                      <div className="account-card-language">
                        {localSettings.account.language === 'ar' ? 'العربية 🇪🇬' : 'الإنجليزية 🇺🇸'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="settings-section">
              <h2>إعدادات الخصوصية</h2>

              <div className="setting-item">
                <div className="setting-label">حفظ معلومات تسجيل الدخول</div>
                <div className="setting-control">
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="save-login-toggle"
                      checked={localSettings.privacy.saveLoginInfo}
                      onChange={(e) => handleSettingChange('privacy', 'saveLoginInfo', e.target.checked)}
                    />
                    <label htmlFor="save-login-toggle"></label>
                    <span>{localSettings.privacy.saveLoginInfo ? 'مفعل' : 'غير مفعل'}</span>
                  </div>
                </div>
              </div>

              {localSettings.privacy.saveLoginInfo && (
                <div className="setting-info">
                  <p>
                    سيتم حفظ معلومات تسجيل الدخول الخاصة بك على هذا الجهاز، مما يتيح لك تسجيل الدخول تلقائيًا في المرة القادمة.
                  </p>
                </div>
              )}

              <div className="setting-item">
                <div className="setting-label">تسجيل الخروج التلقائي</div>
                <div className="setting-control">
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="auto-logout-toggle"
                      checked={localSettings.privacy.autoLogout}
                      onChange={(e) => handleSettingChange('privacy', 'autoLogout', e.target.checked)}
                    />
                    <label htmlFor="auto-logout-toggle"></label>
                    <span>{localSettings.privacy.autoLogout ? 'مفعل' : 'غير مفعل'}</span>
                  </div>
                </div>
              </div>

              {localSettings.privacy.autoLogout && (
                <>
                  <div className="setting-item">
                    <div className="setting-label">
                      <label htmlFor="logout-time">وقت تسجيل الخروج (دقائق)</label>
                    </div>
                    <div className="setting-control">
                      <div className="range-slider">
                        <input
                          type="range"
                          id="logout-time"
                          min="1"
                          max="120"
                          value={localSettings.privacy.logoutTime}
                          onChange={(e) => handleSettingChange('privacy', 'logoutTime', e.target.value)}
                          aria-label="وقت تسجيل الخروج التلقائي بالدقائق"
                        />
                        <span className="range-value">{localSettings.privacy.logoutTime} دقيقة</span>
                      </div>
                    </div>
                  </div>

                  <div className="setting-info">
                    <p>
                      سيتم تسجيل خروجك تلقائيًا بعد {localSettings.privacy.logoutTime} دقيقة من عدم النشاط.
                    </p>
                  </div>
                </>
              )}

              <div className="setting-item">
                <div className="setting-label">تشفير البيانات</div>
                <div className="setting-control">
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="encryption-toggle"
                      checked={localSettings.privacy.dataEncryption}
                      onChange={(e) => handleSettingChange('privacy', 'dataEncryption', e.target.checked)}
                    />
                    <label htmlFor="encryption-toggle"></label>
                    <span>{localSettings.privacy.dataEncryption ? 'مفعل' : 'غير مفعل'}</span>
                  </div>
                </div>
              </div>

              {localSettings.privacy.dataEncryption && (
                <div className="setting-info">
                  <p>
                    سيتم تشفير البيانات المخزنة محليًا لزيادة الأمان. قد يؤثر ذلك قليلاً على أداء التطبيق.
                  </p>
                </div>
              )}

              <div className="setting-preview">
                <h3>معلومات الخصوصية</h3>
                <div className="privacy-preview">
                  <div className="privacy-status">
                    <div className="privacy-status-item">
                      <div className="status-label">حالة الحساب:</div>
                      <div className={`status-value ${localSettings.privacy.saveLoginInfo ? 'active' : 'inactive'}`}>
                        {localSettings.privacy.saveLoginInfo ? 'متذكر' : 'غير متذكر'}
                      </div>
                    </div>
                    <div className="privacy-status-item">
                      <div className="status-label">الجلسة:</div>
                      <div className={`status-value ${localSettings.privacy.autoLogout ? 'warning' : 'active'}`}>
                        {localSettings.privacy.autoLogout ? `تنتهي بعد ${localSettings.privacy.logoutTime} دقيقة` : 'مستمرة'}
                      </div>
                    </div>
                    <div className="privacy-status-item">
                      <div className="status-label">التشفير:</div>
                      <div className={`status-value ${localSettings.privacy.dataEncryption ? 'active' : 'inactive'}`}>
                        {localSettings.privacy.dataEncryption ? 'مفعل' : 'غير مفعل'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="settings-section">
              <h2>إعدادات البيانات</h2>

              <div className="setting-item">
                <div className="setting-label">حفظ تلقائي</div>
                <div className="setting-control">
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="auto-save-toggle"
                      checked={localSettings.data.autoSave}
                      onChange={(e) => handleSettingChange('data', 'autoSave', e.target.checked)}
                    />
                    <label htmlFor="auto-save-toggle"></label>
                    <span>{localSettings.data.autoSave ? 'مفعل' : 'غير مفعل'}</span>
                  </div>
                </div>
              </div>

              {localSettings.data.autoSave && (
                <>
                  <div className="setting-item">
                    <div className="setting-label">
                      <label htmlFor="save-interval">فترة الحفظ التلقائي (دقائق)</label>
                    </div>
                    <div className="setting-control">
                      <div className="range-slider">
                        <input
                          type="range"
                          id="save-interval"
                          min="1"
                          max="60"
                          value={localSettings.data.saveInterval}
                          onChange={(e) => handleSettingChange('data', 'saveInterval', e.target.value)}
                          aria-label="فترة الحفظ التلقائي بالدقائق"
                        />
                        <span className="range-value">{localSettings.data.saveInterval} دقيقة</span>
                      </div>
                    </div>
                  </div>

                  <div className="setting-info">
                    <p>
                      سيتم حفظ البيانات تلقائيًا كل {localSettings.data.saveInterval} دقيقة.
                    </p>
                  </div>
                </>
              )}

              <div className="setting-item">
                <div className="setting-label">صيغة التصدير</div>
                <div className="setting-control">
                  <div className="export-format-options">
                    <button
                      className={`export-format-option ${localSettings.data.exportFormat === 'excel' ? 'active' : ''}`}
                      onClick={() => handleSettingChange('data', 'exportFormat', 'excel')}
                    >
                      <FaFileExcel />
                      <span>Excel</span>
                    </button>
                    <button
                      className={`export-format-option ${localSettings.data.exportFormat === 'csv' ? 'active' : ''}`}
                      onClick={() => handleSettingChange('data', 'exportFormat', 'csv')}
                    >
                      <FaFileCsv />
                      <span>CSV</span>
                    </button>
                    <button
                      className={`export-format-option ${localSettings.data.exportFormat === 'pdf' ? 'active' : ''}`}
                      onClick={() => handleSettingChange('data', 'exportFormat', 'pdf')}
                    >
                      <FaFilePdf />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-label">نسخ احتياطي للبيانات</div>
                <div className="setting-control">
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="backup-toggle"
                      checked={localSettings.data.backupData}
                      onChange={(e) => handleSettingChange('data', 'backupData', e.target.checked)}
                    />
                    <label htmlFor="backup-toggle"></label>
                    <span>{localSettings.data.backupData ? 'مفعل' : 'غير مفعل'}</span>
                  </div>
                </div>
              </div>

              {localSettings.data.backupData && (
                <div className="setting-info">
                  <p>
                    سيتم عمل نسخة احتياطية من البيانات بشكل دوري للحفاظ على سلامتها.
                  </p>
                </div>
              )}

              {/* زر تنظيف البيانات المحلية */}
              <DataCleanupButton />

              <div className="setting-preview">
                <h3>إدارة البيانات</h3>
                <div className="data-management">
                  <div className="data-actions">
                    <button className="btn btn-secondary">
                      <FaFileExcel /> تصدير البيانات
                    </button>
                    <button className="btn btn-secondary">
                      <FaDatabase /> نسخ احتياطي
                    </button>
                  </div>
                  <div className="data-status">
                    <div className="data-status-item">
                      <div className="status-label">الحفظ التلقائي:</div>
                      <div className={`status-value ${localSettings.data.autoSave ? 'active' : 'inactive'}`}>
                        {localSettings.data.autoSave ? `كل ${localSettings.data.saveInterval} دقيقة` : 'غير مفعل'}
                      </div>
                    </div>
                    <div className="data-status-item">
                      <div className="status-label">صيغة التصدير:</div>
                      <div className="status-value active">
                        {localSettings.data.exportFormat.toUpperCase()}
                      </div>
                    </div>
                    <div className="data-status-item">
                      <div className="status-label">النسخ الاحتياطي:</div>
                      <div className={`status-value ${localSettings.data.backupData ? 'active' : 'inactive'}`}>
                        {localSettings.data.backupData ? 'مفعل' : 'غير مفعل'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* تبويب الأمان والصلاحيات */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <div className="section-header">
                <FaShieldAlt className="section-icon" />
                <h2>الأمان والصلاحيات</h2>
                <p>إدارة أدوار المستخدمين والصلاحيات (للاختبار)</p>
              </div>

              {/* مكون تبديل الأدوار */}
              <RoleSwitcher />

              <div className="setting-preview">
                <h3>معلومات الأمان</h3>
                <div className="security-info">
                  <div className="info-card">
                    <div className="info-icon">
                      <FaShieldAlt />
                    </div>
                    <div className="info-content">
                      <h4>حماية البيانات</h4>
                      <p>جميع البيانات محمية ومشفرة محلياً في متصفحك</p>
                    </div>
                  </div>

                  <div className="info-card">
                    <div className="info-icon">
                      <FaLock />
                    </div>
                    <div className="info-content">
                      <h4>الخصوصية</h4>
                      <p>لا يتم مشاركة أي بيانات مع أطراف خارجية</p>
                    </div>
                  </div>

                  <div className="info-card">
                    <div className="info-icon">
                      <FaUserShield />
                    </div>
                    <div className="info-content">
                      <h4>التحكم في الوصول</h4>
                      <p>نظام صلاحيات متقدم لحماية العمليات الحساسة</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* مربع حوار تأكيد إعادة تعيين الإعدادات */}
          <AnimatePresence>
            {showResetConfirm && (
              <motion.div
                className="confirm-dialog-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="confirm-dialog"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                >
                  <h3>تأكيد إعادة تعيين الإعدادات</h3>
                  <p>هل أنت متأكد من إعادة تعيين جميع الإعدادات إلى القيم الافتراضية؟ لا يمكن التراجع عن هذا الإجراء.</p>
                  <div className="confirm-actions">
                    <button className="btn btn-secondary" onClick={() => setShowResetConfirm(false)}>
                      إلغاء
                    </button>
                    <button className="btn btn-danger" onClick={confirmResetSettings}>
                      إعادة تعيين
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* أزرار الإجراءات */}
          <div className="settings-actions">
            {hasChanges ? (
              <>
                <button className="btn btn-secondary" onClick={handleCancelChanges}>
                  <FaTimes /> إلغاء
                </button>
                <button className="btn btn-primary" onClick={handleSaveSettings}>
                  <FaSave /> حفظ الإعدادات
                </button>
              </>
            ) : (
              <button className="btn btn-reset" onClick={handleResetSettings}>
                <FaUndo /> إعادة تعيين الإعدادات
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Settings;
