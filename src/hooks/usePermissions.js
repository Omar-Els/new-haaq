import { useSelector } from 'react-redux';
import { selectUser } from '../features/auth/authSlice';

/**
 * Permissions Constants
 * 
 * تعريف جميع الصلاحيات في النظام
 */
export const PERMISSIONS = {
  // صلاحيات المستفيدين
  BENEFICIARIES_VIEW: 'beneficiaries:view',
  BENEFICIARIES_CREATE: 'beneficiaries:create',
  BENEFICIARIES_EDIT: 'beneficiaries:edit',
  BENEFICIARIES_DELETE: 'beneficiaries:delete',

  // صلاحيات المتطوعين
  VOLUNTEERS_VIEW: 'volunteers:view',
  VOLUNTEERS_CREATE: 'volunteers:create',
  VOLUNTEERS_EDIT: 'volunteers:edit',
  VOLUNTEERS_DELETE: 'volunteers:delete',

  // صلاحيات المبادرات
  INITIATIVES_VIEW: 'initiatives:view',
  INITIATIVES_CREATE: 'initiatives:create',
  INITIATIVES_EDIT: 'initiatives:edit',
  INITIATIVES_DELETE: 'initiatives:delete',

  // صلاحيات الماليات
  FINANCE_VIEW: 'finance:view',
  FINANCE_CREATE: 'finance:create',
  FINANCE_EDIT: 'finance:edit',
  FINANCE_DELETE: 'finance:delete',

  // صلاحيات التقارير
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',

  // صلاحيات الإعدادات
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',

  // صلاحيات إدارية
  ADMIN_PANEL: 'admin:panel',
  USER_MANAGEMENT: 'admin:users',
  SYSTEM_CONFIG: 'admin:config'
};

/**
 * Role Permissions Mapping
 * 
 * تحديد الصلاحيات لكل دور
 */
const ROLE_PERMISSIONS = {
  admin: [
    // جميع الصلاحيات للمدير
    ...Object.values(PERMISSIONS)
  ],
  
  user: [
    // صلاحيات المستخدم العادي (عرض فقط)
    PERMISSIONS.BENEFICIARIES_VIEW,
    PERMISSIONS.VOLUNTEERS_VIEW,
    PERMISSIONS.INITIATIVES_VIEW,
    PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.SETTINGS_VIEW
  ],

  volunteer: [
    // صلاحيات المتطوع
    PERMISSIONS.BENEFICIARIES_VIEW,
    PERMISSIONS.BENEFICIARIES_CREATE,
    PERMISSIONS.VOLUNTEERS_VIEW,
    PERMISSIONS.INITIATIVES_VIEW,
    PERMISSIONS.INITIATIVES_CREATE,
    PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.SETTINGS_VIEW
  ],

  moderator: [
    // صلاحيات المشرف
    PERMISSIONS.BENEFICIARIES_VIEW,
    PERMISSIONS.BENEFICIARIES_CREATE,
    PERMISSIONS.BENEFICIARIES_EDIT,
    PERMISSIONS.VOLUNTEERS_VIEW,
    PERMISSIONS.VOLUNTEERS_CREATE,
    PERMISSIONS.VOLUNTEERS_EDIT,
    PERMISSIONS.INITIATIVES_VIEW,
    PERMISSIONS.INITIATIVES_CREATE,
    PERMISSIONS.INITIATIVES_EDIT,
    PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.FINANCE_CREATE,
    PERMISSIONS.FINANCE_EDIT,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_EDIT
  ]
};

/**
 * usePermissions Hook
 * 
 * Hook لإدارة صلاحيات المستخدم
 */
export const usePermissions = () => {
  const user = useSelector(selectUser);

  // تحديد الدور الافتراضي
  const role = user?.role || 'user';

  // الحصول على صلاحيات الدور
  const rolePermissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.user;

  /**
   * التحقق من وجود صلاحية معينة
   * @param {string} permission - الصلاحية المطلوب التحقق منها
   * @returns {boolean} - هل المستخدم لديه الصلاحية أم لا
   */
  const hasPermission = (permission) => {
    // المدير لديه جميع الصلاحيات
    if (role === 'admin') {
      return true;
    }

    // التحقق من وجود الصلاحية في قائمة صلاحيات الدور
    return rolePermissions.includes(permission);
  };

  /**
   * التحقق من وجود عدة صلاحيات
   * @param {string[]} permissions - قائمة الصلاحيات
   * @param {boolean} requireAll - هل يجب وجود جميع الصلاحيات أم واحدة فقط
   * @returns {boolean}
   */
  const hasPermissions = (permissions, requireAll = true) => {
    if (requireAll) {
      return permissions.every(permission => hasPermission(permission));
    } else {
      return permissions.some(permission => hasPermission(permission));
    }
  };

  /**
   * التحقق من كون المستخدم مدير
   * @returns {boolean}
   */
  const isAdmin = () => {
    return role === 'admin';
  };

  /**
   * التحقق من كون المستخدم مشرف أو أعلى
   * @returns {boolean}
   */
  const isModerator = () => {
    return ['admin', 'moderator'].includes(role);
  };

  /**
   * الحصول على جميع صلاحيات المستخدم
   * @returns {string[]}
   */
  const getUserPermissions = () => {
    return rolePermissions;
  };

  /**
   * التحقق من إمكانية الوصول لصفحة معينة
   * @param {string} page - اسم الصفحة
   * @returns {boolean}
   */
  const canAccessPage = (page) => {
    const pagePermissions = {
      volunteers: PERMISSIONS.VOLUNTEERS_VIEW,
      beneficiaries: PERMISSIONS.BENEFICIARIES_VIEW,
      initiatives: PERMISSIONS.INITIATIVES_VIEW,
      finance: PERMISSIONS.FINANCE_VIEW,
      reports: PERMISSIONS.REPORTS_VIEW,
      settings: PERMISSIONS.SETTINGS_VIEW
    };

    return hasPermission(pagePermissions[page]);
  };

  return {
    hasPermission,
    hasPermissions,
    isAdmin: isAdmin(),
    isModerator: isModerator(),
    role,
    permissions: getUserPermissions(),
    canAccessPage
  };
};

/**
 * Permission Helper Functions
 */

/**
 * تحديد ما إذا كان المستخدم يمكنه تنفيذ عملية CRUD
 * @param {string} resource - المورد (مثل volunteers, beneficiaries)
 * @param {string} action - العملية (create, read, update, delete)
 * @param {string} userRole - دور المستخدم
 * @returns {boolean}
 */
export const canPerformAction = (resource, action, userRole = 'user') => {
  const permission = `${resource}:${action === 'read' ? 'view' : action}`;
  const rolePermissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.user;
  
  return userRole === 'admin' || rolePermissions.includes(permission);
};

/**
 * الحصول على الصلاحيات المتاحة لدور معين
 * @param {string} role - الدور
 * @returns {string[]}
 */
export const getPermissionsForRole = (role) => {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.user;
};

/**
 * التحقق من صحة دور المستخدم
 * @param {string} role - الدور
 * @returns {boolean}
 */
export const isValidRole = (role) => {
  return Object.keys(ROLE_PERMISSIONS).includes(role);
};

export default usePermissions;
