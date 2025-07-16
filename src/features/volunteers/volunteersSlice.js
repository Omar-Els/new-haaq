import { createSlice } from '@reduxjs/toolkit';
import cloudSync from '../../services/cloudSync';

/**
 * Volunteers Slice
 * 
 * إدارة حالة المتطوعين في التطبيق
 */

const initialState = {
  volunteers: [],
  loading: false,
  error: null,
  searchTerm: '',
  filterBy: 'all', // all, active, inactive, new
  sortBy: 'name', // name, joinDate, department, status
  sortOrder: 'asc' // asc, desc
};

const volunteersSlice = createSlice({
  name: 'volunteers',
  initialState,
  reducers: {
    // إضافة متطوع جديد
    addVolunteer: (state, action) => {
      const newVolunteer = {
        id: Date.now().toString(),
        ...action.payload,
        joinDate: new Date().toISOString(),
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      state.volunteers.push(newVolunteer);

      // حفظ في localStorage
      try {
        localStorage.setItem('volunteers', JSON.stringify(state.volunteers));
        // تحديد للمزامنة السحابية
        cloudSync.markForSync('volunteers');
      } catch (error) {
        console.error('خطأ في حفظ المتطوعين:', error);
      }
    },

    // تحديث بيانات متطوع
    updateVolunteer: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.volunteers.findIndex(volunteer => volunteer.id === id);
      if (index !== -1) {
        state.volunteers[index] = {
          ...state.volunteers[index],
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
    },

    // حذف متطوع
    deleteVolunteer: (state, action) => {
      state.volunteers = state.volunteers.filter(
        volunteer => volunteer.id !== action.payload
      );
    },

    // حذف متطوعين متعددين
    deleteMultipleVolunteers: (state, action) => {
      state.volunteers = state.volunteers.filter(
        volunteer => !action.payload.includes(volunteer.id)
      );
    },

    // تحديث حالة متطوع
    updateVolunteerStatus: (state, action) => {
      const { id, status } = action.payload;
      const volunteer = state.volunteers.find(v => v.id === id);
      if (volunteer) {
        volunteer.status = status;
        volunteer.updatedAt = new Date().toISOString();
      }
    },

    // تعيين البحث
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },

    // تعيين الفلتر
    setFilterBy: (state, action) => {
      state.filterBy = action.payload;
    },

    // تعيين الترتيب
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },

    // تعيين اتجاه الترتيب
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },

    // تحميل المتطوعين من localStorage
    loadVolunteers: (state) => {
      try {
        const savedVolunteers = localStorage.getItem('volunteers');
        if (savedVolunteers) {
          state.volunteers = JSON.parse(savedVolunteers);
        }
      } catch (error) {
        console.error('خطأ في تحميل المتطوعين:', error);
        state.error = 'فشل في تحميل بيانات المتطوعين';
      }
    },

    // حفظ المتطوعين في localStorage
    saveVolunteers: (state) => {
      try {
        localStorage.setItem('volunteers', JSON.stringify(state.volunteers));
        // تحديد للمزامنة السحابية
        cloudSync.markForSync('volunteers');
      } catch (error) {
        console.error('خطأ في حفظ المتطوعين:', error);
        state.error = 'فشل في حفظ بيانات المتطوعين';
      }
    },

    // مسح جميع المتطوعين
    clearAllVolunteers: (state) => {
      state.volunteers = [];
      localStorage.removeItem('volunteers');
    },

    // تعيين حالة التحميل
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // تعيين رسالة الخطأ
    setError: (state, action) => {
      state.error = action.payload;
    },

    // مسح رسالة الخطأ
    clearError: (state) => {
      state.error = null;
    },

    // استيراد متطوعين من ملف
    importVolunteers: (state, action) => {
      const importedVolunteers = action.payload.map(volunteer => ({
        ...volunteer,
        id: volunteer.id || Date.now().toString() + Math.random(),
        joinDate: volunteer.joinDate || new Date().toISOString(),
        status: volunteer.status || 'active',
        createdAt: volunteer.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      state.volunteers = [...state.volunteers, ...importedVolunteers];
    }
  }
});

// Actions
export const {
  addVolunteer,
  updateVolunteer,
  deleteVolunteer,
  deleteMultipleVolunteers,
  updateVolunteerStatus,
  setSearchTerm,
  setFilterBy,
  setSortBy,
  setSortOrder,
  loadVolunteers,
  saveVolunteers,
  clearAllVolunteers,
  setLoading,
  setError,
  clearError,
  importVolunteers
} = volunteersSlice.actions;

// Selectors
export const selectAllVolunteers = (state) => state.volunteers.volunteers;
export const selectVolunteersLoading = (state) => state.volunteers.loading;
export const selectVolunteersError = (state) => state.volunteers.error;
export const selectVolunteersSearchTerm = (state) => state.volunteers.searchTerm;
export const selectVolunteersFilterBy = (state) => state.volunteers.filterBy;
export const selectVolunteersSortBy = (state) => state.volunteers.sortBy;
export const selectVolunteersSortOrder = (state) => state.volunteers.sortOrder;

// Filtered and sorted volunteers selector
export const selectFilteredVolunteers = (state) => {
  const { volunteers, searchTerm, filterBy, sortBy, sortOrder } = state.volunteers;
  
  let filtered = volunteers;

  // تطبيق البحث
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(volunteer =>
      volunteer.name?.toLowerCase().includes(term) ||
      volunteer.email?.toLowerCase().includes(term) ||
      volunteer.phone?.includes(term) ||
      volunteer.department?.toLowerCase().includes(term) ||
      volunteer.skills?.some(skill => skill.toLowerCase().includes(term))
    );
  }

  // تطبيق الفلتر
  if (filterBy !== 'all') {
    filtered = filtered.filter(volunteer => {
      switch (filterBy) {
        case 'active':
          return volunteer.status === 'active';
        case 'inactive':
          return volunteer.status === 'inactive';
        case 'new':
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          return new Date(volunteer.joinDate) > oneWeekAgo;
        default:
          return true;
      }
    });
  }

  // تطبيق الترتيب
  filtered.sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // معالجة خاصة للتواريخ
    if (sortBy === 'joinDate' || sortBy === 'createdAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    // معالجة خاصة للنصوص
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });

  return filtered;
};

// Statistics selectors
export const selectVolunteersStats = (state) => {
  const volunteers = state.volunteers.volunteers;
  
  return {
    total: volunteers.length,
    active: volunteers.filter(v => v.status === 'active').length,
    inactive: volunteers.filter(v => v.status === 'inactive').length,
    new: volunteers.filter(v => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(v.joinDate) > oneWeekAgo;
    }).length,
    departments: [...new Set(volunteers.map(v => v.department).filter(Boolean))].length
  };
};

export default volunteersSlice.reducer;
