/**
 * Cloud Sync Service
 * خدمة المزامنة السحابية للبيانات
 */

class CloudSyncService {
  constructor() {
    this.apiUrl = 'https://api.jsonbin.io/v3/b';
    this.apiKey = '$2a$10$9vKvKvKvKvKvKvKvKvKvKu'; // مفتاح وهمي - سيتم استبداله
    this.syncInterval = 30000; // 30 ثانية
    this.isOnline = navigator.onLine;
    this.pendingChanges = new Set();
    this.lastSyncTime = null;
    
    this.initializeEventListeners();
    this.startAutoSync();
  }

  /**
   * تهيئة مستمعي الأحداث
   */
  initializeEventListeners() {
    // مراقبة حالة الاتصال
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingChanges();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // مراقبة تغييرات localStorage
    window.addEventListener('storage', (e) => {
      if (this.shouldSyncKey(e.key)) {
        this.markForSync(e.key);
      }
    });
  }

  /**
   * تحديد ما إذا كان المفتاح يحتاج مزامنة
   */
  shouldSyncKey(key) {
    const syncKeys = [
      'beneficiaries',
      'volunteers',
      'initiatives',
      'finances',
      'reports',
      'settings'
    ];
    return syncKeys.some(syncKey => key?.includes(syncKey));
  }

  /**
   * وضع علامة للمزامنة
   */
  markForSync(key) {
    this.pendingChanges.add(key);
    if (this.isOnline) {
      this.debouncedSync();
    }
  }

  /**
   * مزامنة مؤجلة لتجنب الطلبات المتكررة
   */
  debouncedSync = this.debounce(() => {
    this.syncPendingChanges();
  }, 2000);

  /**
   * دالة التأجيل
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * بدء المزامنة التلقائية
   */
  startAutoSync() {
    setInterval(() => {
      if (this.isOnline && this.pendingChanges.size > 0) {
        this.syncPendingChanges();
      }
    }, this.syncInterval);
  }

  /**
   * مزامنة التغييرات المعلقة
   */
  async syncPendingChanges() {
    if (!this.isOnline || this.pendingChanges.size === 0) {
      return;
    }

    try {
      const changes = Array.from(this.pendingChanges);
      const syncData = {};

      // جمع البيانات المحلية
      changes.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            syncData[key] = JSON.parse(data);
          } catch (e) {
            syncData[key] = data;
          }
        }
      });

      // إضافة معلومات المزامنة
      syncData._metadata = {
        timestamp: new Date().toISOString(),
        deviceId: this.getDeviceId(),
        version: '1.0.0',
        changes: changes
      };

      // رفع البيانات للسحابة
      await this.uploadToCloud(syncData);

      // مسح التغييرات المعلقة
      this.pendingChanges.clear();
      this.lastSyncTime = new Date();

      // إشعار بنجاح المزامنة
      this.notifySync('success', 'تم مزامنة البيانات بنجاح');

    } catch (error) {
      console.error('خطأ في المزامنة:', error);
      this.notifySync('error', 'فشل في مزامنة البيانات');
    }
  }

  /**
   * رفع البيانات للسحابة
   */
  async uploadToCloud(data) {
    // استخدام JSONBin كمثال (يمكن استبداله بـ Firebase أو أي خدمة أخرى)
    const response = await fetch(`${this.apiUrl}/${this.getBinId()}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': this.apiKey,
        'X-Bin-Versioning': 'false'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * تحميل البيانات من السحابة
   */
  async downloadFromCloud() {
    try {
      const response = await fetch(`${this.apiUrl}/${this.getBinId()}/latest`, {
        headers: {
          'X-Master-Key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.record;

    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
      throw error;
    }
  }

  /**
   * مزامنة البيانات من السحابة
   */
  async syncFromCloud() {
    if (!this.isOnline) {
      this.notifySync('warning', 'لا يوجد اتصال بالإنترنت');
      return;
    }

    try {
      const cloudData = await this.downloadFromCloud();
      
      if (!cloudData || !cloudData._metadata) {
        return;
      }

      // مقارنة التوقيتات
      const cloudTime = new Date(cloudData._metadata.timestamp);
      const localTime = this.getLastLocalUpdate();

      if (cloudTime > localTime) {
        // البيانات السحابية أحدث
        await this.mergeCloudData(cloudData);
        this.notifySync('success', 'تم تحديث البيانات من السحابة');
      }

    } catch (error) {
      console.error('خطأ في مزامنة البيانات:', error);
      this.notifySync('error', 'فشل في تحميل البيانات من السحابة');
    }
  }

  /**
   * دمج البيانات السحابية
   */
  async mergeCloudData(cloudData) {
    const excludeKeys = ['_metadata'];
    
    Object.keys(cloudData).forEach(key => {
      if (!excludeKeys.includes(key)) {
        const dataToStore = typeof cloudData[key] === 'object' 
          ? JSON.stringify(cloudData[key])
          : cloudData[key];
        
        localStorage.setItem(key, dataToStore);
      }
    });

    // تحديث وقت آخر مزامنة
    localStorage.setItem('lastCloudSync', cloudData._metadata.timestamp);
  }

  /**
   * الحصول على آخر تحديث محلي
   */
  getLastLocalUpdate() {
    const lastSync = localStorage.getItem('lastCloudSync');
    return lastSync ? new Date(lastSync) : new Date(0);
  }

  /**
   * الحصول على معرف الجهاز
   */
  getDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }

  /**
   * الحصول على معرف الحاوية السحابية
   */
  getBinId() {
    let binId = localStorage.getItem('cloudBinId');
    if (!binId) {
      // إنشاء حاوية جديدة لكل مستخدم
      binId = 'elhaq_' + this.getDeviceId();
      localStorage.setItem('cloudBinId', binId);
    }
    return binId;
  }

  /**
   * إشعار المزامنة
   */
  notifySync(type, message) {
    // إرسال حدث مخصص للإشعارات
    window.dispatchEvent(new CustomEvent('cloudSync', {
      detail: { type, message, timestamp: new Date() }
    }));
  }

  /**
   * تصدير جميع البيانات
   */
  exportAllData() {
    const exportData = {
      beneficiaries: this.getLocalData('beneficiaries'),
      volunteers: this.getLocalData('volunteers'),
      initiatives: this.getLocalData('initiatives'),
      finances: this.getLocalData('finances'),
      reports: this.getLocalData('reports'),
      settings: this.getLocalData('settings'),
      _export: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        deviceId: this.getDeviceId()
      }
    };

    return exportData;
  }

  /**
   * استيراد البيانات
   */
  async importData(importData) {
    try {
      if (!importData || !importData._export) {
        throw new Error('ملف الاستيراد غير صحيح');
      }

      const excludeKeys = ['_export'];
      
      Object.keys(importData).forEach(key => {
        if (!excludeKeys.includes(key) && importData[key]) {
          const dataToStore = typeof importData[key] === 'object' 
            ? JSON.stringify(importData[key])
            : importData[key];
          
          localStorage.setItem(key, dataToStore);
          this.markForSync(key);
        }
      });

      this.notifySync('success', 'تم استيراد البيانات بنجاح');
      
      // مزامنة فورية
      if (this.isOnline) {
        await this.syncPendingChanges();
      }

    } catch (error) {
      console.error('خطأ في الاستيراد:', error);
      this.notifySync('error', 'فشل في استيراد البيانات');
      throw error;
    }
  }

  /**
   * الحصول على البيانات المحلية
   */
  getLocalData(key) {
    const data = localStorage.getItem(key);
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch (e) {
      return data;
    }
  }

  /**
   * إنشاء نسخة احتياطية
   */
  async createBackup() {
    const backupData = this.exportAllData();
    
    // رفع النسخة الاحتياطية للسحابة
    if (this.isOnline) {
      try {
        await this.uploadToCloud(backupData);
        this.notifySync('success', 'تم إنشاء نسخة احتياطية');
      } catch (error) {
        this.notifySync('error', 'فشل في إنشاء النسخة الاحتياطية');
      }
    }

    return backupData;
  }

  /**
   * استعادة من النسخة الاحتياطية
   */
  async restoreFromBackup() {
    try {
      const backupData = await this.downloadFromCloud();
      await this.importData(backupData);
      this.notifySync('success', 'تم استعادة النسخة الاحتياطية');
    } catch (error) {
      this.notifySync('error', 'فشل في استعادة النسخة الاحتياطية');
      throw error;
    }
  }

  /**
   * الحصول على حالة المزامنة
   */
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      pendingChanges: this.pendingChanges.size,
      lastSyncTime: this.lastSyncTime,
      deviceId: this.getDeviceId()
    };
  }
}

// إنشاء مثيل واحد للخدمة
const cloudSync = new CloudSyncService();

export default cloudSync;
