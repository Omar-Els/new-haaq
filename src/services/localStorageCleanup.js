// Local Storage Cleanup Service - خدمة تنظيف التخزين المحلي
class LocalStorageCleanup {
  
  // قائمة البيانات المسموح بالاحتفاظ بها (بيانات الجلسة والإعدادات البسيطة فقط)
  static ALLOWED_KEYS = [
    'authToken',           // توكن المصادقة
    'userPreferences',     // تفضيلات المستخدم البسيطة
    'theme',              // سمة التطبيق
    'language',           // اللغة
    'lastLoginTime',      // وقت آخر تسجيل دخول
    'sessionData',        // بيانات الجلسة المؤقتة
    'appSettings'         // إعدادات التطبيق البسيطة
  ];

  // قائمة قواعد البيانات IndexedDB للحذف
  static INDEXEDDB_DATABASES = [
    'ElhaqDB',
    'beneficiariesDB',
    'transactionsDB',
    'filesDB'
  ];

  // فحص حجم التخزين المحلي
  static getStorageSize() {
    let totalSize = 0;
    const details = {};

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const size = localStorage[key].length + key.length;
        totalSize += size;
        details[key] = {
          size: size,
          sizeKB: (size / 1024).toFixed(2),
          sizeMB: (size / 1024 / 1024).toFixed(2)
        };
      }
    }

    return {
      total: totalSize,
      totalKB: (totalSize / 1024).toFixed(2),
      totalMB: (totalSize / 1024 / 1024).toFixed(2),
      details
    };
  }

  // تنظيف localStorage (الاحتفاظ بالبيانات المسموحة فقط)
  static cleanLocalStorage() {
    console.log('🧹 بدء تنظيف localStorage...');
    
    const beforeSize = this.getStorageSize();
    console.log(`📊 حجم localStorage قبل التنظيف: ${beforeSize.totalMB} MB`);

    // حفظ البيانات المسموحة
    const allowedData = {};
    this.ALLOWED_KEYS.forEach(key => {
      if (localStorage.getItem(key)) {
        allowedData[key] = localStorage.getItem(key);
      }
    });

    // مسح localStorage بالكامل
    localStorage.clear();
    console.log('🗑️ تم مسح localStorage بالكامل');

    // إعادة البيانات المسموحة
    Object.entries(allowedData).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    const afterSize = this.getStorageSize();
    const savedMB = (beforeSize.total - afterSize.total) / 1024 / 1024;
    
    console.log(`✅ تم تنظيف localStorage`);
    console.log(`📊 حجم localStorage بعد التنظيف: ${afterSize.totalMB} MB`);
    console.log(`💾 تم توفير: ${savedMB.toFixed(2)} MB`);

    return {
      before: beforeSize,
      after: afterSize,
      saved: savedMB,
      cleanedKeys: Object.keys(beforeSize.details).filter(key => !this.ALLOWED_KEYS.includes(key))
    };
  }

  // حذف قواعد بيانات IndexedDB
  static async cleanIndexedDB() {
    console.log('🧹 بدء تنظيف IndexedDB...');
    
    const results = [];

    for (const dbName of this.INDEXEDDB_DATABASES) {
      try {
        await this.deleteDatabase(dbName);
        console.log(`✅ تم حذف قاعدة البيانات: ${dbName}`);
        results.push({ database: dbName, status: 'deleted' });
      } catch (error) {
        console.warn(`⚠️ فشل في حذف قاعدة البيانات ${dbName}:`, error);
        results.push({ database: dbName, status: 'failed', error: error.message });
      }
    }

    console.log('✅ تم الانتهاء من تنظيف IndexedDB');
    return results;
  }

  // حذف قاعدة بيانات IndexedDB محددة
  static deleteDatabase(dbName) {
    return new Promise((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase(dbName);
      
      deleteRequest.onsuccess = () => {
        resolve();
      };
      
      deleteRequest.onerror = () => {
        reject(deleteRequest.error);
      };
      
      deleteRequest.onblocked = () => {
        console.warn(`⚠️ حذف قاعدة البيانات ${dbName} محجوب. أغلق جميع التبويبات الأخرى.`);
        // محاولة إجبار الحذف
        setTimeout(() => {
          resolve();
        }, 1000);
      };
    });
  }

  // تنظيف شامل (localStorage + IndexedDB)
  static async performFullCleanup() {
    console.log('🚀 بدء التنظيف الشامل...');
    
    try {
      // تنظيف localStorage
      const localStorageResult = this.cleanLocalStorage();
      
      // تنظيف IndexedDB
      const indexedDBResult = await this.cleanIndexedDB();
      
      // مسح cache إضافي
      this.clearAdditionalCaches();
      
      const result = {
        localStorage: localStorageResult,
        indexedDB: indexedDBResult,
        timestamp: new Date().toISOString(),
        success: true
      };
      
      console.log('🎉 تم التنظيف الشامل بنجاح!');
      return result;
      
    } catch (error) {
      console.error('❌ خطأ في التنظيف الشامل:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // مسح caches إضافية
  static clearAdditionalCaches() {
    try {
      // مسح sessionStorage
      sessionStorage.clear();
      console.log('🗑️ تم مسح sessionStorage');
      
      // مسح cache API إذا كان متاحاً
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            caches.delete(cacheName);
            console.log(`🗑️ تم مسح cache: ${cacheName}`);
          });
        });
      }
      
    } catch (error) {
      console.warn('⚠️ خطأ في مسح caches إضافية:', error);
    }
  }

  // فحص ما إذا كان التنظيف مطلوباً
  static isCleanupNeeded() {
    const storageSize = this.getStorageSize();
    const sizeMB = parseFloat(storageSize.totalMB);
    
    // إذا تجاوز التخزين 2MB، فالتنظيف مطلوب
    return sizeMB > 2;
  }

  // جدولة تنظيف دوري
  static schedulePeriodicCleanup(intervalMinutes = 60) {
    setInterval(() => {
      if (this.isCleanupNeeded()) {
        console.log('🔄 تنظيف دوري مجدول...');
        this.cleanLocalStorage();
      }
    }, intervalMinutes * 60 * 1000);
    
    console.log(`⏰ تم جدولة التنظيف الدوري كل ${intervalMinutes} دقيقة`);
  }

  // تصدير البيانات قبل التنظيف (للنسخ الاحتياطي)
  static exportDataBeforeCleanup() {
    const storageData = {};
    
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        storageData[key] = localStorage[key];
      }
    }
    
    const exportData = {
      localStorage: storageData,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
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
    
    console.log('📤 تم تصدير البيانات للنسخ الاحتياطي');
    return exportData;
  }

  // استعادة البيانات من ملف النسخ الاحتياطي
  static importDataFromBackup(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          if (data.localStorage) {
            Object.entries(data.localStorage).forEach(([key, value]) => {
              if (this.ALLOWED_KEYS.includes(key)) {
                localStorage.setItem(key, value);
              }
            });
            
            console.log('📥 تم استعادة البيانات المسموحة من النسخ الاحتياطي');
            resolve(data);
          } else {
            reject(new Error('ملف النسخ الاحتياطي غير صالح'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }
}

export default LocalStorageCleanup;
