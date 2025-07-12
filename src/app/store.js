import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import rolesReducer from '../features/auth/rolesSlice';
import beneficiariesReducer from '../features/beneficiaries/beneficiariesSlice';
import initiativesReducer from '../features/initiatives/initiativesSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';
import themeReducer from '../features/ui/themeSlice';
import financeReducer from '../features/finance/financeSlice';
import settingsReducer from '../features/settings/settingsSlice';
import volunteersReducer from '../features/volunteers/volunteersSlice';
import sheetsReducer from '../features/sheets/sheetsSlice';
import healthcareReducer from '../features/healthcare/healthcareSlice';
import developmentProjectsReducer from '../features/developmentProjects/developmentProjectsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    roles: rolesReducer,
    beneficiaries: beneficiariesReducer,
    initiatives: initiativesReducer,
    notifications: notificationsReducer,
    theme: themeReducer,
    finance: financeReducer,
    settings: settingsReducer,
    volunteers: volunteersReducer,
    sheets: sheetsReducer,
    healthcare: healthcareReducer,
    developmentProjects: developmentProjectsReducer
  }
});

export default store;




