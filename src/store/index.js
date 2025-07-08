import { configureStore } from '@reduxjs/toolkit';

// Import reducers
import initiativesReducer from '../features/initiatives/initiativesSlice';
import themeReducer from '../features/ui/themeSlice';
import sheetsReducer from '../features/sheets/sheetsSlice';
import beneficiariesReducer from '../features/beneficiaries/beneficiariesSlice';
import authReducer from '../features/auth/authSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';
import volunteersReducer from '../features/volunteers/volunteersSlice';
import financeReducer from '../features/finance/financeSlice';
import settingsReducer from '../features/settings/settingsSlice';
import quranReducer from '../features/quran/quranSlice';

const store = configureStore({
  reducer: {
    initiatives: initiativesReducer,
    sheets: sheetsReducer,
    beneficiaries: beneficiariesReducer,
    auth: authReducer,
    notifications: notificationsReducer,
    volunteers: volunteersReducer,
    finance: financeReducer,
    settings: settingsReducer,
    quran: quranReducer,
    ui: {
      theme: themeReducer
    }
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['auth.user', 'beneficiaries.items', 'sheets.items']
      }
    })
});

export default store;



