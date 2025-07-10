import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { addNotification } from '../notifications/notificationsSlice';
import { saveToIndexedDB, getFromIndexedDB } from '../../utils/indexedDBManager';

// دالة لإنشاء معرف كشف فريد
const generateSheetId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `SHEET-${timestamp}-${random}`;
};

// دالة لإنشاء اسم كشف تلقائي
const generateSheetName = (beneficiaryCount = 0) => {
  const now = new Date();
  const month = now.toLocaleDateString('ar-EG', { month: 'long' });
  const year = now.getFullYear();
  return `كشف ${month} ${year} (${beneficiaryCount} مستفيد)`;
};

// Helper functions for storage
const getSheetsFromStorage = async () => {
  try {
    // محاولة استخدام IndexedDB أولاً
    try {
      const sheets = await getFromIndexedDB('sheets');
      if (Array.isArray(sheets) && sheets.length > 0) {
        console.log(`📊 تم تحميل ${sheets.length} كشف من IndexedDB`);
        return sheets;
      }
    } catch (indexedDBError) {
      console.warn('⚠️ IndexedDB غير متاح للكشفات، التبديل إلى localStorage:', indexedDBError);
    }

    // العودة إلى localStorage كبديل
    const sheetsData = localStorage.getItem('sheets');
    if (!sheetsData) {
      console.log('📊 لا توجد كشفات محفوظة');
      return [];
    }

    const parsed = JSON.parse(sheetsData);
    if (Array.isArray(parsed)) {
      console.log(`📊 تم تحميل ${parsed.length} كشف من localStorage`);
      return parsed;
    } else {
      console.warn('⚠️ البيانات المحفوظة في localStorage ليست مصفوفة:', parsed);
      return [];
    }
  } catch (error) {
    console.error('❌ خطأ في تحميل الكشفات:', error);
    return [];
  }
};

const saveSheetsToStorage = async (sheets) => {
  try {
    // محاولة استخدام IndexedDB أولاً
    try {
      await saveToIndexedDB('sheets', sheets);
      console.log(`✅ تم حفظ ${sheets.length} كشف في IndexedDB`);
      return;
    } catch (indexedDBError) {
      console.warn('⚠️ فشل في حفظ الكشفات في IndexedDB، التبديل إلى localStorage:', indexedDBError);
    }

    // العودة إلى localStorage كبديل
    const dataString = JSON.stringify(sheets);
    localStorage.setItem('sheets', dataString);
    console.log(`✅ تم حفظ ${sheets.length} كشف في localStorage`);
  } catch (error) {
    console.error('❌ خطأ في حفظ الكشفات:', error);
  }
};

// Async thunks
export const fetchSheets = createAsyncThunk(
  'sheets/fetchSheets',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 تحميل الكشفات...');
      const sheets = await getSheetsFromStorage();
      console.log(`✅ تم تحميل ${sheets.length} كشف بنجاح`);
      return sheets;
    } catch (error) {
      console.error('❌ خطأ في جلب الكشفات:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const createSheet = createAsyncThunk(
  'sheets/createSheet',
  async (sheetData, { rejectWithValue, dispatch }) => {
    try {
      const newSheet = {
        id: generateSheetId(),
        name: sheetData.name || generateSheetName(),
        description: sheetData.description || '',
        beneficiaries: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        totalAmount: 0,
        beneficiaryCount: 0
      };

      // Get current sheets and add the new one
      const currentSheets = await getSheetsFromStorage();
      const updatedSheets = [newSheet, ...currentSheets];

      // Save to storage
      await saveSheetsToStorage(updatedSheets);

      dispatch(addNotification({
        type: 'success',
        message: `تم إنشاء الكشف "${newSheet.name}" بنجاح`,
        duration: 5000
      }));

      return newSheet;
    } catch (error) {
      console.error('❌ خطأ في إنشاء الكشف:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateSheet = createAsyncThunk(
  'sheets/updateSheet',
  async (sheetData, { rejectWithValue, dispatch }) => {
    try {
      const updatedSheet = {
        ...sheetData,
        updatedAt: new Date().toISOString()
      };

      // Get current sheets and update the specified one
      const currentSheets = await getSheetsFromStorage();
      const updatedSheets = currentSheets.map(s =>
        s.id === updatedSheet.id ? updatedSheet : s
      );

      // Save to storage
      await saveSheetsToStorage(updatedSheets);

      dispatch(addNotification({
        type: 'success',
        message: `تم تحديث الكشف "${updatedSheet.name}" بنجاح`,
        duration: 5000
      }));

      return updatedSheet;
    } catch (error) {
      console.error('❌ خطأ في تحديث الكشف:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteSheet = createAsyncThunk(
  'sheets/deleteSheet',
  async (sheetId, { rejectWithValue, dispatch }) => {
    try {
      // Get current sheets and remove the specified one
      const currentSheets = await getSheetsFromStorage();
      const sheetToDelete = currentSheets.find(s => s.id === sheetId);
      const updatedSheets = currentSheets.filter(s => s.id !== sheetId);

      // Save to storage
      await saveSheetsToStorage(updatedSheets);

      dispatch(addNotification({
        type: 'success',
        message: `تم حذف الكشف "${sheetToDelete?.name}" بنجاح`,
        duration: 5000
      }));

      return sheetId;
    } catch (error) {
      console.error('❌ خطأ في حذف الكشف:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const addBeneficiaryToSheet = createAsyncThunk(
  'sheets/addBeneficiaryToSheet',
  async ({ sheetId, beneficiary }, { rejectWithValue, dispatch }) => {
    try {
      // Get current sheets
      const currentSheets = await getSheetsFromStorage();
      const sheetIndex = currentSheets.findIndex(s => s.id === sheetId);
      
      if (sheetIndex === -1) {
        throw new Error('الكشف غير موجود');
      }

      const sheet = currentSheets[sheetIndex];
      
      // Check if beneficiary already exists in this sheet
      const existingBeneficiary = sheet.beneficiaries.find(b => b.id === beneficiary.id);
      if (existingBeneficiary) {
        dispatch(addNotification({
          type: 'warning',
          message: 'المستفيد موجود بالفعل في هذا الكشف',
          duration: 3000
        }));
        return { sheetId, beneficiary: existingBeneficiary };
      }

      // Add beneficiary to sheet
      const updatedSheet = {
        ...sheet,
        beneficiaries: [...sheet.beneficiaries, beneficiary],
        beneficiaryCount: sheet.beneficiaries.length + 1,
        updatedAt: new Date().toISOString()
      };

      // Update sheets array
      const updatedSheets = [...currentSheets];
      updatedSheets[sheetIndex] = updatedSheet;

      // Save to storage
      await saveSheetsToStorage(updatedSheets);

      dispatch(addNotification({
        type: 'success',
        message: `تم إضافة المستفيد "${beneficiary.name}" إلى الكشف "${updatedSheet.name}"`,
        duration: 5000
      }));

      return { sheetId, beneficiary };
    } catch (error) {
      console.error('❌ خطأ في إضافة المستفيد للكشف:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const removeBeneficiaryFromSheet = createAsyncThunk(
  'sheets/removeBeneficiaryFromSheet',
  async ({ sheetId, beneficiaryId }, { rejectWithValue, dispatch }) => {
    try {
      // Get current sheets
      const currentSheets = await getSheetsFromStorage();
      const sheetIndex = currentSheets.findIndex(s => s.id === sheetId);
      
      if (sheetIndex === -1) {
        throw new Error('الكشف غير موجود');
      }

      const sheet = currentSheets[sheetIndex];
      const beneficiaryToRemove = sheet.beneficiaries.find(b => b.id === beneficiaryId);
      
      if (!beneficiaryToRemove) {
        throw new Error('المستفيد غير موجود في هذا الكشف');
      }

      // Remove beneficiary from sheet
      const updatedSheet = {
        ...sheet,
        beneficiaries: sheet.beneficiaries.filter(b => b.id !== beneficiaryId),
        beneficiaryCount: sheet.beneficiaries.length - 1,
        updatedAt: new Date().toISOString()
      };

      // Update sheets array
      const updatedSheets = [...currentSheets];
      updatedSheets[sheetIndex] = updatedSheet;

      // Save to storage
      await saveSheetsToStorage(updatedSheets);

      dispatch(addNotification({
        type: 'success',
        message: `تم إزالة المستفيد "${beneficiaryToRemove.name}" من الكشف "${updatedSheet.name}"`,
        duration: 5000
      }));

      return { sheetId, beneficiaryId };
    } catch (error) {
      console.error('❌ خطأ في إزالة المستفيد من الكشف:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  items: [],
  isLoading: false,
  error: null,
  selectedSheet: null
};

// Slice
const sheetsSlice = createSlice({
  name: 'sheets',
  initialState,
  reducers: {
    setSelectedSheet: (state, action) => {
      state.selectedSheet = action.payload;
    },
    clearSelectedSheet: (state) => {
      state.selectedSheet = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchSheets
      .addCase(fetchSheets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSheets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchSheets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // createSheet
      .addCase(createSheet.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // updateSheet
      .addCase(updateSheet.fulfilled, (state, action) => {
        const index = state.items.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // deleteSheet
      .addCase(deleteSheet.fulfilled, (state, action) => {
        state.items = state.items.filter(s => s.id !== action.payload);
        if (state.selectedSheet && state.selectedSheet.id === action.payload) {
          state.selectedSheet = null;
        }
      })
      // addBeneficiaryToSheet
      .addCase(addBeneficiaryToSheet.fulfilled, (state, action) => {
        const { sheetId, beneficiary } = action.payload;
        const sheet = state.items.find(s => s.id === sheetId);
        if (sheet && !sheet.beneficiaries.find(b => b.id === beneficiary.id)) {
          sheet.beneficiaries.push(beneficiary);
          sheet.beneficiaryCount = sheet.beneficiaries.length;
          sheet.updatedAt = new Date().toISOString();
        }
      })
      // removeBeneficiaryFromSheet
      .addCase(removeBeneficiaryFromSheet.fulfilled, (state, action) => {
        const { sheetId, beneficiaryId } = action.payload;
        const sheet = state.items.find(s => s.id === sheetId);
        if (sheet) {
          sheet.beneficiaries = sheet.beneficiaries.filter(b => b.id !== beneficiaryId);
          sheet.beneficiaryCount = sheet.beneficiaries.length;
          sheet.updatedAt = new Date().toISOString();
        }
      });
  }
});

// Actions
export const { setSelectedSheet, clearSelectedSheet } = sheetsSlice.actions;

// Selectors
export const selectAllSheets = (state) => state.sheets.items;
export const selectSheetsLoading = (state) => state.sheets.isLoading;
export const selectSheetsError = (state) => state.sheets.error;
export const selectSelectedSheet = (state) => state.sheets.selectedSheet;

export const selectSheetById = (state, sheetId) => 
  state.sheets.items.find(s => s.id === sheetId);

export const selectBeneficiariesBySheet = (state, sheetId) => {
  const sheet = state.sheets.items.find(s => s.id === sheetId);
  return sheet ? sheet.beneficiaries : [];
};

export const selectActiveSheets = (state) => 
  state.sheets.items.filter(s => s.status === 'active');

export const selectSheetsStats = (state) => {
  const sheets = state.sheets.items;
  return {
    total: sheets.length,
    active: sheets.filter(s => s.status === 'active').length,
    totalBeneficiaries: sheets.reduce((sum, s) => sum + s.beneficiaryCount, 0),
    totalAmount: sheets.reduce((sum, s) => sum + (s.totalAmount || 0), 0)
  };
};

export default sheetsSlice.reducer; 