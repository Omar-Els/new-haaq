// MongoDB Service - خدمة قاعدة البيانات الرئيسية
class MongoService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
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
    } catch (error) {
      console.error('خطأ في جلب المستفيدين:', error);
      throw error;
    }
  }

  // إضافة مستفيد جديد
  async addBeneficiary(beneficiaryData) {
    try {
      const response = await fetch(`${this.baseURL}/beneficiaries`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(beneficiaryData)
      });

      return this.handleResponse(response);
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

export default mongoService;
