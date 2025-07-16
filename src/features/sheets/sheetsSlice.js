import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { addNotification } from '../notifications/notificationsSlice';
import {
  getAllSheetsFromRealtime,
  addSheetToRealtime,
  saveSheetToRealtime,
  deleteSheetFromRealtime,
  listenToSheets
} from '../../services/firebaseService';

// دالة لحساب إجمالي الكشف
const calculateSheetTotal = (beneficiaries) => {
  return beneficiaries.reduce((total, beneficiary) => {
    return total + (parseFloat(beneficiary.monthlyAmount) || 0);
  }, 0);
};

// جلب كل الكشوفات من الريل تايم
export const fetchSheets = createAsyncThunk(
  'sheets/fetchSheets',
  async (_, { rejectWithValue }) => {
    try {
      const sheetsObj = await getAllSheetsFromRealtime();
      const sheets = sheetsObj ? Object.values(sheetsObj) : [];
      return sheets;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// إضافة كشف جديد
export const createSheet = createAsyncThunk(
  'sheets/createSheet',
  async (sheetData, { rejectWithValue, dispatch }) => {
    try {
      const newSheet = {
        ...sheetData,
        beneficiaries: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        totalAmount: 0,
        beneficiaryCount: 0,
        month: sheetData.month || (new Date().getMonth() + 1),
        year: sheetData.year || new Date().getFullYear(),
        sheetType: 'monthly'
      };
      await addSheetToRealtime(newSheet);
      dispatch(addNotification({
        type: 'success',
        message: `تم إنشاء الكشف "${newSheet.name}" بنجاح`,
        duration: 5000
      }));
      return newSheet;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// تحديث كشف
export const updateSheet = createAsyncThunk(
  'sheets/updateSheet',
  async (sheetData, { rejectWithValue, dispatch }) => {
    try {
      const updatedSheet = {
        ...sheetData,
        updatedAt: new Date().toISOString(),
        totalAmount: calculateSheetTotal(sheetData.beneficiaries || []),
        beneficiaryCount: (sheetData.beneficiaries || []).length
      };
      await saveSheetToRealtime(updatedSheet.id, updatedSheet);
      dispatch(addNotification({
        type: 'success',
        message: `تم تحديث الكشف "${updatedSheet.name}" بنجاح`,
        duration: 5000
      }));
      return updatedSheet;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// حذف كشف
export const deleteSheet = createAsyncThunk(
  'sheets/deleteSheet',
  async (sheetId, { rejectWithValue, dispatch }) => {
    try {
      await deleteSheetFromRealtime(sheetId);
      dispatch(addNotification({
        type: 'success',
        message: `تم حذف الكشف بنجاح`,
        duration: 5000
      }));
      return sheetId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// الاستماع لتغييرات الكشوفات في الريل تايم
export const listenToSheetsRealtime = createAsyncThunk(
  'sheets/listenToSheetsRealtime',
  async (_, { dispatch }) => {
    listenToSheets((sheetsObj) => {
      const sheets = sheetsObj ? Object.values(sheetsObj) : [];
      dispatch(setSheets(sheets));
    });
  }
);

const initialState = {
  items: [],
  isLoading: false,
  error: null,
  selectedSheet: null
};

const sheetsSlice = createSlice({
  name: 'sheets',
  initialState,
  reducers: {
    setSheets: (state, action) => {
      state.items = action.payload;
    },
    setSelectedSheet: (state, action) => {
      state.selectedSheet = action.payload;
    },
    clearSelectedSheet: (state) => {
      state.selectedSheet = null;
    }
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(createSheet.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateSheet.fulfilled, (state, action) => {
        const index = state.items.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteSheet.fulfilled, (state, action) => {
        state.items = state.items.filter(s => s.id !== action.payload);
        if (state.selectedSheet && state.selectedSheet.id === action.payload) {
          state.selectedSheet = null;
        }
      });
  }
});

export const { setSheets, setSelectedSheet, clearSelectedSheet } = sheetsSlice.actions;

export const selectAllSheets = (state) => state.sheets?.items || [];
export const selectSheetsLoading = (state) => state.sheets?.isLoading || false;
export const selectSheetsError = (state) => state.sheets?.error || null;
export const selectSelectedSheet = (state) => state.sheets?.selectedSheet || null;

export const selectSheetById = (state, sheetId) => 
  state.sheets?.items?.find(s => s.id === sheetId) || null;

export const selectBeneficiariesBySheet = (state, sheetId) => {
  const sheet = state.sheets?.items?.find(s => s.id === sheetId);
  return sheet ? sheet.beneficiaries : [];
};

export const selectActiveSheets = createSelector(
  [(state) => state.sheets?.items || []],
  (sheets) => sheets.filter(s => s.status === 'active')
);

export const selectSheetsStats = createSelector(
  [(state) => state.sheets?.items || []],
  (sheets) => ({
    total: sheets.length,
    active: sheets.filter(s => s.status === 'active').length,
    totalBeneficiaries: sheets.reduce((sum, s) => sum + (s.beneficiaryCount || 0), 0),
    totalAmount: sheets.reduce((sum, s) => sum + (s.totalAmount || 0), 0)
  })
);

export const selectMonthlyTotal = createSelector(
  [(state) => state.sheets?.items || [], (state, month) => month, (state, month, year) => year],
  (sheets, month, year) => {
    const monthlySheets = sheets.filter(s => 
      s.month === month && s.year === year && s.status === 'active'
    );
    return monthlySheets.reduce((total, sheet) => total + (sheet.totalAmount || 0), 0);
  }
);

export default sheetsSlice.reducer; 