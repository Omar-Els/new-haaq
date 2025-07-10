// Offline Service - خدمة العمل بدون اتصال
// هذه الخدمة تحاكي MongoDB محلياً حتى يتم إعداد الخادم

class OfflineService {
  constructor() {
    this.storageKey = 'elhaq_offline_data';
    this.initializeStorage();
  }

  // تهيئة التخزين المحلي
  initializeStorage() {
    const existingData = localStorage.getItem(this.storageKey);
    if (!existingData) {
      const initialData = {
        beneficiaries: [],
        transactions: [],
        files: [],
        lastUpdate: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(initialData));
      console.log('🔧 تم تهيئة التخزين المحلي للوضع غير المتصل');
    }
  }

  // جلب البيانات من التخزين المحلي
  getData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : { beneficiaries: [], transactions: [], files: [] };
    } catch (error) {
      console.error('خطأ في جلب البيانات المحلية:', error);
      return { beneficiaries: [], transactions: [], files: [] };
    }
  }

  // حفظ البيانات في التخزين المحلي
  saveData(data) {
    try {
      const updatedData = {
        ...data,
        lastUpdate: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(updatedData));
      console.log('💾 تم حفظ البيانات محلياً');
      return true;
    } catch (error) {
      console.error('خطأ في حفظ البيانات المحلية:', error);
      return false;
    }
  }

  // ==================== المستفيدين ====================
  
  // جلب المستفيدين مع pagination
  async getBeneficiaries(page = 1, limit = 50, search = '') {
    try {
      const data = this.getData();
      let beneficiaries = data.beneficiaries || [];

      // تطبيق البحث إذا وجد
      if (search) {
        beneficiaries = beneficiaries.filter(b => 
          b.name?.toLowerCase().includes(search.toLowerCase()) ||
          b.nationalId?.includes(search) ||
          b.phone?.includes(search)
        );
      }

      // تطبيق pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = beneficiaries.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        totalCount: beneficiaries.length,
        currentPage: page,
        totalPages: Math.ceil(beneficiaries.length / limit),
        offline: true
      };
    } catch (error) {
      console.error('خطأ في جلب المستفيدين محلياً:', error);
      return { data: [], totalCount: 0, currentPage: 1, totalPages: 1, error: error.message };
    }
  }

  // إضافة مستفيد جديد
  async addBeneficiary(beneficiaryData) {
    try {
      const data = this.getData();
      
      const newBeneficiary = {
        ...beneficiaryData,
        _id: Date.now().toString(),
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      data.beneficiaries = data.beneficiaries || [];
      data.beneficiaries.unshift(newBeneficiary); // إضافة في المقدمة

      if (this.saveData(data)) {
        console.log('✅ تم إضافة المستفيد محلياً:', newBeneficiary.name);
        return newBeneficiary;
      } else {
        throw new Error('فشل في حفظ المستفيد محلياً');
      }
    } catch (error) {
      console.error('خطأ في إضافة المستفيد محلياً:', error);
      throw error;
    }
  }

  // تحديث مستفيد
  async updateBeneficiary(id, beneficiaryData) {
    try {
      const data = this.getData();
      const beneficiaries = data.beneficiaries || [];
      
      const index = beneficiaries.findIndex(b => b._id === id || b.id === id);
      if (index === -1) {
        throw new Error('المستفيد غير موجود');
      }

      beneficiaries[index] = {
        ...beneficiaries[index],
        ...beneficiaryData,
        updatedAt: new Date().toISOString()
      };

      data.beneficiaries = beneficiaries;
      
      if (this.saveData(data)) {
        console.log('✅ تم تحديث المستفيد محلياً');
        return beneficiaries[index];
      } else {
        throw new Error('فشل في تحديث المستفيد محلياً');
      }
    } catch (error) {
      console.error('خطأ في تحديث المستفيد محلياً:', error);
      throw error;
    }
  }

  // حذف مستفيد
  async deleteBeneficiary(id) {
    try {
      const data = this.getData();
      const beneficiaries = data.beneficiaries || [];
      
      const filteredBeneficiaries = beneficiaries.filter(b => b._id !== id && b.id !== id);
      
      if (filteredBeneficiaries.length === beneficiaries.length) {
        throw new Error('المستفيد غير موجود');
      }

      data.beneficiaries = filteredBeneficiaries;
      
      if (this.saveData(data)) {
        console.log('✅ تم حذف المستفيد محلياً');
        return { success: true };
      } else {
        throw new Error('فشل في حذف المستفيد محلياً');
      }
    } catch (error) {
      console.error('خطأ في حذف المستفيد محلياً:', error);
      throw error;
    }
  }

  // ==================== المعاملات المالية ====================
  
  // جلب المعاملات المالية
  async getTransactions(page = 1, limit = 100, filters = {}) {
    try {
      const data = this.getData();
      let transactions = data.transactions || [];

      // تطبيق الفلاتر
      if (filters.type) {
        transactions = transactions.filter(t => t.type === filters.type);
      }
      if (filters.dateFrom) {
        transactions = transactions.filter(t => new Date(t.createdAt) >= new Date(filters.dateFrom));
      }
      if (filters.dateTo) {
        transactions = transactions.filter(t => new Date(t.createdAt) <= new Date(filters.dateTo));
      }

      // ترتيب حسب التاريخ (الأحدث أولاً)
      transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // تطبيق pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = transactions.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        totalCount: transactions.length,
        currentPage: page,
        totalPages: Math.ceil(transactions.length / limit),
        offline: true
      };
    } catch (error) {
      console.error('خطأ في جلب المعاملات محلياً:', error);
      return { data: [], totalCount: 0, currentPage: 1, totalPages: 1, error: error.message };
    }
  }

  // إضافة معاملة مالية
  async addTransaction(transactionData) {
    try {
      const data = this.getData();
      
      const newTransaction = {
        ...transactionData,
        _id: Date.now().toString(),
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };

      data.transactions = data.transactions || [];
      data.transactions.unshift(newTransaction); // إضافة في المقدمة

      if (this.saveData(data)) {
        console.log('✅ تم إضافة المعاملة محلياً');
        return newTransaction;
      } else {
        throw new Error('فشل في حفظ المعاملة محلياً');
      }
    } catch (error) {
      console.error('خطأ في إضافة المعاملة محلياً:', error);
      throw error;
    }
  }

  // ==================== الإحصائيات ====================
  
  // جلب الإحصائيات العامة
  async getStatistics() {
    try {
      const data = this.getData();
      const beneficiaries = data.beneficiaries || [];
      const transactions = data.transactions || [];

      const stats = {
        totalBeneficiaries: beneficiaries.length,
        totalTransactions: transactions.length,
        totalIncome: transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0),
        totalExpenses: transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0),
        offline: true,
        lastUpdate: data.lastUpdate
      };

      return stats;
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات محلياً:', error);
      return {
        totalBeneficiaries: 0,
        totalTransactions: 0,
        totalIncome: 0,
        totalExpenses: 0,
        error: error.message
      };
    }
  }

  // تنظيف البيانات المحلية
  clearOfflineData() {
    try {
      localStorage.removeItem(this.storageKey);
      this.initializeStorage();
      console.log('🧹 تم تنظيف البيانات المحلية');
      return true;
    } catch (error) {
      console.error('خطأ في تنظيف البيانات المحلية:', error);
      return false;
    }
  }

  // تصدير البيانات المحلية
  exportOfflineData() {
    try {
      const data = this.getData();
      const exportData = {
        ...data,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `elhaq-offline-data-${new Date().toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('📤 تم تصدير البيانات المحلية');
      return true;
    } catch (error) {
      console.error('خطأ في تصدير البيانات المحلية:', error);
      return false;
    }
  }
}

// إنشاء مثيل واحد للاستخدام
export const offlineService = new OfflineService();
export default offlineService;
