import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { calculatePriority } from '../../utils/helpers';
import { addNotification } from '../notifications/notificationsSlice';

// Compress data by removing unnecessary fields for storage
const compressDataForStorage = (beneficiaries) => {
  return beneficiaries.map(b => {
    // Keep only essential fields, remove large data like images
    const compressed = {
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
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      monthlySupport: b.monthlySupport || [],
      initiatives: b.initiatives || [],
      notes: b.notes
    };

    // Only include image fields if they exist and are small
    if (b.spouseIdImage && b.spouseIdImage.length < 50000) { // Less than 50KB
      compressed.spouseIdImage = b.spouseIdImage;
    }
    if (b.wifeIdImage && b.wifeIdImage.length < 50000) { // Less than 50KB
      compressed.wifeIdImage = b.wifeIdImage;
    }

    return compressed;
  });
};

// Get beneficiaries from localStorage with error handling
const getBeneficiariesFromStorage = () => {
  try {
    const beneficiaries = localStorage.getItem('beneficiaries');
    if (!beneficiaries) return [];

    const parsed = JSON.parse(beneficiaries);
    console.log(`📊 تم تحميل ${parsed.length} مستفيد من localStorage`);
    return parsed;
  } catch (error) {
    console.error('❌ خطأ في تحميل بيانات المستفيدين:', error);
    // Try to recover by clearing corrupted data
    localStorage.removeItem('beneficiaries');
    return [];
  }
};

// Save beneficiaries to localStorage with compression and error handling
const saveBeneficiariesToStorage = (beneficiaries) => {
  try {
    // Compress data before saving
    const compressedData = compressDataForStorage(beneficiaries);
    const dataString = JSON.stringify(compressedData);

    // Check size before saving
    const sizeInMB = (dataString.length / 1024 / 1024).toFixed(2);
    console.log(`💾 حفظ ${beneficiaries.length} مستفيد (${sizeInMB} MB)`);

    // If data is too large, keep only recent beneficiaries
    if (dataString.length > 4 * 1024 * 1024) { // 4MB limit
      console.warn('⚠️ البيانات كبيرة جداً، سيتم الاحتفاظ بآخر 100 مستفيد فقط');
      const recentBeneficiaries = beneficiaries
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 100);

      const compressedRecent = compressDataForStorage(recentBeneficiaries);
      localStorage.setItem('beneficiaries', JSON.stringify(compressedRecent));

      // Save older data to a backup key
      const olderBeneficiaries = beneficiaries.slice(100);
      if (olderBeneficiaries.length > 0) {
        try {
          localStorage.setItem('beneficiaries_backup', JSON.stringify(compressDataForStorage(olderBeneficiaries)));
        } catch (backupError) {
          console.warn('⚠️ لا يمكن حفظ البيانات القديمة');
        }
      }
    } else {
      localStorage.setItem('beneficiaries', dataString);
    }

    console.log('✅ تم حفظ البيانات بنجاح');
  } catch (error) {
    console.error('❌ خطأ في حفظ بيانات المستفيدين:', error);

    if (error.name === 'QuotaExceededError') {
      // Clear some space and try again with reduced data
      console.warn('🧹 تنظيف localStorage لتوفير مساحة...');

      // Clear old notifications and other non-essential data
      localStorage.removeItem('notifications');
      localStorage.removeItem('ui');
      localStorage.removeItem('beneficiaries_backup');

      // Try saving with only essential data
      try {
        const essentialData = beneficiaries.slice(0, 50).map(b => ({
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

        localStorage.setItem('beneficiaries', JSON.stringify(essentialData));
        console.log('✅ تم حفظ البيانات الأساسية فقط');

        // Show user notification
        alert('تم حفظ آخر 50 مستفيد فقط بسبب امتلاء مساحة التخزين. يُنصح بتصدير البيانات.');
      } catch (finalError) {
        console.error('❌ فشل في حفظ البيانات نهائياً:', finalError);
        alert('خطأ: لا يمكن حفظ البيانات. مساحة التخزين ممتلئة.');
      }
    }
  }
};

// Check for missing fields and create notifications
const checkForMissingFields = (beneficiary, dispatch) => {
  const requiredFields = [
    { field: 'name', label: 'الاسم' },
    { field: 'nationalId', label: 'الرقم القومي' },
    { field: 'beneficiaryId', label: 'رقم المستفيد' },
    { field: 'phone', label: 'رقم الهاتف' },
    { field: 'address', label: 'العنوان' },
    { field: 'income', label: 'الدخل' },
    { field: 'familyMembers', label: 'عدد أفراد الأسرة' },
    { field: 'maritalStatus', label: 'الحالة الاجتماعية' }
  ];

  const missingFields = requiredFields.filter(({ field }) => {
    return !beneficiary[field] ||
           (typeof beneficiary[field] === 'string' && beneficiary[field].trim() === '') ||
           (field === 'income' && isNaN(Number(beneficiary[field])));
  });

  if (missingFields.length > 0) {
    const fieldNames = missingFields.map(f => f.label).join('، ');
    dispatch(addNotification({
      type: 'warning',
      message: `المستفيد ${beneficiary.name || 'الجديد'} يفتقد البيانات التالية: ${fieldNames}`,
      actionType: 'EDIT_BENEFICIARY',
      actionData: {
        beneficiaryId: beneficiary.id,
        missingFields: missingFields.map(f => f.field)
      }
    }));
    return true;
  }

  return false;
};

// Check for missing ID images and create specific notifications
const checkForMissingIDImages = (beneficiary, dispatch) => {
  // Only check married beneficiaries
  if (beneficiary.maritalStatus !== 'married') {
    return false;
  }

  const missingImages = [];

  if (!beneficiary.spouseIdImage || beneficiary.spouseIdImage.trim() === '') {
    missingImages.push({ field: 'spouseIdImage', label: 'صورة بطاقة الزوج' });
  }

  if (!beneficiary.wifeIdImage || beneficiary.wifeIdImage.trim() === '') {
    missingImages.push({ field: 'wifeIdImage', label: 'صورة بطاقة الزوجة' });
  }

  if (missingImages.length > 0) {
    const imageNames = missingImages.map(img => img.label).join(' و ');
    dispatch(addNotification({
      type: 'warning',
      message: `المستفيد ${beneficiary.name || 'المتزوج'} يفتقد ${imageNames}`,
      actionType: 'EDIT_BENEFICIARY_IMAGES',
      actionData: {
        beneficiaryId: beneficiary.id,
        missingFields: missingImages.map(img => img.field)
      }
    }));
    return true;
  }

  return false;
};

// Async thunks
export const fetchBeneficiaries = createAsyncThunk(
  'beneficiaries/fetchBeneficiaries',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      // In a real app, this would be an API call
      // For now, we'll use localStorage
      const beneficiaries = getBeneficiariesFromStorage();

      // Check each beneficiary for missing fields
      beneficiaries.forEach(beneficiary => {
        checkForMissingFields(beneficiary, dispatch);
        // Check specifically for missing ID images
        checkForMissingIDImages(beneficiary, dispatch);
      });

      return beneficiaries;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addBeneficiary = createAsyncThunk(
  'beneficiaries/addBeneficiary',
  async (beneficiary, { rejectWithValue, dispatch }) => {
    try {
      // Use provided priority or calculate it based on income and family size
      const priority = beneficiary.priority !== undefined
        ? beneficiary.priority
        : calculatePriority(beneficiary);

      // Create new beneficiary with ID and priority
      const newBeneficiary = {
        ...beneficiary,
        id: Date.now().toString(),
        priority,
        createdAt: new Date().toISOString(),
        monthlySupport: [],
        initiatives: []
      };

      // Check for missing fields and create notifications
      checkForMissingFields(newBeneficiary, dispatch);
      // Check specifically for missing ID images
      checkForMissingIDImages(newBeneficiary, dispatch);

      // Get current beneficiaries and add the new one
      const currentBeneficiaries = getBeneficiariesFromStorage();
      const updatedBeneficiaries = [...currentBeneficiaries, newBeneficiary];

      // Save to localStorage
      localStorage.setItem('beneficiaries', JSON.stringify(updatedBeneficiaries));

      return newBeneficiary;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateBeneficiary = createAsyncThunk(
  'beneficiaries/updateBeneficiary',
  async (beneficiary, { rejectWithValue, getState, dispatch }) => {
    try {
      // Use provided priority or calculate it based on income and family size
      const priority = beneficiary.priority !== undefined
        ? beneficiary.priority
        : calculatePriority(beneficiary);

      // Update beneficiary with new priority
      const updatedBeneficiary = {
        ...beneficiary,
        priority,
        updatedAt: new Date().toISOString()
      };

      // Get current beneficiaries and update the specified one
      const currentBeneficiaries = getState().beneficiaries.items;
      const updatedBeneficiaries = currentBeneficiaries.map(b =>
        b.id === updatedBeneficiary.id ? updatedBeneficiary : b
      );

      // Save to localStorage
      localStorage.setItem('beneficiaries', JSON.stringify(updatedBeneficiaries));

      // Check for missing fields and create notifications
      checkForMissingFields(updatedBeneficiary, dispatch);
      // Check specifically for missing ID images
      checkForMissingIDImages(updatedBeneficiary, dispatch);

      return updatedBeneficiary;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteBeneficiary = createAsyncThunk(
  'beneficiaries/deleteBeneficiary',
  async (id, { rejectWithValue, getState }) => {
    try {
      // Get current beneficiaries and remove the specified one
      const currentBeneficiaries = getState().beneficiaries.items;
      const updatedBeneficiaries = currentBeneficiaries.filter(b => b.id !== id);

      // Save to localStorage
      saveBeneficiariesToStorage(updatedBeneficiaries);

      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const beneficiariesSlice = createSlice({
  name: 'beneficiaries',
  initialState: {
    items: [],
    filteredItems: [],
    isLoading: false,
    error: null,
    filter: {
      name: '',
      nationalId: '',
      beneficiaryId: '',
      phone: ''
    }
  },
  reducers: {
    setFilter: (state, action) => {
      state.filter = {
        ...state.filter,
        ...action.payload
      };

      // Apply filters
      state.filteredItems = state.items.filter(item => {
        const nameMatch = !state.filter.name ||
          item.name.toLowerCase().includes(state.filter.name.toLowerCase());

        const nationalIdMatch = !state.filter.nationalId ||
          item.nationalId.includes(state.filter.nationalId);

        const beneficiaryIdMatch = !state.filter.beneficiaryId ||
          item.beneficiaryId.includes(state.filter.beneficiaryId);

        const phoneMatch = !state.filter.phone ||
          item.phone.includes(state.filter.phone);

        return nameMatch && nationalIdMatch && beneficiaryIdMatch && phoneMatch;
      });
    },
    clearFilters: (state) => {
      state.filter = {
        name: '',
        nationalId: '',
        beneficiaryId: '',
        phone: ''
      };
      state.filteredItems = state.items;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch beneficiaries
      .addCase(fetchBeneficiaries.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBeneficiaries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.filteredItems = action.payload;
      })
      .addCase(fetchBeneficiaries.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add beneficiary
      .addCase(addBeneficiary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addBeneficiary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.push(action.payload);
        state.filteredItems = state.items;
      })
      .addCase(addBeneficiary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update beneficiary
      .addCase(updateBeneficiary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBeneficiary.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.items.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.filteredItems = state.items;
      })
      .addCase(updateBeneficiary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete beneficiary
      .addCase(deleteBeneficiary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBeneficiary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter(b => b.id !== action.payload);
        state.filteredItems = state.filteredItems.filter(b => b.id !== action.payload);
      })
      .addCase(deleteBeneficiary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { setFilter, clearFilters } = beneficiariesSlice.actions;

// Basic selectors
const selectBeneficiariesItems = (state) => state.beneficiaries.items;
const selectBeneficiariesFilteredItems = (state) => state.beneficiaries.filteredItems;

// Helper function for sorting beneficiaries
const sortBeneficiariesByIdAsc = (beneficiaries) => {
  return [...beneficiaries].sort((a, b) => {
    // Convert beneficiaryId to number for proper numeric sorting
    const aId = parseInt(a.beneficiaryId) || 0;
    const bId = parseInt(b.beneficiaryId) || 0;
    return aId - bId;
  });
};

// Memoized selector for all beneficiaries sorted by beneficiaryId in ascending order
export const selectAllBeneficiaries = createSelector(
  [selectBeneficiariesItems],
  (items) => sortBeneficiariesByIdAsc(items)
);

// Memoized selector for filtered beneficiaries sorted by beneficiaryId in ascending order
export const selectFilteredBeneficiaries = createSelector(
  [selectBeneficiariesFilteredItems],
  (filteredItems) => sortBeneficiariesByIdAsc(filteredItems)
);

// Memoized selector for finding beneficiary by ID
export const selectBeneficiaryById = createSelector(
  [selectBeneficiariesItems, (state, id) => id],
  (items, id) => items.find(b => b.id === id)
);

// Other simple selectors
export const selectBeneficiariesLoading = (state) => state.beneficiaries.isLoading;
export const selectBeneficiariesError = (state) => state.beneficiaries.error;
export const selectBeneficiariesFilter = (state) => state.beneficiaries.filter;

export default beneficiariesSlice.reducer;




