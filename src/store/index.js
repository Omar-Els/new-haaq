import { configureStore } from '@reduxjs/toolkit';

// Import reducers
import initiativesReducer from '../features/initiatives/initiativesSlice';
import themeReducer from '../features/ui/themeSlice';

const store = configureStore({
  reducer: {
    initiatives: initiativesReducer,
    ui: {
      theme: themeReducer
    }
  }
});

export default store;



