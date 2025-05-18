import { createSlice } from '@reduxjs/toolkit';

// Get initial theme from localStorage or default to light
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  return savedTheme || 'light';
};

const initialState = {
  theme: getInitialTheme()
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      // Save to localStorage
      localStorage.setItem('theme', state.theme);
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      // Save to localStorage
      localStorage.setItem('theme', state.theme);
    }
  }
});

export const { toggleTheme, setTheme } = themeSlice.actions;

// Selector
export const selectTheme = (state) => {
  // Handle both nested and flat structure
  if (state.ui && state.ui.theme) {
    return state.ui.theme.theme;
  }
  if (state.theme) {
    return state.theme.theme;
  }
  return 'light'; // Default fallback
};

export default themeSlice.reducer;


