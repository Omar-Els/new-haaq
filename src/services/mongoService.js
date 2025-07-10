// MongoDB Service - خدمة قاعدة البيانات الرئيسية
class MongoService {
  constructor() {
    // استخدام متغيرات Vite بدلاً من process.env
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    this.token = localStorage.getItem('authToken');
  }

  // إعداد headers للطلبات
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': this.token ? `Bearer ${this.token}` : ''
    };
  }

  // إعداد headers للملفات
  getFileHeaders() {
    return {
      'Authorization': this.token ? `Bearer ${this.token}` : ''
    };
  }

  // معالجة الاستجابات
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // ==================== المستفيدين ====================
  
  // جلب جميع المستفيدين مع pagination
  async getBeneficiaries(page = 1, limit = 50, search = '') {
    try {
      // مؤقت<|im_start|>: محاكاة البيانات حتى يتم إعداد الخادم
      console.log('🔄 محاكاة جلب المستفيدين من MongoDB...');

      // إرجاع بيانات وهمية للاختبار
      const mockData = {
        data: [],
        totalCount: 0,
        currentPage: page,
        totalPages: 1,
        message: 'لا يوجد خادم MongoDB متصل حالياً. يتم استخدام البيانات المحلية.'
      };

      return mockData;

      // الكود الحقيقي (سيتم تفعيله عند إعداد الخادم):
      /*
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search
      });

      const response = await fetch(`${this.baseURL}/beneficiaries?${params}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return this.handleResponse(response);
      */
    } catch (error) {
      console.error('خطأ في جلب المستفيدين:', error);

      // إرجاع بيانات فارغة في حالة الخطأ
      return {
        data: [],
        totalCount: 0,
        currentPage: page,
        totalPages: 1,
        error: error.message
      };
    }
  }

  // إضافة مستفيد جديد
  async addBeneficiary(beneficiaryData) {
    try {
      // مؤقت<|im_start|>: محاكاة إضافة المستفيد
      console.log('🔄 محاكاة إضافة مستفيد إلى MongoDB...');

      // إنشاء مستفيد وهمي مع ID
      const mockBeneficiary = {
        ...beneficiaryData,
        _id: Date.now().toString(),
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('✅ تم إنشاء مستفيد وهمي:', mockBeneficiary.name);
      return mockBeneficiary;

      // الكود الحقيقي (سيتم تفعيله عند إعداد الخادم):
      /*
      const response = await fetch(`${this.baseURL}/beneficiaries`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(beneficiaryData)
      });

      return this.handleResponse(response);
      */
    } catch (error) {
      console.error('خطأ في إضافة المستفيد:', error);
      throw error;
    }
  }

  // تحديث مستفيد
  async updateBeneficiary(id, beneficiaryData) {
    try {
      const response = await fetch(`${this.baseURL}/beneficiaries/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(beneficiaryData)
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('خطأ في تحديث المستفيد:', error);
      throw error;
    }
  }

  // حذف مستفيد
  async deleteBeneficiary(id) {
    try {
      const response = await fetch(`${this.baseURL}/beneficiaries/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('خطأ في حذف المستفيد:', error);
      throw error;
    }
  }

  // ==================== نظام تحفيظ القرآن ====================
  
  // جلب جميع بيانات القرآن
  async getQuranData() {
    try {
      console.log('🔄 محاكاة جلب بيانات القرآن من MongoDB...');
      
      // إرجاع بيانات وهمية للاختبار
      const mockData = {
        success: true,
        data: {
          students: [],
          teachers: [],
          competitions: [],
          levels: [],
          settings: {},
          subscriptions: []
        },
        message: 'لا يوجد خادم MongoDB متصل حالياً. يتم استخدام البيانات المحلية.'
      };

      return mockData;
    } catch (error) {
      console.error('خطأ في جلب بيانات القرآن:', error);
      throw error;
    }
  }

  // إضافة طالب قرآن
  async addQuranStudent(studentData) {
    try {
      console.log('🔄 محاكاة إضافة طالب قرآن إلى MongoDB...');
      
      const mockStudent = {
        ...studentData,
        _id: Date.now().toString(),
        id: studentData.id || Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('✅ تم إنشاء طالب قرآن وهمي:', mockStudent.name);
      return mockStudent;
    } catch (error) {
      console.error('خطأ في إضافة طالب القرآن:', error);
      throw error;
    }
  }

  // إضافة معلمة قرآن
  async addQuranTeacher(teacherData) {
    try {
      console.log('🔄 محاكاة إضافة معلمة قرآن إلى MongoDB...');
      
      const mockTeacher = {
        ...teacherData,
        _id: Date.now().toString(),
        id: teacherData.id || Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('✅ تم إنشاء معلمة قرآن وهمية:', mockTeacher.name);
      return mockTeacher;
    } catch (error) {
      console.error('خطأ في إضافة معلمة القرآن:', error);
      throw error;
    }
  }

  // إنشاء مسابقة قرآن
  async addQuranCompetition(competitionData) {
    try {
      console.log('🔄 محاكاة إنشاء مسابقة قرآن في MongoDB...');
      
      const mockCompetition = {
        ...competitionData,
        _id: Date.now().toString(),
        id: competitionData.id || Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('✅ تم إنشاء مسابقة قرآن وهمية:', mockCompetition.title);
      return mockCompetition;
    } catch (error) {
      console.error('خطأ في إنشاء مسابقة القرآن:', error);
      throw error;
    }
  }

  // تحديث إعدادات القرآن
  async updateQuranSettings(settings) {
    try {
      console.log('🔄 محاكاة تحديث إعدادات القرآن في MongoDB...');
      
      const mockSettings = {
        ...settings,
        updatedAt: new Date().toISOString()
      };

      console.log('✅ تم تحديث إعدادات القرآن وهمياً');
      return mockSettings;
    } catch (error) {
      console.error('خطأ في تحديث إعدادات القرآن:', error);
      throw error;
    }
  }

  // ==================== المعاملات المالية ====================
  
  // جلب المعاملات المالية
  async getTransactions(page = 1, limit = 100, filters = {}) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      const response = await fetch(`${this.baseURL}/transactions?${params}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('خطأ في جلب المعاملات:', error);
      throw error;
    }
  }

  // إضافة معاملة مالية
  async addTransaction(transactionData) {
    try {
      const response = await fetch(`${this.baseURL}/transactions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(transactionData)
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('خطأ في إضافة المعاملة:', error);
      throw error;
    }
  }

  // تحديث معاملة مالية
  async updateTransaction(id, transactionData) {
    try {
      const response = await fetch(`${this.baseURL}/transactions/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(transactionData)
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('خطأ في تحديث المعاملة:', error);
      throw error;
    }
  }

  // حذف معاملة مالية
  async deleteTransaction(id) {
    try {
      const response = await fetch(`${this.baseURL}/transactions/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('خطأ في حذف المعاملة:', error);
      throw error;
    }
  }

  // ==================== رفع الملفات ====================
  
  // رفع ملف (صورة/PDF/مرفق)
  async uploadFile(file, type = 'image', beneficiaryId = null) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      if (beneficiaryId) {
        formData.append('beneficiaryId', beneficiaryId);
      }

      const response = await fetch(`${this.baseURL}/upload`, {
        method: 'POST',
        headers: this.getFileHeaders(),
        body: formData
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('خطأ في رفع الملف:', error);
      throw error;
    }
  }

  // حذف ملف
  async deleteFile(fileId) {
    try {
      const response = await fetch(`${this.baseURL}/files/${fileId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('خطأ في حذف الملف:', error);
      throw error;
    }
  }

  // ==================== الإحصائيات ====================
  
  // جلب الإحصائيات العامة
  async getStatistics() {
    try {
      const response = await fetch(`${this.baseURL}/statistics`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error);
      throw error;
    }
  }

  // ==================== التقارير ====================
  
  // جلب تقرير مفصل
  async getReport(type, filters = {}) {
    try {
      const params = new URLSearchParams({
        type,
        ...filters
      });

      const response = await fetch(`${this.baseURL}/reports?${params}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('خطأ في جلب التقرير:', error);
      throw error;
    }
  }

  // ==================== المصادقة ====================
  
  // تسجيل الدخول
  async login(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const result = await this.handleResponse(response);
      
      if (result.token) {
        localStorage.setItem('authToken', result.token);
        this.token = result.token;
      }

      return result;
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      throw error;
    }
  }

  // تسجيل الخروج
  async logout() {
    try {
      await fetch(`${this.baseURL}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      localStorage.removeItem('authToken');
      this.token = null;
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  }
}

// إنشاء مثيل واحد للاستخدام في التطبيق
export const mongoService = new MongoService();

// دوال مساعدة للاستخدام السهل
export const getBeneficiaries = (page, limit, search) => mongoService.getBeneficiaries(page, limit, search);
export const addBeneficiary = (data) => mongoService.addBeneficiary(data);
export const updateBeneficiary = (id, data) => mongoService.updateBeneficiary(id, data);
export const deleteBeneficiary = (id) => mongoService.deleteBeneficiary(id);

export const getTransactions = (page, limit, filters) => mongoService.getTransactions(page, limit, filters);
export const addTransaction = (data) => mongoService.addTransaction(data);
export const updateTransaction = (id, data) => mongoService.updateTransaction(id, data);
export const deleteTransaction = (id) => mongoService.deleteTransaction(id);

export const uploadFile = (file, type, beneficiaryId) => mongoService.uploadFile(file, type, beneficiaryId);
export const deleteFile = (fileId) => mongoService.deleteFile(fileId);

export const getStatistics = () => mongoService.getStatistics();
export const getReport = (type, filters) => mongoService.getReport(type, filters);

// Quran functions
export const getQuranData = () => mongoService.getQuranData();
export const addQuranStudent = (data) => mongoService.addQuranStudent(data);
export const addQuranTeacher = (data) => mongoService.addQuranTeacher(data);
export const addQuranCompetition = (data) => mongoService.addQuranCompetition(data);
export const updateQuranSettings = (data) => mongoService.updateQuranSettings(data);

export default mongoService;
