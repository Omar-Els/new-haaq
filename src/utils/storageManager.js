// Storage Manager - إدارة مساحة التخزين المحلي
export class StorageManager {
  
  // فحص مساحة التخزين المتاحة
  static getStorageInfo() {
    try {
      let usedSize = 0;

      // حساب المساحة المستخدمة
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          usedSize += localStorage[key].length + key.length;
        }
      }

      // تقدير المساحة الإجمالية (عادة 5-10 MB)
      let totalSize = 5 * 1024 * 1024; // افتراض 5MB كحد أدنى

      // محاولة تقدير المساحة الإجمالية بطريقة آمنة
      try {
        const testKey = 'storage_test_';
        const testData = 'x'.repeat(1024); // 1KB
        let testSize = 0;
        let testCount = 0;

        // اختبار تدريجي للمساحة
        for (let i = 0; i < 5000; i++) {
          try {
            localStorage.setItem(testKey + i, testData);
            testSize += testData.length + (testKey + i).length;
            testCount = i;
          } catch (e) {
            // وصلنا للحد الأقصى
            totalSize = usedSize + testSize;
            break;
          }
        }

        // تنظيف البيانات التجريبية
        for (let i = 0; i <= testCount; i++) {
          localStorage.removeItem(testKey + i);
        }
      } catch (error) {
        console.warn('لا يمكن تقدير المساحة الإجمالية، استخدام القيمة الافتراضية');
      }

      return {
        used: usedSize,
        total: totalSize,
        available: Math.max(0, totalSize - usedSize),
        usedMB: (usedSize / 1024 / 1024).toFixed(2),
        totalMB: (totalSize / 1024 / 1024).toFixed(2),
        availableMB: (Math.max(0, totalSize - usedSize) / 1024 / 1024).toFixed(2),
        usagePercentage: totalSize > 0 ? ((usedSize / totalSize) * 100).toFixed(1) : '0'
      };
    } catch (error) {
      console.error('خطأ في فحص مساحة التخزين:', error);

      // إرجاع قيم افتراضية في حالة الخطأ
      return {
        used: 0,
        total: 5242880, // 5MB
        available: 5242880,
        usedMB: '0.00',
        totalMB: '5.00',
        availableMB: '5.00',
        usagePercentage: '0'
      };
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
    // فحص فوري عند البدء
    this.checkAndCleanIfNeeded();

    setInterval(() => {
      this.checkAndCleanIfNeeded();
    }, 30000); // فحص كل 30 ثانية
  }

  // فحص وتنظيف إذا لزم الأمر
  static checkAndCleanIfNeeded() {
    const info = this.getStorageInfo();
    if (info && info.usagePercentage > 80) {
      console.warn('🚨 تحذير: مساحة التخزين ممتلئة تقريباً! يُنصح بالتنظيف.');

      // تنظيف تلقائي إذا كانت المساحة ممتلئة جداً
      if (info.usagePercentage > 90) {
        console.log('🤖 بدء التنظيف التلقائي...');
        this.performEmergencyCleanup();
      }
    }
  }

  // تنظيف طارئ للمساحة
  static performEmergencyCleanup() {
    try {
      console.log('🚨 تنظيف طارئ للمساحة...');

      // 1. حذف البيانات غير الضرورية
      const itemsToDelete = [
        'notifications',
        'ui',
        'beneficiaries_backup',
        'transactions_backup',
        'temp_data',
        'cache_data',
        'old_settings',
        'redux-persist:root'
      ];

      itemsToDelete.forEach(item => {
        if (localStorage.getItem(item)) {
          localStorage.removeItem(item);
          console.log(`🗑️ تم حذف: ${item}`);
        }
      });

      // 2. ضغط بيانات المستفيدين
      const beneficiaries = localStorage.getItem('beneficiaries');
      if (beneficiaries) {
        try {
          const data = JSON.parse(beneficiaries);
          if (Array.isArray(data) && data.length > 50) {
            // الاحتفاظ بآخر 50 مستفيد فقط
            const recent = data
              .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
              .slice(0, 50)
              .map(b => ({
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

            localStorage.setItem('beneficiaries', JSON.stringify(recent));
            console.log(`🗜️ تم ضغط بيانات المستفيدين من ${data.length} إلى ${recent.length}`);
          }
        } catch (error) {
          console.error('خطأ في ضغط بيانات المستفيدين:', error);
        }
      }

      // 3. ضغط المعاملات المالية
      const transactions = localStorage.getItem('transactions');
      if (transactions) {
        try {
          const data = JSON.parse(transactions);
          if (Array.isArray(data) && data.length > 200) {
            // الاحتفاظ بآخر 200 معاملة فقط
            const recent = data
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 200);

            localStorage.setItem('transactions', JSON.stringify(recent));
            console.log(`🗜️ تم ضغط المعاملات المالية من ${data.length} إلى ${recent.length}`);
          }
        } catch (error) {
          console.error('خطأ في ضغط المعاملات المالية:', error);
        }
      }

      // 4. فحص النتيجة
      const afterInfo = this.getStorageInfo();
      console.log(`✅ التنظيف الطارئ مكتمل. الاستخدام الآن: ${afterInfo.usagePercentage}%`);

      // 5. اقتراح الترحيل إلى IndexedDB
      if (afterInfo.usagePercentage > 70) {
        console.log('💡 يُنصح بالترحيل إلى IndexedDB للحصول على مساحة أكبر');

        // إظهار إشعار للمستخدم
        setTimeout(() => {
          if (confirm(
            'مساحة التخزين ممتلئة!\n\n' +
            'هل تريد الترحيل إلى IndexedDB للحصول على مساحة أكبر؟\n' +
            '(سيوفر لك عدة جيجابايت من المساحة)'
          )) {
            // توجيه المستخدم لصفحة الإعدادات
            window.location.href = '/settings';
          }
        }, 2000);
      }

    } catch (error) {
      console.error('❌ خطأ في التنظيف الطارئ:', error);
    }
  }
}

// تصدير دوال مساعدة
export const getStorageInfo = () => StorageManager.getStorageInfo();
export const cleanupStorage = () => StorageManager.cleanupStorage();
export const performFullCleanup = () => StorageManager.performFullCleanup();
