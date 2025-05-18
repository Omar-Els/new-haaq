import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import beneficiariesReducer from '../features/beneficiaries/beneficiariesSlice';
import initiativesReducer from '../features/initiatives/initiativesSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';
import themeReducer from '../features/ui/themeSlice';
import financeReducer from '../features/finance/financeSlice';
import settingsReducer from '../features/settings/settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    beneficiaries: beneficiariesReducer,
    initiatives: initiativesReducer,
    notifications: notificationsReducer,
    theme: themeReducer,
    finance: financeReducer,
    settings: settingsReducer
  }
});

export default store;




