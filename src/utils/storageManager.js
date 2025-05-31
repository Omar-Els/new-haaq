// Storage Manager - إدارة مساحة التخزين المحلي
export class StorageManager {
  
  // فحص مساحة التخزين المتاحة
  static getStorageInfo() {
    try {
      const test = 'test';
      let totalSize = 0;
      let usedSize = 0;
      
      // حساب المساحة المستخدمة
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          usedSize += localStorage[key].length + key.length;
        }
      }
      
      // محاولة تقدير المساحة الإجمالية
      try {
        let i = 0;
        while (true) {
          localStorage.setItem('test_' + i, test.repeat(1000));
          i++;
          if (i > 1000) break; // حد أقصى للأمان
        }
      } catch (e) {
        totalSize = i * 1000 * test.length + usedSize;
        // تنظيف البيانات التجريبية
        for (let j = 0; j < i; j++) {
          localStorage.removeItem('test_' + j);
        }
      }
      
      return {
        used: usedSize,
        total: totalSize,
        available: totalSize - usedSize,
        usedMB: (usedSize / 1024 / 1024).toFixed(2),
        totalMB: (totalSize / 1024 / 1024).toFixed(2),
        availableMB: ((totalSize - usedSize) / 1024 / 1024).toFixed(2),
        usagePercentage: ((usedSize / totalSize) * 100).toFixed(1)
      };
    } catch (error) {
      console.error('خطأ في فحص مساحة التخزين:', error);
      return null;
    }
  }
  
  // عرض معلومات التخزين
  static displayStorageInfo() {
    const info = this.getStorageInfo();
    if (info) {
      console.log('📊 معلومات مساحة التخزين:');
      console.log(`💾 المساحة المستخدمة: ${info.usedMB} MB`);
      console.log(`📦 المساحة الإجمالية: ${info.totalMB} MB`);
      console.log(`🆓 المساحة المتاحة: ${info.availableMB} MB`);
      console.log(`📈 نسبة الاستخدام: ${info.usagePercentage}%`);
      
      if (info.usagePercentage > 80) {
        console.warn('⚠️ تحذير: مساحة التخزين ممتلئة تقريباً!');
      }
    }
    return info;
  }
  
  // تنظيف البيانات غير الضرورية
  static cleanupStorage() {
    console.log('🧹 بدء تنظيف مساحة التخزين...');
    
    const itemsToClean = [
      'notifications',
      'ui',
      'beneficiaries_backup',
      'transactions_backup',
      'temp_data',
      'cache_data',
      'old_settings'
    ];
    
    let cleanedSize = 0;
    itemsToClean.forEach(item => {
      const data = localStorage.getItem(item);
      if (data) {
        cleanedSize += data.length;
        localStorage.removeItem(item);
        console.log(`🗑️ تم حذف: ${item}`);
      }
    });
    
    const cleanedMB = (cleanedSize / 1024 / 1024).toFixed(2);
    console.log(`✅ تم تنظيف ${cleanedMB} MB من البيانات غير الضرورية`);
    
    return cleanedSize;
  }
  
  // ضغط البيانات الكبيرة
  static compressLargeData() {
    console.log('🗜️ ضغط البيانات الكبيرة...');
    
    // ضغط بيانات المستفيدين
    const beneficiaries = localStorage.getItem('beneficiaries');
    if (beneficiaries) {
      try {
        const data = JSON.parse(beneficiaries);
        if (data.length > 100) {
          const compressed = data.slice(0, 100).map(b => ({
            id: b.id,
            name: b.name,
            nationalId: b.nationalId,
            beneficiaryId: b.beneficiaryId,
            phone: b.phone,
            address: b.address,
            income: b.income,
            familyMembers: b.familyMembers,
            maritalStatus: b.maritalStatus,
            priority: b.priority,
            createdAt: b.createdAt
          }));
          
          localStorage.setItem('beneficiaries', JSON.stringify(compressed));
          console.log(`🗜️ تم ضغط بيانات المستفيدين من ${data.length} إلى ${compressed.length}`);
        }
      } catch (error) {
        console.error('خطأ في ضغط بيانات المستفيدين:', error);
      }
    }
    
    // ضغط المعاملات المالية
    const transactions = localStorage.getItem('transactions');
    if (transactions) {
      try {
        const data = JSON.parse(transactions);
        if (data.length > 500) {
          const compressed = data
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 500);
          
          localStorage.setItem('transactions', JSON.stringify(compressed));
          console.log(`🗜️ تم ضغط المعاملات المالية من ${data.length} إلى ${compressed.length}`);
        }
      } catch (error) {
        console.error('خطأ في ضغط المعاملات المالية:', error);
      }
    }
  }
  
  // تصدير البيانات قبل الحذف
  static exportDataBeforeCleanup() {
    console.log('📤 تصدير البيانات للنسخ الاحتياطي...');
    
    const exportData = {
      beneficiaries: localStorage.getItem('beneficiaries'),
      transactions: localStorage.getItem('transactions'),
      settings: localStorage.getItem('settings'),
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // إنشاء رابط تحميل
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `elhaq-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    // تحميل الملف
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('✅ تم تصدير البيانات بنجاح');
    return exportData;
  }
  
  // تنظيف شامل مع النسخ الاحتياطي
  static performFullCleanup() {
    console.log('🚀 بدء التنظيف الشامل...');
    
    // عرض معلومات التخزين قبل التنظيف
    const beforeInfo = this.displayStorageInfo();
    
    // تصدير البيانات
    this.exportDataBeforeCleanup();
    
    // تنظيف البيانات غير الضرورية
    this.cleanupStorage();
    
    // ضغط البيانات الكبيرة
    this.compressLargeData();
    
    // عرض معلومات التخزين بعد التنظيف
    console.log('📊 معلومات التخزين بعد التنظيف:');
    const afterInfo = this.displayStorageInfo();
    
    if (beforeInfo && afterInfo) {
      const savedMB = (beforeInfo.used - afterInfo.used) / 1024 / 1024;
      console.log(`🎉 تم توفير ${savedMB.toFixed(2)} MB من مساحة التخزين`);
    }
    
    return afterInfo;
  }
  
  // فحص دوري لمساحة التخزين
  static startStorageMonitoring() {
    setInterval(() => {
      const info = this.getStorageInfo();
      if (info && info.usagePercentage > 90) {
        console.warn('🚨 تحذير: مساحة التخزين ممتلئة تقريباً! يُنصح بالتنظيف.');
        
        // تنظيف تلقائي إذا كانت المساحة ممتلئة جداً
        if (info.usagePercentage > 95) {
          console.log('🤖 تنظيف تلقائي...');
          this.cleanupStorage();
          this.compressLargeData();
        }
      }
    }, 60000); // فحص كل دقيقة
  }
}

// تصدير دوال مساعدة
export const getStorageInfo = () => StorageManager.getStorageInfo();
export const cleanupStorage = () => StorageManager.cleanupStorage();
export const performFullCleanup = () => StorageManager.performFullCleanup();
