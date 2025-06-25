import { createSlice } from '@reduxjs/toolkit';

// تعريف الأدوار والصلاحيات
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

export const PERMISSIONS = {
  // صلاحيات المستفيدين
  BENEFICIARIES_VIEW: 'beneficiaries:view',
  BENEFICIARIES_CREATE: 'beneficiaries:create',
  BENEFICIARIES_EDIT: 'beneficiaries:edit',
  BENEFICIARIES_DELETE: 'beneficiaries:delete',
  
  // صلاحيات المعاملات المالية
  TRANSACTIONS_VIEW: 'transactions:view',
  TRANSACTIONS_CREATE: 'transactions:create',
  TRANSACTIONS_EDIT: 'transactions:edit',
  TRANSACTIONS_DELETE: 'transactions:delete',
  
  // صلاحيات التقارير
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',
  
  // صلاحيات الإعدادات
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',
  
  // صلاحيات إدارة المستخدمين
  USERS_VIEW: 'users:view',
  USERS_MANAGE: 'users:manage',
  
  // صلاحيات المحتوى
  CONTENT_VIEW: 'content:view',
  CONTENT_EDIT: 'content:edit'
};

// تعريف صلاحيات كل دور
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // الأدمين له جميع الصلاحيات
    PERMISSIONS.BENEFICIARIES_VIEW,
    PERMISSIONS.BENEFICIARIES_CREATE,
    PERMISSIONS.BENEFICIARIES_EDIT,
    PERMISSIONS.BENEFICIARIES_DELETE,
    PERMISSIONS.TRANSACTIONS_VIEW,
    PERMISSIONS.TRANSACTIONS_CREATE,
    PERMISSIONS.TRANSACTIONS_EDIT,
    PERMISSIONS.TRANSACTIONS_DELETE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_EDIT,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.CONTENT_EDIT
  ],
  [ROLES.USER]: [
    // المستخدم العادي - عرض فقط
    PERMISSIONS.BENEFICIARIES_VIEW,
    PERMISSIONS.TRANSACTIONS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.CONTENT_VIEW
  ]
};

// الحالة الأولية
const initialState = {
  currentUserRole: ROLES.USER, // افتراضي: مستخدم عادي
  permissions: ROLE_PERMISSIONS[ROLES.USER],
  isAdmin: false
};

const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    setUserRole: (state, action) => {
      const role = action.payload;
      state.currentUserRole = role;
      state.permissions = ROLE_PERMISSIONS[role] || [];
      state.isAdmin = role === ROLES.ADMIN;
      
      console.log(`🔐 تم تعيين دور المستخدم: ${role}`);
      console.log(`📋 الصلاحيات: ${state.permissions.length} صلاحية`);
    },
    
    // تسجيل دخول كأدمين (للاختبار)
    loginAsAdmin: (state) => {
      state.currentUserRole = ROLES.ADMIN;
      state.permissions = ROLE_PERMISSIONS[ROLES.ADMIN];
      state.isAdmin = true;
      
      console.log('👑 تم تسجيل الدخول كأدمين');
    },
    
    // تسجيل دخول كمستخدم عادي
    loginAsUser: (state) => {
      state.currentUserRole = ROLES.USER;
      state.permissions = ROLE_PERMISSIONS[ROLES.USER];
      state.isAdmin = false;
      
      console.log('👤 تم تسجيل الدخول كمستخدم عادي');
    },
    
    // إعادة تعيين الصلاحيات
    resetPermissions: (state) => {
      state.currentUserRole = ROLES.USER;
      state.permissions = ROLE_PERMISSIONS[ROLES.USER];
      state.isAdmin = false;
    }
  }
});

// Selectors
export const selectCurrentUserRole = (state) => state.roles.currentUserRole;
export const selectUserPermissions = (state) => state.roles.permissions;
export const selectIsAdmin = (state) => state.roles.isAdmin;

// دالة للتحقق من صلاحية معينة
export const selectHasPermission = (permission) => (state) => {
  return state.roles.permissions.includes(permission);
};

// دالة للتحقق من عدة صلاحيات
export const selectHasAnyPermission = (permissions) => (state) => {
  return permissions.some(permission => state.roles.permissions.includes(permission));
};

// دالة للتحقق من جميع الصلاحيات
export const selectHasAllPermissions = (permissions) => (state) => {
  return permissions.every(permission => state.roles.permissions.includes(permission));
};

export const { setUserRole, loginAsAdmin, loginAsUser, resetPermissions } = rolesSlice.actions;

export default rolesSlice.reducer;
