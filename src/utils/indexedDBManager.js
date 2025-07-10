// IndexedDB Manager - إدارة قاعدة بيانات محلية بمساحة أكبر
class IndexedDBManager {
  constructor() {
    this.dbName = 'ElhaqDB';
    this.version = 2;
    this.db = null;
  }

  // فتح قاعدة البيانات
  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('خطأ في فتح قاعدة البيانات:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ تم فتح قاعدة البيانات بنجاح');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // إنشاء جداول البيانات
        if (!db.objectStoreNames.contains('beneficiaries')) {
          const beneficiariesStore = db.createObjectStore('beneficiaries', { keyPath: 'id' });
          beneficiariesStore.createIndex('name', 'name', { unique: false });
          beneficiariesStore.createIndex('nationalId', 'nationalId', { unique: true });
          beneficiariesStore.createIndex('beneficiaryId', 'beneficiaryId', { unique: true });
        }

        if (!db.objectStoreNames.contains('transactions')) {
          const transactionsStore = db.createObjectStore('transactions', { keyPath: 'id' });
          transactionsStore.createIndex('date', 'date', { unique: false });
          transactionsStore.createIndex('type', 'type', { unique: false });
          transactionsStore.createIndex('category', 'category', { unique: false });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('images')) {
          const imagesStore = db.createObjectStore('images', { keyPath: 'id' });
          imagesStore.createIndex('beneficiaryId', 'beneficiaryId', { unique: false });
          imagesStore.createIndex('type', 'type', { unique: false });
        }

        if (!db.objectStoreNames.contains('sheets')) {
          const sheetsStore = db.createObjectStore('sheets', { keyPath: 'id' });
          sheetsStore.createIndex('name', 'name', { unique: false });
          sheetsStore.createIndex('status', 'status', { unique: false });
          sheetsStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        console.log('🏗️ تم إنشاء هيكل قاعدة البيانات');
      };
    });
  }

  // حفظ البيانات
  async saveData(storeName, data) {
    if (!this.db) await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      if (Array.isArray(data)) {
        // حفظ مصفوفة من البيانات
        const requests = data.map(item => store.put(item));
        
        Promise.all(requests.map(req => new Promise((res, rej) => {
          req.onsuccess = () => res(req.result);
          req.onerror = () => rej(req.error);
        }))).then(resolve).catch(reject);
      } else {
        // حفظ عنصر واحد
        const request = store.put(data);
        
        request.onsuccess = () => {
          console.log(`✅ تم حفظ البيانات في ${storeName}`);
          resolve(request.result);
        };
        
        request.onerror = () => {
          console.error(`❌ خطأ في حفظ البيانات في ${storeName}:`, request.error);
          reject(request.error);
        };
      }
    });
  }

  // استرجاع جميع البيانات
  async getAllData(storeName) {
    if (!this.db) await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        console.log(`📊 تم استرجاع ${request.result.length} عنصر من ${storeName}`);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error(`❌ خطأ في استرجاع البيانات من ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  }

  // استرجاع عنصر واحد
  async getData(storeName, id) {
    if (!this.db) await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // حذف عنصر
  async deleteData(storeName, id) {
    if (!this.db) await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log(`🗑️ تم حذف العنصر ${id} من ${storeName}`);
        resolve();
      };

      request.onerror = () => {
        console.error(`❌ خطأ في حذف العنصر من ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  }

  // مسح جميع البيانات من جدول
  async clearStore(storeName) {
    if (!this.db) await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        console.log(`🧹 تم مسح جميع البيانات من ${storeName}`);
        resolve();
      };

      request.onerror = () => {
        console.error(`❌ خطأ في مسح البيانات من ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  }

  // حفظ الصور بشكل منفصل
  async saveImage(beneficiaryId, imageType, imageData) {
    const imageRecord = {
      id: `${beneficiaryId}_${imageType}`,
      beneficiaryId,
      type: imageType,
      data: imageData,
      createdAt: new Date().toISOString()
    };

    return this.saveData('images', imageRecord);
  }

  // استرجاع صور مستفيد معين
  async getBeneficiaryImages(beneficiaryId) {
    if (!this.db) await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['images'], 'readonly');
      const store = transaction.objectStore('images');
      const index = store.index('beneficiaryId');
      const request = index.getAll(beneficiaryId);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // فحص حجم قاعدة البيانات
  async getDatabaseSize() {
    if (!this.db) await this.openDB();

    try {
      const estimate = await navigator.storage.estimate();
      return {
        quota: estimate.quota,
        usage: estimate.usage,
        available: estimate.quota - estimate.usage,
        quotaGB: (estimate.quota / 1024 / 1024 / 1024).toFixed(2),
        usageGB: (estimate.usage / 1024 / 1024 / 1024).toFixed(2),
        availableGB: ((estimate.quota - estimate.usage) / 1024 / 1024 / 1024).toFixed(2),
        usagePercentage: ((estimate.usage / estimate.quota) * 100).toFixed(1)
      };
    } catch (error) {
      console.error('خطأ في فحص حجم قاعدة البيانات:', error);
      return null;
    }
  }

  // ترحيل البيانات من localStorage إلى IndexedDB
  async migrateFromLocalStorage() {
    console.log('🔄 بدء ترحيل البيانات من localStorage إلى IndexedDB...');

    try {
      // ترحيل المستفيدين
      const beneficiaries = JSON.parse(localStorage.getItem('beneficiaries') || '[]');
      if (beneficiaries.length > 0) {
        // فصل الصور عن البيانات الأساسية
        const beneficiariesData = [];
        const imagesData = [];

        beneficiaries.forEach(beneficiary => {
          const { spouseIdImage, wifeIdImage, ...basicData } = beneficiary;
          
          beneficiariesData.push(basicData);

          if (spouseIdImage) {
            imagesData.push({
              id: `${beneficiary.id}_spouse`,
              beneficiaryId: beneficiary.id,
              type: 'spouseIdImage',
              data: spouseIdImage,
              createdAt: new Date().toISOString()
            });
          }

          if (wifeIdImage) {
            imagesData.push({
              id: `${beneficiary.id}_wife`,
              beneficiaryId: beneficiary.id,
              type: 'wifeIdImage',
              data: wifeIdImage,
              createdAt: new Date().toISOString()
            });
          }
        });

        await this.saveData('beneficiaries', beneficiariesData);
        if (imagesData.length > 0) {
          await this.saveData('images', imagesData);
        }
        console.log(`✅ تم ترحيل ${beneficiariesData.length} مستفيد و ${imagesData.length} صورة`);
      }

      // ترحيل المعاملات
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      if (transactions.length > 0) {
        await this.saveData('transactions', transactions);
        console.log(`✅ تم ترحيل ${transactions.length} معاملة مالية`);
      }

      // ترحيل الكشفات
      const sheets = JSON.parse(localStorage.getItem('sheets') || '[]');
      if (sheets.length > 0) {
        await this.saveData('sheets', sheets);
        console.log(`✅ تم ترحيل ${sheets.length} كشف`);
      }

      // ترحيل الإعدادات
      const settings = JSON.parse(localStorage.getItem('settings') || '{}');
      if (Object.keys(settings).length > 0) {
        const settingsArray = Object.entries(settings).map(([key, value]) => ({
          key,
          value
        }));
        await this.saveData('settings', settingsArray);
        console.log(`✅ تم ترحيل ${settingsArray.length} إعداد`);
      }

      console.log('🎉 تم ترحيل جميع البيانات بنجاح!');
      return true;
    } catch (error) {
      console.error('❌ خطأ في ترحيل البيانات:', error);
      return false;
    }
  }
}

// إنشاء مثيل واحد للاستخدام في التطبيق
export const dbManager = new IndexedDBManager();

// دوال مساعدة للاستخدام السهل
export const saveToIndexedDB = (storeName, data) => dbManager.saveData(storeName, data);
export const getFromIndexedDB = (storeName, id = null) => 
  id ? dbManager.getData(storeName, id) : dbManager.getAllData(storeName);
export const deleteFromIndexedDB = (storeName, id) => dbManager.deleteData(storeName, id);
export const getDatabaseInfo = () => dbManager.getDatabaseSize();
export const migrateData = () => dbManager.migrateFromLocalStorage();
