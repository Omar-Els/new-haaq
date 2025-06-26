import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUsers, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter,
  FaSort, FaUserPlus, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaCalendarAlt, FaBaby, FaHeart, FaEye, FaDownload,
  FaUpload, FaUserCheck, FaUserTimes, FaChartBar
} from 'react-icons/fa';
import {
  selectAllBeneficiaries,
  selectFilteredBeneficiaries,
  selectBeneficiariesStats,
  selectBeneficiariesSearchTerm,
  selectBeneficiariesFilterBy,
  addBeneficiary,
  updateBeneficiary,
  deleteBeneficiary,
  setSearchTerm,
  setFilterBy,
  loadBeneficiaries,
  saveBeneficiaries
} from '../features/beneficiaries/beneficiariesSlice';
import { addNotification } from '../features/notifications/notificationsSlice';
import PermissionGuard from '../components/PermissionGuard';
import { usePermissions, PERMISSIONS } from '../hooks/usePermissions';
import './Beneficiaries.css';

/**
 * Beneficiaries Component
 * 
 * صفحة إدارة المستفيدين مع نظام صلاحيات
 */
const Beneficiaries = () => {
  const dispatch = useDispatch();
  const { isAdmin, hasPermission } = usePermissions();
  
  // Redux state
  const beneficiaries = useSelector(selectFilteredBeneficiaries);
  const allBeneficiaries = useSelector(selectAllBeneficiaries);
  const stats = useSelector(selectBeneficiariesStats);
  const searchTerm = useSelector(selectBeneficiariesSearchTerm);
  const filterBy = useSelector(selectBeneficiariesFilterBy);

  // Local state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [beneficiaryToDelete, setBeneficiaryToDelete] = useState(null);
  const [showBeneficiaryDetails, setShowBeneficiaryDetails] = useState(false);

  // Form state
  const [beneficiaryForm, setBeneficiaryForm] = useState({
    name: '',
    nationalId: '',
    phone: '',
    address: '',
    familySize: 1,
    monthlyIncome: 0,
    needsDescription: '',
    status: 'active',
    children: [],
    notes: ''
  });

  // تحميل المستفيدين عند بدء التشغيل
  useEffect(() => {
    dispatch(loadBeneficiaries());
  }, [dispatch]);

  // حفظ المستفيدين عند التغيير
  useEffect(() => {
    if (allBeneficiaries.length > 0) {
      dispatch(saveBeneficiaries());
    }
  }, [allBeneficiaries, dispatch]);

  // معالج إضافة مستفيد
  const handleAddBeneficiary = () => {
    if (!hasPermission(PERMISSIONS.BENEFICIARIES_CREATE)) {
      dispatch(addNotification({
        type: 'error',
        message: 'ليس لديك صلاحية لإضافة مستفيدين'
      }));
      return;
    }

    if (!beneficiaryForm.name || !beneficiaryForm.nationalId || !beneficiaryForm.phone) {
      dispatch(addNotification({
        type: 'error',
        message: 'يرجى ملء جميع الحقول المطلوبة'
      }));
      return;
    }

    // التحقق من عدم تكرار الرقم القومي
    const nationalIdExists = allBeneficiaries.some(b => b.nationalId === beneficiaryForm.nationalId);
    if (nationalIdExists) {
      dispatch(addNotification({
        type: 'error',
        message: 'الرقم القومي مستخدم بالفعل'
      }));
      return;
    }

    dispatch(addBeneficiary(beneficiaryForm));
    dispatch(addNotification({
      type: 'success',
      message: 'تم إضافة المستفيد بنجاح'
    }));

    setBeneficiaryForm({
      name: '',
      nationalId: '',
      phone: '',
      address: '',
      familySize: 1,
      monthlyIncome: 0,
      needsDescription: '',
      status: 'active',
      children: [],
      notes: ''
    });
    setShowAddModal(false);
  };

  // معالج تعديل مستفيد
  const handleEditBeneficiary = () => {
    if (!hasPermission(PERMISSIONS.BENEFICIARIES_EDIT)) {
      dispatch(addNotification({
        type: 'error',
        message: 'ليس لديك صلاحية لتعديل المستفيدين'
      }));
      return;
    }

    dispatch(updateBeneficiary({
      id: selectedBeneficiary.id,
      ...beneficiaryForm
    }));

    dispatch(addNotification({
      type: 'success',
      message: 'تم تحديث بيانات المستفيد بنجاح'
    }));

    setShowEditModal(false);
    setSelectedBeneficiary(null);
  };

  // معالج حذف مستفيد
  const handleDeleteBeneficiary = () => {
    if (!hasPermission(PERMISSIONS.BENEFICIARIES_DELETE)) {
      dispatch(addNotification({
        type: 'error',
        message: 'ليس لديك صلاحية لحذف المستفيدين'
      }));
      return;
    }

    dispatch(deleteBeneficiary(beneficiaryToDelete.id));
    dispatch(addNotification({
      type: 'success',
      message: 'تم حذف المستفيد بنجاح'
    }));

    setShowDeleteConfirm(false);
    setBeneficiaryToDelete(null);
  };

  // معالج فتح نموذج التعديل
  const openEditModal = (beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setBeneficiaryForm(beneficiary);
    setShowEditModal(true);
  };

  // معالج عرض تفاصيل المستفيد
  const viewBeneficiaryDetails = (beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setShowBeneficiaryDetails(true);
  };

  // معالج تغيير حقول النموذج
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setBeneficiaryForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      className="beneficiaries-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="page-header" variants={itemVariants}>
        <div className="header-content">
          <div className="header-text">
            <h1>
              <FaUsers className="page-icon" />
              المستفيدون
            </h1>
            <p>إدارة بيانات المستفيدين من خدمات المؤسسة</p>
          </div>
          
          <PermissionGuard permission={PERMISSIONS.BENEFICIARIES_CREATE}>
            <motion.button
              className="btn btn-primary add-btn"
              onClick={() => setShowAddModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPlus />
              إضافة مستفيد
            </motion.button>
          </PermissionGuard>
        </div>

        {/* Statistics */}
        <div className="stats-grid">
          <motion.div className="stat-card total" variants={itemVariants}>
            <div className="stat-icon">
              <FaUsers />
            </div>
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>إجمالي المستفيدين</p>
            </div>
          </motion.div>

          <motion.div className="stat-card active" variants={itemVariants}>
            <div className="stat-icon">
              <FaUserCheck />
            </div>
            <div className="stat-content">
              <h3>{stats.active}</h3>
              <p>مستفيدون نشطون</p>
            </div>
          </motion.div>

          <motion.div className="stat-card inactive" variants={itemVariants}>
            <div className="stat-icon">
              <FaUserTimes />
            </div>
            <div className="stat-content">
              <h3>{stats.inactive}</h3>
              <p>مستفيدون غير نشطين</p>
            </div>
          </motion.div>

          <motion.div className="stat-card families" variants={itemVariants}>
            <div className="stat-icon">
              <FaBaby />
            </div>
            <div className="stat-content">
              <h3>{stats.totalFamilyMembers}</h3>
              <p>إجمالي أفراد الأسر</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div className="controls-section" variants={itemVariants}>
        <div className="search-filter-container">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="البحث في المستفيدين..."
              value={searchTerm}
              onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            />
          </div>

          <div className="filter-controls">
            <select
              value={filterBy}
              onChange={(e) => dispatch(setFilterBy(e.target.value))}
              className="filter-select"
            >
              <option value="all">جميع المستفيدين</option>
              <option value="active">نشطون</option>
              <option value="inactive">غير نشطين</option>
              <option value="recent">مضافون حديثاً</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Beneficiaries List */}
      <motion.div className="beneficiaries-content" variants={itemVariants}>
        {beneficiaries.length === 0 ? (
          <div className="empty-state">
            <FaUsers className="empty-icon" />
            <h3>لا يوجد مستفيدون</h3>
            <p>
              {searchTerm || filterBy !== 'all' 
                ? 'لا توجد نتائج تطابق البحث أو الفلتر المحدد'
                : 'ابدأ بإضافة مستفيدين جدد للمؤسسة'
              }
            </p>
            {!searchTerm && filterBy === 'all' && (
              <PermissionGuard permission={PERMISSIONS.BENEFICIARIES_CREATE}>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowAddModal(true)}
                >
                  <FaPlus />
                  إضافة أول مستفيد
                </button>
              </PermissionGuard>
            )}
          </div>
        ) : (
          <div className="beneficiaries-grid">
            {beneficiaries.map((beneficiary, index) => (
              <motion.div
                key={beneficiary.id}
                className={`beneficiary-card ${beneficiary.status}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 8px 25px rgba(0,0,0,0.15)" }}
              >
                <div className="beneficiary-header">
                  <div className="beneficiary-avatar">
                    {beneficiary.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="beneficiary-info">
                    <h3>{beneficiary.name}</h3>
                    <p className="beneficiary-id">الرقم القومي: {beneficiary.nationalId}</p>
                    <span className={`status-badge ${beneficiary.status}`}>
                      {beneficiary.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                </div>

                <div className="beneficiary-details">
                  <div className="detail-item">
                    <FaPhone />
                    <span>{beneficiary.phone}</span>
                  </div>
                  <div className="detail-item">
                    <FaUsers />
                    <span>حجم الأسرة: {beneficiary.familySize}</span>
                  </div>
                  <div className="detail-item">
                    <FaMapMarkerAlt />
                    <span>{beneficiary.address || 'غير محدد'}</span>
                  </div>
                  <div className="detail-item">
                    <FaCalendarAlt />
                    <span>مضاف في {new Date(beneficiary.createdAt).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>

                <div className="beneficiary-actions">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => viewBeneficiaryDetails(beneficiary)}
                    title="عرض التفاصيل"
                  >
                    <FaEye />
                  </button>

                  <PermissionGuard permission={PERMISSIONS.BENEFICIARIES_EDIT}>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => openEditModal(beneficiary)}
                      title="تعديل"
                    >
                      <FaEdit />
                    </button>
                  </PermissionGuard>

                  <PermissionGuard permission={PERMISSIONS.BENEFICIARIES_DELETE}>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => {
                        setBeneficiaryToDelete(beneficiary);
                        setShowDeleteConfirm(true);
                      }}
                      title="حذف"
                    >
                      <FaTrash />
                    </button>
                  </PermissionGuard>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Beneficiaries;
