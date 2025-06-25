import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTrash, FaBroom, FaDatabase } from 'react-icons/fa';
import './DataCleanupButton.css';

const DataCleanupButton = () => {
  const [isClearing, setIsClearing] = useState(false);

  // تنظيف localStorage (الاحتفاظ بالضروري فقط)
  const clearLocalStorage = () => {
    if (confirm('هل تريد تنظيف البيانات المحلية؟\n\nسيتم الاحتفاظ بـ:\n• توكن تسجيل الدخول\n• الإعدادات الأساسية\n• تفضيلات المستخدم')) {
      setIsClearing(true);
      
      // حفظ البيانات المهمة
      const authToken = localStorage.getItem('authToken');
      const userPreferences = localStorage.getItem('userPreferences');
      const theme = localStorage.getItem('theme');
      const language = localStorage.getItem('language');
      
      // مسح localStorage
      localStorage.clear();
      
      // إعادة البيانات المهمة
      if (authToken) localStorage.setItem('authToken', authToken);
      if (userPreferences) localStorage.setItem('userPreferences', userPreferences);
      if (theme) localStorage.setItem('theme', theme);
      if (language) localStorage.setItem('language', language);
      
      console.log('✅ تم تنظيف localStorage');
      
      setTimeout(() => {
        setIsClearing(false);
        alert('تم تنظيف البيانات المحلية بنجاح!');
      }, 1000);
    }
  };

  // تنظيف IndexedDB
  const clearIndexedDB = async () => {
    if (confirm('هل تريد حذف جميع قواعد البيانات المحلية؟\n\nهذا سيحذف:\n• جميع البيانات المحفوظة محلياً\n• الصور والملفات\n• البيانات المؤقتة')) {
      setIsClearing(true);
      
      try {
        // قائمة قواعد البيانات للحذف
        const databases = ['ElhaqDB', 'beneficiariesDB', 'transactionsDB', 'filesDB'];
        
        for (const dbName of databases) {
          try {
            await deleteDatabase(dbName);
            console.log(`✅ تم حذف قاعدة البيانات: ${dbName}`);
          } catch (error) {
            console.warn(`⚠️ فشل في حذف ${dbName}:`, error);
          }
        }
        
        console.log('✅ تم تنظيف IndexedDB');
        alert('تم حذف جميع قواعد البيانات المحلية بنجاح!');
      } catch (error) {
        console.error('❌ خطأ في تنظيف IndexedDB:', error);
        alert('حدث خطأ في تنظيف قواعد البيانات');
      } finally {
        setIsClearing(false);
      }
    }
  };

  // حذف قاعدة بيانات IndexedDB
  const deleteDatabase = (dbName) => {
    return new Promise((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase(dbName);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
      deleteRequest.onblocked = () => {
        console.warn(`⚠️ حذف ${dbName} محجوب`);
        setTimeout(() => resolve(), 1000);
      };
    });
  };

  // تنظيف شامل
  const performFullCleanup = async () => {
    if (confirm('تنظيف شامل للبيانات المحلية؟\n\nسيتم حذف:\n• جميع البيانات في localStorage\n• جميع قواعد بيانات IndexedDB\n• Cache المتصفح\n\nالاحتفاظ فقط بـ:\n• توكن تسجيل الدخول\n• الإعدادات الأساسية')) {
      setIsClearing(true);
      
      try {
        // تنظيف localStorage
        const authToken = localStorage.getItem('authToken');
        const userPreferences = localStorage.getItem('userPreferences');
        const theme = localStorage.getItem('theme');
        
        localStorage.clear();
        sessionStorage.clear();
        
        if (authToken) localStorage.setItem('authToken', authToken);
        if (userPreferences) localStorage.setItem('userPreferences', userPreferences);
        if (theme) localStorage.setItem('theme', theme);
        
        // تنظيف IndexedDB
        const databases = ['ElhaqDB', 'beneficiariesDB', 'transactionsDB', 'filesDB'];
        for (const dbName of databases) {
          try {
            await deleteDatabase(dbName);
          } catch (error) {
            console.warn(`فشل في حذف ${dbName}`);
          }
        }
        
        // تنظيف Cache
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        }
        
        console.log('🎉 تم التنظيف الشامل بنجاح');
        alert('تم التنظيف الشامل بنجاح!\n\nتم توفير مساحة كبيرة في المتصفح.');
        
        // إعادة تحميل الصفحة
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
      } catch (error) {
        console.error('❌ خطأ في التنظيف الشامل:', error);
        alert('حدث خطأ في التنظيف الشامل');
      } finally {
        setIsClearing(false);
      }
    }
  };

  return (
    <div className="data-cleanup-container">
      <h3>🧹 تنظيف البيانات المحلية</h3>
      <p>لحل مشاكل امتلاء مساحة التخزين في المتصفح</p>
      
      <div className="cleanup-buttons">
        <motion.button
          className="cleanup-btn localStorage-btn"
          onClick={clearLocalStorage}
          disabled={isClearing}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaBroom />
          تنظيف localStorage
        </motion.button>

        <motion.button
          className="cleanup-btn indexeddb-btn"
          onClick={clearIndexedDB}
          disabled={isClearing}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaDatabase />
          حذف IndexedDB
        </motion.button>

        <motion.button
          className="cleanup-btn full-cleanup-btn"
          onClick={performFullCleanup}
          disabled={isClearing}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaTrash />
          {isClearing ? 'جاري التنظيف...' : 'تنظيف شامل'}
        </motion.button>
      </div>

      <div className="cleanup-info">
        <h4>💡 نصائح:</h4>
        <ul>
          <li>✅ استخدم "تنظيف localStorage" للمشاكل البسيطة</li>
          <li>✅ استخدم "حذف IndexedDB" للبيانات الكبيرة</li>
          <li>✅ استخدم "تنظيف شامل" لحل جميع المشاكل</li>
          <li>⚠️ التنظيف الشامل سيعيد تحميل الصفحة</li>
        </ul>
      </div>
    </div>
  );
};

export default DataCleanupButton;
