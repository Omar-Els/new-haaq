import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// نموذج مشروع تنموي
const initialState = {
  items: [],
  isLoading: false,
  error: null,
};

// Async thunks (يمكن تطويرها لاحقًا للاتصال بسيرفر أو IndexedDB)
export const addDevelopmentProject = createAsyncThunk(
  'developmentProjects/addDevelopmentProject',
  async (project, { rejectWithValue }) => {
    try {
      // إضافة id تلقائي
      const newProject = {
        ...project,
        id: `DP-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newProject;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const developmentProjectsSlice = createSlice({
  name: 'developmentProjects',
  initialState,
  reducers: {
    // حذف مشروع
    deleteDevelopmentProject: (state, action) => {
      state.items = state.items.filter(p => p.id !== action.payload);
    },
    // تحديث مشروع
    updateDevelopmentProject: (state, action) => {
      const idx = state.items.findIndex(p => p.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload, updatedAt: new Date().toISOString() };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addDevelopmentProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addDevelopmentProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.unshift(action.payload);
      })
      .addCase(addDevelopmentProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { deleteDevelopmentProject, updateDevelopmentProject } = developmentProjectsSlice.actions;
export default developmentProjectsSlice.reducer; 