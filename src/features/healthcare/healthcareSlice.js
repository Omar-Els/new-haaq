import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// نموذج خدمة طبية
// { id, beneficiaryId, serviceType, description, date, provider, status }

const initialState = {
  services: [], // جميع الخدمات الطبية
  loading: false,
  error: null
};

// Async thunk لإضافة خدمة طبية
export const addHealthcareService = createAsyncThunk(
  'healthcare/addHealthcareService',
  async (service, thunkAPI) => {
    // هنا يمكن ربطها بباك اند أو تخزين محلي
    return service;
  }
);

// Async thunk لجلب جميع الخدمات الطبية
export const fetchHealthcareServices = createAsyncThunk(
  'healthcare/fetchHealthcareServices',
  async (_, thunkAPI) => {
    // هنا يمكن جلب البيانات من باك اند أو تخزين محلي
    return [];
  }
);

const healthcareSlice = createSlice({
  name: 'healthcare',
  initialState,
  reducers: {
    // إضافة خدمة طبية محليًا
    addServiceLocal: (state, action) => {
      state.services.push(action.payload);
    },
    // حذف خدمة طبية
    removeService: (state, action) => {
      state.services = state.services.filter(s => s.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(addHealthcareService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addHealthcareService.fulfilled, (state, action) => {
        state.loading = false;
        state.services.push(action.payload);
      })
      .addCase(addHealthcareService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchHealthcareServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHealthcareServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchHealthcareServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { addServiceLocal, removeService } = healthcareSlice.actions;
export default healthcareSlice.reducer; 