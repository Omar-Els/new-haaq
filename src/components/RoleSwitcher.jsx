import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FaCrown, FaUser, FaShieldAlt } from 'react-icons/fa';
import { 
  loginAsAdmin, 
  loginAsUser, 
  selectCurrentUserRole, 
  selectIsAdmin,
  ROLES 
} from '../features/auth/rolesSlice';
import './RoleSwitcher.css';

const RoleSwitcher = () => {
  const dispatch = useDispatch();
  const currentRole = useSelector(selectCurrentUserRole);
  const isAdmin = useSelector(selectIsAdmin);

  const handleRoleSwitch = (role) => {
    if (role === ROLES.ADMIN) {
      dispatch(loginAsAdmin());
    } else {
      dispatch(loginAsUser());
    }
  };

  return (
    <div className="role-switcher">
      <div className="role-switcher-header">
        <FaShieldAlt />
        <h3>تبديل الدور (للاختبار)</h3>
      </div>
      
      <div className="current-role">
        <span>الدور الحالي: </span>
        <span className={`role-badge ${currentRole}`}>
          {isAdmin ? (
            <>
              <FaCrown /> مدير
            </>
          ) : (
            <>
              <FaUser /> مستخدم
            </>
          )}
        </span>
      </div>

      <div className="role-buttons">
        <motion.button
          className={`role-btn admin-btn ${currentRole === ROLES.ADMIN ? 'active' : ''}`}
          onClick={() => handleRoleSwitch(ROLES.ADMIN)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={currentRole === ROLES.ADMIN}
        >
          <FaCrown />
          <div>
            <div className="role-title">مدير</div>
            <div className="role-desc">جميع الصلاحيات</div>
          </div>
        </motion.button>

        <motion.button
          className={`role-btn user-btn ${currentRole === ROLES.USER ? 'active' : ''}`}
          onClick={() => handleRoleSwitch(ROLES.USER)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={currentRole === ROLES.USER}
        >
          <FaUser />
          <div>
            <div className="role-title">مستخدم</div>
            <div className="role-desc">عرض فقط</div>
          </div>
        </motion.button>
      </div>

      <div className="role-permissions">
        <h4>الصلاحيات الحالية:</h4>
        <div className="permissions-list">
          {isAdmin ? (
            <div className="permission-item admin-permission">
              <FaCrown />
              <span>جميع الصلاحيات (مدير)</span>
            </div>
          ) : (
            <>
              <div className="permission-item">
                <span>👁️ عرض المستفيدين</span>
              </div>
              <div className="permission-item">
                <span>👁️ عرض المعاملات المالية</span>
              </div>
              <div className="permission-item">
                <span>👁️ عرض التقارير</span>
              </div>
              <div className="permission-item">
                <span>🔍 البحث والفلترة</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="role-info">
        <h4>💡 معلومات الأدوار:</h4>
        <div className="info-item">
          <strong>👑 المدير:</strong>
          <ul>
            <li>✅ إضافة وتعديل وحذف المستفيدين</li>
            <li>✅ إدارة المعاملات المالية</li>
            <li>✅ تصدير التقارير</li>
            <li>✅ تعديل الإعدادات</li>
            <li>✅ إدارة المحتوى</li>
          </ul>
        </div>
        
        <div className="info-item">
          <strong>👤 المستخدم:</strong>
          <ul>
            <li>👁️ عرض المستفيدين فقط</li>
            <li>👁️ عرض المعاملات المالية فقط</li>
            <li>🔍 البحث والفلترة</li>
            <li>📊 عرض التقارير فقط</li>
            <li>❌ لا يمكن التعديل أو الحذف</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RoleSwitcher;
