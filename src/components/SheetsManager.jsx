import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaClipboardList, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter,
  FaUsers, FaCalendarAlt, FaEye, FaDownload, FaUpload,
  FaTimes, FaCheck, FaUserPlus, FaUserMinus, FaPrint
} from 'react-icons/fa';
import {
  selectAllSheets,
  selectSheetsLoading,
  selectSheetsError,
  selectSheetsStats,
  fetchSheets,
  createSheet,
  updateSheet,
  deleteSheet,
  addBeneficiaryToSheet,
  removeBeneficiaryFromSheet,
  setSelectedSheet,
  clearSelectedSheet
} from '../features/sheets/sheetsSlice';
import { selectAllBeneficiaries } from '../features/beneficiaries/beneficiariesSlice';
import { addNotification } from '../features/notifications/notificationsSlice';
import PermissionGuard from './PermissionGuard';
import { usePermissions, PERMISSIONS } from '../hooks/usePermissions';
import './SheetsManager.css';

/**
 * SheetsManager Component
 * 
 * مكون إدارة الكشفات - إنشاء وإدارة كشفات المستفيدين
 */
const SheetsManager = () => {
  const dispatch = useDispatch();
  const { isAdmin, hasPermission } = usePermissions();
  
  // Redux state
  const sheets = useSelector(selectAllSheets);
  const isLoading = useSelector(selectSheetsLoading);
  const error = useSelector(selectSheetsError);
  const stats = useSelector(selectSheetsStats);
  const allBeneficiaries = useSelector(selectAllBeneficiaries);

  // Local state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddBeneficiaryModal, setShowAddBeneficiaryModal] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');

  // Form state
  const [sheetForm, setSheetForm] = useState({
    name: '',
    description: ''
  });

  // Load sheets on component mount
  useEffect(() => {
    dispatch(fetchSheets());
  }, [dispatch]);

  // Filter sheets
  const filteredSheets = sheets.filter(sheet => {
    const matchesSearch = !searchTerm ||
      sheet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sheet.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterBy === 'all' ||
      (filterBy === 'active' && sheet.status === 'active') ||
      (filterBy === 'inactive' && sheet.status === 'inactive') ||
      (filterBy === 'recent' && new Date(sheet.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

    return matchesSearch && matchesFilter;
  });

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setSheetForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle create sheet
  const handleCreateSheet = () => {
    if (!hasPermission(PERMISSIONS.BENEFICIARIES_CREATE)) {
      dispatch(addNotification({
        type: 'error',
        message: 'ليس لديك صلاحية لإنشاء كشفات'
      }));
      return;
    }

    if (!sheetForm.name.trim()) {
      dispatch(addNotification({
        type: 'error',
        message: 'يرجى إدخال اسم الكشف'
      }));
      return;
    }

    dispatch(createSheet(sheetForm));
    setSheetForm({ name: '', description: '' });
    setShowCreateModal(false);
  };

  // Handle edit sheet
  const handleEditSheet = () => {
    if (!hasPermission(PERMISSIONS.BENEFICIARIES_EDIT)) {
      dispatch(addNotification({
        type: 'error',
        message: 'ليس لديك صلاحية لتعديل الكشفات'
      }));
      return;
    }

    dispatch(updateSheet({
      ...selectedSheet,
      ...sheetForm
    }));
    setShowEditModal(false);
    setSelectedSheet(null);
    setSheetForm({ name: '', description: '' });
  };

  // Handle delete sheet
  const handleDeleteSheet = (sheet) => {
    if (!hasPermission(PERMISSIONS.BENEFICIARIES_DELETE)) {
      dispatch(addNotification({
        type: 'error',
        message: 'ليس لديك صلاحية لحذف الكشفات'
      }));
      return;
    }

    if (confirm(`هل أنت متأكد من حذف الكشف "${sheet.name}"؟`)) {
      dispatch(deleteSheet(sheet.id));
    }
  };

  // Handle open edit modal
  const openEditModal = (sheet) => {
    setSelectedSheet(sheet);
    setSheetForm({
      name: sheet.name,
      description: sheet.description || ''
    });
    setShowEditModal(true);
  };

  // Handle open add beneficiary modal
  const openAddBeneficiaryModal = (sheet) => {
    setSelectedSheet(sheet);
    setShowAddBeneficiaryModal(true);
  };

  // Handle add beneficiary to sheet
  const handleAddBeneficiaryToSheet = (beneficiary) => {
    dispatch(addBeneficiaryToSheet({
      sheetId: selectedSheet.id,
      beneficiary
    }));
    setShowAddBeneficiaryModal(false);
  };

  // Handle remove beneficiary from sheet
  const handleRemoveBeneficiaryFromSheet = (beneficiaryId) => {
    if (confirm('هل أنت متأكد من إزالة هذا المستفيد من الكشف؟')) {
      dispatch(removeBeneficiaryFromSheet({
        sheetId: selectedSheet.id,
        beneficiaryId
      }));
    }
  };

  // Get available beneficiaries (not in current sheet)
  const getAvailableBeneficiaries = () => {
    if (!selectedSheet) return [];
    const sheetBeneficiaryIds = selectedSheet.beneficiaries.map(b => b.id);
    return allBeneficiaries.filter(b => !sheetBeneficiaryIds.includes(b.id));
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (isLoading) {
    return (
      <div className="sheets-manager-loading">
        <div className="loading-spinner"></div>
        <p>جاري تحميل الكشفات...</p>
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermission={PERMISSIONS.BENEFICIARIES_VIEW}>
      <motion.div
        className="sheets-manager"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="sheets-header" variants={itemVariants}>
          <div className="header-content">
            <div className="header-title">
              <FaClipboardList className="header-icon" />
              <h1>إدارة الكشفات</h1>
            </div>
            <div className="header-actions">
              <motion.button
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!hasPermission(PERMISSIONS.BENEFICIARIES_CREATE)}
              >
                <FaPlus />
                إنشاء كشف جديد
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div className="sheets-stats" variants={itemVariants}>
          <div className="stat-card">
            <FaClipboardList className="stat-icon" />
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>إجمالي الكشفات</p>
            </div>
          </div>
          <div className="stat-card">
            <FaUsers className="stat-icon" />
            <div className="stat-content">
              <h3>{stats.totalBeneficiaries}</h3>
              <p>إجمالي المستفيدين</p>
            </div>
          </div>
          <div className="stat-card">
            <FaCheck className="stat-icon" />
            <div className="stat-content">
              <h3>{stats.active}</h3>
              <p>الكشفات النشطة</p>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div className="sheets-controls" variants={itemVariants}>
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="البحث في الكشفات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-controls">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
            >
              <option value="all">جميع الكشفات</option>
              <option value="active">الكشفات النشطة</option>
              <option value="inactive">الكشفات غير النشطة</option>
              <option value="recent">الكشفات الحديثة</option>
            </select>
          </div>
        </motion.div>

        {/* Sheets List */}
        <motion.div className="sheets-list" variants={itemVariants}>
          {filteredSheets.length === 0 ? (
            <div className="empty-state">
              <FaClipboardList className="empty-icon" />
              <h3>لا توجد كشفات</h3>
              <p>ابدأ بإنشاء كشف جديد لإدارة المستفيدين</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                إنشاء كشف جديد
              </button>
            </div>
          ) : (
            <div className="sheets-grid">
              {filteredSheets.map((sheet) => (
                <motion.div
                  key={sheet.id}
                  className="sheet-card"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="sheet-header">
                    <h3>{sheet.name}</h3>
                    <div className="sheet-actions">
                      <button
                        className="btn-icon"
                        onClick={() => openAddBeneficiaryModal(sheet)}
                        title="إضافة مستفيد"
                      >
                        <FaUserPlus />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => openEditModal(sheet)}
                        title="تعديل الكشف"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-icon danger"
                        onClick={() => handleDeleteSheet(sheet)}
                        title="حذف الكشف"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  <div className="sheet-content">
                    {sheet.description && (
                      <p className="sheet-description">{sheet.description}</p>
                    )}
                    
                    <div className="sheet-stats">
                      <div className="stat">
                        <FaUsers />
                        <span>{sheet.beneficiaryCount} مستفيد</span>
                      </div>
                      <div className="stat">
                        <FaCalendarAlt />
                        <span>{new Date(sheet.createdAt).toLocaleDateString('ar-EG')}</span>
                      </div>
                    </div>

                    {sheet.beneficiaries.length > 0 && (
                      <div className="sheet-beneficiaries">
                        <h4>المستفيدون:</h4>
                        <div className="beneficiaries-list">
                          {sheet.beneficiaries.slice(0, 3).map((beneficiary) => (
                            <div key={beneficiary.id} className="beneficiary-item">
                              <span>{beneficiary.name}</span>
                              <button
                                className="btn-icon small danger"
                                onClick={() => handleRemoveBeneficiaryFromSheet(beneficiary.id)}
                                title="إزالة من الكشف"
                              >
                                <FaUserMinus />
                              </button>
                            </div>
                          ))}
                          {sheet.beneficiaries.length > 3 && (
                            <div className="more-beneficiaries">
                              +{sheet.beneficiaries.length - 3} مستفيد آخر
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Create Sheet Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="modal-content"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <div className="modal-header">
                  <h2>إنشاء كشف جديد</h2>
                  <button
                    className="btn-icon"
                    onClick={() => setShowCreateModal(false)}
                  >
                    <FaTimes />
                  </button>
                </div>
                
                <div className="modal-body">
                  <div className="form-group">
                    <label>اسم الكشف</label>
                    <input
                      type="text"
                      name="name"
                      value={sheetForm.name}
                      onChange={handleFormChange}
                      placeholder="أدخل اسم الكشف"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>وصف الكشف (اختياري)</label>
                    <textarea
                      name="description"
                      value={sheetForm.description}
                      onChange={handleFormChange}
                      placeholder="أدخل وصف الكشف"
                      rows="3"
                    />
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    إلغاء
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleCreateSheet}
                  >
                    إنشاء الكشف
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Sheet Modal */}
        <AnimatePresence>
          {showEditModal && selectedSheet && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="modal-content"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <div className="modal-header">
                  <h2>تعديل الكشف</h2>
                  <button
                    className="btn-icon"
                    onClick={() => setShowEditModal(false)}
                  >
                    <FaTimes />
                  </button>
                </div>
                
                <div className="modal-body">
                  <div className="form-group">
                    <label>اسم الكشف</label>
                    <input
                      type="text"
                      name="name"
                      value={sheetForm.name}
                      onChange={handleFormChange}
                      placeholder="أدخل اسم الكشف"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>وصف الكشف (اختياري)</label>
                    <textarea
                      name="description"
                      value={sheetForm.description}
                      onChange={handleFormChange}
                      placeholder="أدخل وصف الكشف"
                      rows="3"
                    />
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    إلغاء
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleEditSheet}
                  >
                    حفظ التغييرات
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Beneficiary Modal */}
        <AnimatePresence>
          {showAddBeneficiaryModal && selectedSheet && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="modal-content large"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <div className="modal-header">
                  <h2>إضافة مستفيد إلى الكشف: {selectedSheet.name}</h2>
                  <button
                    className="btn-icon"
                    onClick={() => setShowAddBeneficiaryModal(false)}
                  >
                    <FaTimes />
                  </button>
                </div>
                
                <div className="modal-body">
                  <div className="available-beneficiaries">
                    <h3>المستفيدون المتاحون</h3>
                    {getAvailableBeneficiaries().length === 0 ? (
                      <p className="no-beneficiaries">لا توجد مستفيدين متاحين للإضافة</p>
                    ) : (
                      <div className="beneficiaries-grid">
                        {getAvailableBeneficiaries().map((beneficiary) => (
                          <div key={beneficiary.id} className="beneficiary-card">
                            <div className="beneficiary-info">
                              <h4>{beneficiary.name}</h4>
                              <p>{beneficiary.nationalId}</p>
                              <p>{beneficiary.phone}</p>
                            </div>
                            <button
                              className="btn btn-primary small"
                              onClick={() => handleAddBeneficiaryToSheet(beneficiary)}
                            >
                              <FaUserPlus />
                              إضافة
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowAddBeneficiaryModal(false)}
                  >
                    إغلاق
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </PermissionGuard>
  );
};

export default SheetsManager; 