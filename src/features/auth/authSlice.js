import { createSlice } from '@reduxjs/toolkit';

// استرجاع بيانات المستخدم من التخزين المحلي مباشرة
const getSavedUser = () => {
  try {
    const userJSON = localStorage.getItem('currentUser');
    if (userJSON) {
      return JSON.parse(userJSON);
    }
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
  }
  return null;
};

// استرجاع بيانات المستخدم من التخزين المحلي
const savedUser = getSavedUser();

// Initial state with user from localStorage if available
const initialState = {
  user: savedUser,
  isLoading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.user = action.payload;

      // حفظ بيانات المستخدم في التخزين المحلي
      try {
        localStorage.setItem('currentUser', JSON.stringify(action.payload));
        console.log('User data saved to localStorage:', action.payload.displayName || action.payload.email);
      } catch (error) {
        console.error('Error saving user to localStorage:', error);
      }
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;

      // حذف بيانات المستخدم من التخزين المحلي
      try {
        localStorage.removeItem('currentUser');
        console.log('User data removed from localStorage');
      } catch (error) {
        console.error('Error removing user from localStorage:', error);
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError
} = authSlice.actions;

// Selectors
export const selectUser = (state) => state.auth?.user;
export const selectIsAuthenticated = (state) => Boolean(state.auth?.user);
export const selectAuthLoading = (state) => state.auth?.isLoading;
export const selectAuthError = (state) => state.auth?.error;

export default authSlice.reducer;


