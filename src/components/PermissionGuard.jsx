import React from 'react';
import { useSelector } from 'react-redux';
import { selectHasPermission, selectHasAnyPermission, selectIsAdmin } from '../features/auth/rolesSlice';

/**
 * مكون حماية الصلاحيات - يعرض المحتوى فقط إذا كان المستخدم لديه الصلاحية المطلوبة
 */
const PermissionGuard = ({ 
  permission, 
  permissions, 
  requireAll = false, 
  adminOnly = false,
  children, 
  fallback = null,
  showMessage = false 
}) => {
  const isAdmin = useSelector(selectIsAdmin);
  
  // إذا كان المكون للأدمين فقط
  if (adminOnly) {
    if (!isAdmin) {
      return showMessage ? (
        <div className="permission-denied">
          <p>🔒 هذه الميزة متاحة للمدير فقط</p>
        </div>
      ) : fallback;
    }
    return children;
  }
  
  // التحقق من صلاحية واحدة
  if (permission) {
    const hasPermission = useSelector(selectHasPermission(permission));
    if (!hasPermission) {
      return showMessage ? (
        <div className="permission-denied">
          <p>🔒 ليس لديك صلاحية للوصول إلى هذه الميزة</p>
        </div>
      ) : fallback;
    }
    return children;
  }
  
  // التحقق من عدة صلاحيات
  if (permissions && permissions.length > 0) {
    const hasPermissions = useSelector(
      requireAll 
        ? selectHasAllPermissions(permissions)
        : selectHasAnyPermission(permissions)
    );
    
    if (!hasPermissions) {
      return showMessage ? (
        <div className="permission-denied">
          <p>🔒 ليس لديك الصلاحيات المطلوبة للوصول إلى هذه الميزة</p>
        </div>
      ) : fallback;
    }
    return children;
  }
  
  // إذا لم يتم تحديد أي صلاحيات، اعرض المحتوى
  return children;
};

/**
 * Hook للتحقق من الصلاحيات
 */
export const usePermissions = () => {
  const isAdmin = useSelector(selectIsAdmin);
  const userPermissions = useSelector(state => state.roles.permissions);
  
  const hasPermission = (permission) => {
    return userPermissions.includes(permission);
  };
  
  const hasAnyPermission = (permissions) => {
    return permissions.some(permission => userPermissions.includes(permission));
  };
  
  const hasAllPermissions = (permissions) => {
    return permissions.every(permission => userPermissions.includes(permission));
  };
  
  return {
    isAdmin,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions: userPermissions
  };
};

/**
 * مكون زر محمي بالصلاحيات
 */
export const ProtectedButton = ({ 
  permission, 
  permissions, 
  requireAll = false,
  adminOnly = false,
  children, 
  disabled = false,
  className = '',
  ...props 
}) => {
  const { isAdmin, hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
  
  let isAllowed = true;
  
  if (adminOnly && !isAdmin) {
    isAllowed = false;
  } else if (permission && !hasPermission(permission)) {
    isAllowed = false;
  } else if (permissions && permissions.length > 0) {
    if (requireAll && !hasAllPermissions(permissions)) {
      isAllowed = false;
    } else if (!requireAll && !hasAnyPermission(permissions)) {
      isAllowed = false;
    }
  }
  
  return (
    <button
      {...props}
      disabled={disabled || !isAllowed}
      className={`${className} ${!isAllowed ? 'permission-disabled' : ''}`}
      title={!isAllowed ? 'ليس لديك صلاحية لهذا الإجراء' : props.title}
    >
      {children}
    </button>
  );
};

/**
 * مكون رابط محمي بالصلاحيات
 */
export const ProtectedLink = ({ 
  permission, 
  permissions, 
  requireAll = false,
  adminOnly = false,
  children, 
  className = '',
  onClick,
  ...props 
}) => {
  const { isAdmin, hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
  
  let isAllowed = true;
  
  if (adminOnly && !isAdmin) {
    isAllowed = false;
  } else if (permission && !hasPermission(permission)) {
    isAllowed = false;
  } else if (permissions && permissions.length > 0) {
    if (requireAll && !hasAllPermissions(permissions)) {
      isAllowed = false;
    } else if (!requireAll && !hasAnyPermission(permissions)) {
      isAllowed = false;
    }
  }
  
  const handleClick = (e) => {
    if (!isAllowed) {
      e.preventDefault();
      alert('ليس لديك صلاحية للوصول إلى هذه الصفحة');
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };
  
  return (
    <a
      {...props}
      className={`${className} ${!isAllowed ? 'permission-disabled' : ''}`}
      onClick={handleClick}
      title={!isAllowed ? 'ليس لديك صلاحية للوصول إلى هذه الصفحة' : props.title}
    >
      {children}
    </a>
  );
};

export default PermissionGuard;
