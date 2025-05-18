import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Helper functions for localStorage
const getInitiativesFromStorage = () => {
  try {
    const initiatives = localStorage.getItem('initiatives');
    if (initiatives) {
      return JSON.parse(initiatives);
    } else {
      // Initial data if no data exists
      const initialData = [
        {
          id: '1',
          name: 'رمضان 2023',
          date: '2023-03-22',
          description: 'توزيع مواد غذائية لشهر رمضان',
          beneficiaries: [],
          totalAmount: 0,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'عيد الفطر 2023',
          date: '2023-04-21',
          description: 'توزيع ملابس العيد للأطفال',
          beneficiaries: [],
          totalAmount: 0,
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('initiatives', JSON.stringify(initialData));
      return initialData;
    }
  } catch (error) {
    console.error('Error getting initiatives from storage:', error);
    return [];
  }
};

const saveInitiativesToStorage = (initiatives) => {
  try {
    localStorage.setItem('initiatives', JSON.stringify(initiatives));
  } catch (error) {
    console.error('Error saving initiatives to storage:', error);
  }
};

// Async thunks
export const fetchInitiatives = createAsyncThunk(
  'initiatives/fetchInitiatives',
  async () => {
    // Simulate API call with localStorage
    return getInitiativesFromStorage();
  }
);

export const addInitiative = createAsyncThunk(
  'initiatives/addInitiative',
  async (initiative) => {
    // Add ID and timestamps
    const newInitiative = {
      ...initiative,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      beneficiaries: initiative.beneficiaries || [],
      totalAmount: initiative.totalAmount || 0
    };
    
    // Get current initiatives
    const initiatives = getInitiativesFromStorage();
    
    // Add new initiative
    const updatedInitiatives = [...initiatives, newInitiative];
    
    // Save to localStorage
    saveInitiativesToStorage(updatedInitiatives);
    
    return newInitiative;
  }
);

export const updateInitiative = createAsyncThunk(
  'initiatives/updateInitiative',
  async (initiative) => {
    // Get current initiatives
    const initiatives = getInitiativesFromStorage();
    
    // Update initiative
    const updatedInitiatives = initiatives.map(item => 
      item.id === initiative.id ? { ...item, ...initiative, updatedAt: new Date().toISOString() } : item
    );
    
    // Save to localStorage
    saveInitiativesToStorage(updatedInitiatives);
    
    return initiative;
  }
);

export const deleteInitiative = createAsyncThunk(
  'initiatives/deleteInitiative',
  async (id) => {
    // Get current initiatives
    const initiatives = getInitiativesFromStorage();
    
    // Filter out the initiative to delete
    const updatedInitiatives = initiatives.filter(item => item.id !== id);
    
    // Save to localStorage
    saveInitiativesToStorage(updatedInitiatives);
    
    return id;
  }
);

// Slice
const initiativesSlice = createSlice({
  name: 'initiatives',
  initialState: {
    initiatives: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch initiatives
      .addCase(fetchInitiatives.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchInitiatives.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.initiatives = action.payload;
      })
      .addCase(fetchInitiatives.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      
      // Add initiative
      .addCase(addInitiative.fulfilled, (state, action) => {
        state.initiatives.push(action.payload);
      })
      
      // Update initiative
      .addCase(updateInitiative.fulfilled, (state, action) => {
        const index = state.initiatives.findIndex(initiative => initiative.id === action.payload.id);
        if (index !== -1) {
          state.initiatives[index] = action.payload;
        }
      })
      
      // Delete initiative
      .addCase(deleteInitiative.fulfilled, (state, action) => {
        state.initiatives = state.initiatives.filter(initiative => initiative.id !== action.payload);
      });
  }
});

// Selectors
export const selectAllInitiatives = (state) => {
  if (!state.initiatives || !state.initiatives.initiatives) {
    return [];
  }
  return state.initiatives.initiatives;
};

export const selectInitiativeById = (state, initiativeId) => {
  if (!state.initiatives || !state.initiatives.initiatives) {
    return null;
  }
  return state.initiatives.initiatives.find(initiative => initiative.id === initiativeId);
};

export const selectInitiativesLoading = (state) => {
  if (!state.initiatives) {
    return false;
  }
  return state.initiatives.status === 'loading';
};

export const selectInitiativesError = (state) => {
  if (!state.initiatives) {
    return null;
  }
  return state.initiatives.error;
};

export default initiativesSlice.reducer;


