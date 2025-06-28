import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUsers, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter,
  FaSort, FaUserPlus, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaCalendarAlt, FaBriefcase, FaGraduationCap, FaHeart,
  FaEye, FaDownload, FaUpload, FaUserCheck, FaUserTimes,
  FaChartBar, FaUsers as FaUsersIcon, FaUserCog
} from 'react-icons/fa';
import {
  selectAllVolunteers,
  selectFilteredVolunteers,
  selectVolunteersStats,
  selectVolunteersSearchTerm,
  selectVolunteersFilterBy,
  addVolunteer,
  updateVolunteer,
  deleteVolunteer,
  setSearchTerm,
  setFilterBy,
  loadVolunteers,
  saveVolunteers
} from '../features/volunteers/volunteersSlice';
import { addNotification } from '../features/notifications/notificationsSlice';
import PermissionGuard from '../components/PermissionGuard';
import { usePermissions, PERMISSIONS } from '../hooks/usePermissions';
import './Volunteers.css';

/**
 * Volunteers Component
 * 
 * صفحة إدارة المتطوعين مع نظام صلاحيات
 */
const Volunteers = () => {
  const dispatch = useDispatch();
  const { isAdmin, hasPermission } = usePermissions();
  
  // Redux state
  const volunteers = useSelector(selectFilteredVolunteers);
  const allVolunteers = useSelector(selectAllVolunteers);
  const stats = useSelector(selectVolunteersStats);
  const searchTerm = useSelector(selectVolunteersSearchTerm);
  const filterBy = useSelector(selectVolunteersFilterBy);

  // Local state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [volunteerToDelete, setVolunteerToDelete] = useState(null);
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);
  const [showVolunteerDetails, setShowVolunteerDetails] = useState(false);

  // Form state
  const [volunteerForm, setVolunteerForm] = useState({
    name: '',
    email: '',
    phone: '',
    nationalId: '',
    address: '',
    birthDate: '',
    gender: 'male',
    qualification: '',
    job: '',
    department: '',
    skills: '',
    experience: '',
    availability: 'part-time',
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    },
    notes: ''
  });

  // تحميل المتطوعين عند بدء التشغيل
  useEffect(() => {
    dispatch(loadVolunteers());
  }, [dispatch]);

  // حفظ المتطوعين عند التغيير
  useEffect(() => {
    if (allVolunteers.length > 0) {
      dispatch(saveVolunteers());
    }
  }, [allVolunteers, dispatch]);

  // معالج إضافة متطوع
  const handleAddVolunteer = (e) => {
    e.preventDefault();

    if (!hasPermission(PERMISSIONS.VOLUNTEERS_CREATE)) {
      dispatch(addNotification({
        type: 'error',
        message: 'ليس لديك صلاحية لإضافة متطوعين'
      }));
      return;
    }

    if (!volunteerForm.name || !volunteerForm.email || !volunteerForm.phone || !volunteerForm.department || !volunteerForm.qualification) {
      dispatch(addNotification({
        type: 'error',
        message: 'يرجى ملء جميع الحقول المطلوبة'
      }));
      return;
    }

    // التحقق من عدم تكرار البريد الإلكتروني
    const emailExists = allVolunteers.some(v => v.email === volunteerForm.email);
    if (emailExists) {
      dispatch(addNotification({
        type: 'error',
        message: 'البريد الإلكتروني مستخدم بالفعل'
      }));
      return;
    }

    // تحويل المهارات إلى مصفوفة
    const skillsArray = volunteerForm.skills.split(',').map(skill => skill.trim()).filter(Boolean);

    dispatch(addVolunteer({
      ...volunteerForm,
      skills: skillsArray,
      status: 'active'
    }));

    dispatch(addNotification({
      type: 'success',
      message: 'تم إضافة المتطوع بنجاح'
    }));

    setVolunteerForm({
      name: '',
      email: '',
      phone: '',
      nationalId: '',
      address: '',
      birthDate: '',
      gender: 'male',
      qualification: '',
      job: '',
      department: '',
      skills: '',
      experience: '',
      availability: 'part-time',
      emergencyContact: { name: '', phone: '', relation: '' },
      notes: ''
    });
    setShowAddModal(false);
  };

  // معالج تعديل متطوع
  const handleEditVolunteer = (e) => {
    e.preventDefault();

    if (!hasPermission(PERMISSIONS.VOLUNTEERS_EDIT)) {
      dispatch(addNotification({
        type: 'error',
        message: 'ليس لديك صلاحية لتعديل المتطوعين'
      }));
      return;
    }

    // تحويل المهارات إلى مصفوفة
    const skillsArray = typeof volunteerForm.skills === 'string'
      ? volunteerForm.skills.split(',').map(skill => skill.trim()).filter(Boolean)
      : volunteerForm.skills;

    dispatch(updateVolunteer({
      id: selectedVolunteer.id,
      ...volunteerForm,
      skills: skillsArray
    }));

    dispatch(addNotification({
      type: 'success',
      message: 'تم تحديث بيانات المتطوع بنجاح'
    }));

    setShowEditModal(false);
    setSelectedVolunteer(null);
  };

  // معالج حذف متطوع
  const handleDeleteVolunteer = () => {
    if (!hasPermission(PERMISSIONS.VOLUNTEERS_DELETE)) {
      dispatch(addNotification({
        type: 'error',
        message: 'ليس لديك صلاحية لحذف المتطوعين'
      }));
      return;
    }

    dispatch(deleteVolunteer(volunteerToDelete.id));
    dispatch(addNotification({
      type: 'success',
      message: 'تم حذف المتطوع بنجاح'
    }));

    setShowDeleteConfirm(false);
    setVolunteerToDelete(null);
  };

  // معالج فتح نموذج التعديل
  const openEditModal = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setVolunteerForm({
      ...volunteer,
      skills: Array.isArray(volunteer.skills) ? volunteer.skills.join(', ') : volunteer.skills || ''
    });
    setShowEditModal(true);
  };

  // معالج عرض تفاصيل المتطوع
  const viewVolunteerDetails = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowVolunteerDetails(true);
  };

  // معالج تغيير حقول النموذج
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setVolunteerForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setVolunteerForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // معالج تغيير المهارات
  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map(skill => skill.trim()).filter(Boolean);
    setVolunteerForm(prev => ({
      ...prev,
      skills
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
      className="volunteers-container"
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
              المتطوعون
            </h1>
            <p>إدارة بيانات المتطوعين والمساعدين في المؤسسة</p>
          </div>
          
          <PermissionGuard permission={PERMISSIONS.VOLUNTEERS_CREATE}>
            <motion.button
              className="btn btn-primary add-btn"
              onClick={() => setShowAddModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="إضافة متطوع جديد للمؤسسة"
            >
              <FaUserPlus />
              إضافة متطوع جديد
            </motion.button>
          </PermissionGuard>
        </div>

        {/* Statistics */}
        <div className="stats-grid">
          <motion.div className="stat-card total" variants={itemVariants}>
            <div className="stat-icon">
              <FaUsersIcon />
            </div>
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>إجمالي المتطوعين</p>
            </div>
          </motion.div>

          <motion.div className="stat-card active" variants={itemVariants}>
            <div className="stat-icon">
              <FaUserCheck />
            </div>
            <div className="stat-content">
              <h3>{stats.active}</h3>
              <p>متطوعون نشطون</p>
            </div>
          </motion.div>

          <motion.div className="stat-card inactive" variants={itemVariants}>
            <div className="stat-icon">
              <FaUserTimes />
            </div>
            <div className="stat-content">
              <h3>{stats.inactive}</h3>
              <p>متطوعون غير نشطين</p>
            </div>
          </motion.div>

          <motion.div className="stat-card new" variants={itemVariants}>
            <div className="stat-icon">
              <FaUserPlus />
            </div>
            <div className="stat-content">
              <h3>{stats.new}</h3>
              <p>متطوعون جدد</p>
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
              placeholder="البحث في المتطوعين..."
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
              <option value="all">جميع المتطوعين</option>
              <option value="active">نشطون</option>
              <option value="inactive">غير نشطين</option>
              <option value="new">جدد</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Volunteers List */}
      <motion.div className="volunteers-content" variants={itemVariants}>
        {volunteers.length === 0 ? (
          <div className="empty-state">
            <FaUsers className="empty-icon" />
            <h3>لا يوجد متطوعون</h3>
            <p>
              {searchTerm || filterBy !== 'all' 
                ? 'لا توجد نتائج تطابق البحث أو الفلتر المحدد'
                : 'ابدأ بإضافة متطوعين جدد للمؤسسة'
              }
            </p>
            {!searchTerm && filterBy === 'all' && (
              <PermissionGuard permission={PERMISSIONS.VOLUNTEERS_CREATE}>
                <motion.button
                  className="btn btn-primary add-btn"
                  onClick={() => setShowAddModal(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaUserPlus />
                  إضافة أول متطوع
                </motion.button>
              </PermissionGuard>
            )}
          </div>
        ) : (
          <div className="volunteers-grid">
            {volunteers.map((volunteer, index) => (
              <motion.div
                key={volunteer.id}
                className={`volunteer-card ${volunteer.status}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 8px 25px rgba(0,0,0,0.15)" }}
              >
                <div className="volunteer-header">
                  <div className="volunteer-avatar">
                    {volunteer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="volunteer-info">
                    <h3>{volunteer.name}</h3>
                    <p className="volunteer-department">{volunteer.department}</p>
                    <span className={`status-badge ${volunteer.status}`}>
                      {volunteer.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                </div>

                <div className="volunteer-details">
                  <div className="detail-item">
                    <FaEnvelope />
                    <span>{volunteer.email}</span>
                  </div>
                  <div className="detail-item">
                    <FaPhone />
                    <span>{volunteer.phone}</span>
                  </div>
                  <div className="detail-item">
                    <FaCalendarAlt />
                    <span>انضم في {new Date(volunteer.joinDate).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>

                <div className="volunteer-actions">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => viewVolunteerDetails(volunteer)}
                    title="عرض التفاصيل"
                  >
                    <FaEye />
                  </button>

                  <PermissionGuard permission={PERMISSIONS.VOLUNTEERS_EDIT}>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => openEditModal(volunteer)}
                      title="تعديل"
                    >
                      <FaEdit />
                    </button>
                  </PermissionGuard>

                  <PermissionGuard permission={PERMISSIONS.VOLUNTEERS_DELETE}>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => {
                        setVolunteerToDelete(volunteer);
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



      {/* Edit Volunteer Modal */}
      <AnimatePresence>
        {showEditModal && selectedVolunteer && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              className="modal-content volunteer-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>تعديل بيانات المتطوع</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  ✕
                </button>
              </div>

              <form className="volunteer-form" onSubmit={(e) => {
                e.preventDefault();
                handleEditVolunteer();
              }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="edit-name">الاسم الكامل *</label>
                    <input
                      type="text"
                      id="edit-name"
                      name="name"
                      value={volunteerForm.name}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-email">البريد الإلكتروني *</label>
                    <input
                      type="email"
                      id="edit-email"
                      name="email"
                      value={volunteerForm.email}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-phone">رقم الهاتف *</label>
                    <input
                      type="tel"
                      id="edit-phone"
                      name="phone"
                      value={volunteerForm.phone}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-status">الحالة</label>
                    <select
                      id="edit-status"
                      name="status"
                      value={volunteerForm.status}
                      onChange={handleFormChange}
                    >
                      <option value="active">نشط</option>
                      <option value="inactive">غير نشط</option>
                    </select>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    <FaEdit />
                    حفظ التغييرات
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && volunteerToDelete && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              className="modal-content delete-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>تأكيد الحذف</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <p>هل أنت متأكد من حذف المتطوع <strong>{volunteerToDelete.name}</strong>؟</p>
                <p className="warning-text">لا يمكن التراجع عن هذا الإجراء.</p>
              </div>

              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  إلغاء
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDeleteVolunteer}
                >
                  <FaTrash />
                  حذف المتطوع
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Volunteer Details Modal */}
      <AnimatePresence>
        {showVolunteerDetails && selectedVolunteer && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowVolunteerDetails(false)}
          >
            <motion.div
              className="modal-content details-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>تفاصيل المتطوع</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowVolunteerDetails(false)}
                >
                  ✕
                </button>
              </div>

              <div className="volunteer-details-content">
                <div className="volunteer-profile">
                  <div className="profile-avatar">
                    {selectedVolunteer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="profile-info">
                    <h3>{selectedVolunteer.name}</h3>
                    <p>{selectedVolunteer.department}</p>
                    <span className={`status-badge ${selectedVolunteer.status}`}>
                      {selectedVolunteer.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                </div>

                <div className="details-grid">
                  <div className="detail-section">
                    <h4>معلومات الاتصال</h4>
                    <div className="detail-item">
                      <FaEnvelope />
                      <span>{selectedVolunteer.email}</span>
                    </div>
                    <div className="detail-item">
                      <FaPhone />
                      <span>{selectedVolunteer.phone}</span>
                    </div>
                    {selectedVolunteer.address && (
                      <div className="detail-item">
                        <FaMapMarkerAlt />
                        <span>{selectedVolunteer.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="detail-section">
                    <h4>معلومات شخصية</h4>
                    <div className="detail-item">
                      <span>الجنس: {selectedVolunteer.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
                    </div>
                    {selectedVolunteer.birthDate && (
                      <div className="detail-item">
                        <FaCalendarAlt />
                        <span>تاريخ الميلاد: {new Date(selectedVolunteer.birthDate).toLocaleDateString('ar-EG')}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <FaCalendarAlt />
                      <span>تاريخ الانضمام: {new Date(selectedVolunteer.joinDate).toLocaleDateString('ar-EG')}</span>
                    </div>
                  </div>

                  {selectedVolunteer.skills && selectedVolunteer.skills.length > 0 && (
                    <div className="detail-section">
                      <h4>المهارات</h4>
                      <div className="skills-list">
                        {selectedVolunteer.skills.map((skill, index) => (
                          <span key={index} className="skill-tag">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedVolunteer.notes && (
                    <div className="detail-section">
                      <h4>ملاحظات</h4>
                      <p>{selectedVolunteer.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowVolunteerDetails(false)}
                >
                  إغلاق
                </button>
                <PermissionGuard permission={PERMISSIONS.VOLUNTEERS_EDIT}>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setShowVolunteerDetails(false);
                      openEditModal(selectedVolunteer);
                    }}
                  >
                    <FaEdit />
                    تعديل
                  </button>
                </PermissionGuard>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Volunteer Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              className="modal-content volunteer-form-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>
                  <FaUserPlus />
                  إضافة متطوع جديد
                </h2>
                <button
                  className="close-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleAddVolunteer} className="volunteer-form">
                <div className="form-grid">
                  {/* البيانات الشخصية */}
                  <div className="form-section">
                    <h3>البيانات الشخصية</h3>

                    <div className="form-group">
                      <label htmlFor="name">الاسم الكامل *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={volunteerForm.name}
                        onChange={handleFormChange}
                        required
                        placeholder="أدخل الاسم الكامل"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">البريد الإلكتروني *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={volunteerForm.email}
                        onChange={handleFormChange}
                        required
                        placeholder="example@email.com"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">رقم الهاتف *</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={volunteerForm.phone}
                        onChange={handleFormChange}
                        required
                        placeholder="01234567890"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="nationalId">الرقم القومي</label>
                      <input
                        type="text"
                        id="nationalId"
                        name="nationalId"
                        value={volunteerForm.nationalId}
                        onChange={handleFormChange}
                        placeholder="14 رقم"
                        maxLength="14"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="address">العنوان</label>
                      <textarea
                        id="address"
                        name="address"
                        value={volunteerForm.address}
                        onChange={handleFormChange}
                        rows="2"
                        placeholder="أدخل العنوان"
                      />
                    </div>
                  </div>

                  {/* المؤهلات والوظيفة */}
                  <div className="form-section">
                    <h3>المؤهلات والوظيفة</h3>

                    <div className="form-group">
                      <label htmlFor="qualification">المؤهل التعليمي *</label>
                      <select
                        id="qualification"
                        name="qualification"
                        value={volunteerForm.qualification}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="">اختر المؤهل</option>
                        <option value="high-school">ثانوية عامة</option>
                        <option value="diploma">دبلوم</option>
                        <option value="bachelor">بكالوريوس</option>
                        <option value="master">ماجستير</option>
                        <option value="phd">دكتوراه</option>
                        <option value="other">أخرى</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="job">الوظيفة الحالية</label>
                      <input
                        type="text"
                        id="job"
                        name="job"
                        value={volunteerForm.job}
                        onChange={handleFormChange}
                        placeholder="مثال: مهندس، طبيب، معلم"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="department">القسم *</label>
                      <select
                        id="department"
                        name="department"
                        value={volunteerForm.department}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="">اختر القسم</option>
                        <option value="education">التعليم والتدريب</option>
                        <option value="health">الصحة والرعاية</option>
                        <option value="social">الشؤون الاجتماعية</option>
                        <option value="finance">المالية والمحاسبة</option>
                        <option value="media">الإعلام والتسويق</option>
                        <option value="logistics">اللوجستيات والتنظيم</option>
                        <option value="it">تقنية المعلومات</option>
                        <option value="legal">الشؤون القانونية</option>
                        <option value="other">أخرى</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="skills">المهارات</label>
                      <input
                        type="text"
                        id="skills"
                        name="skills"
                        value={volunteerForm.skills}
                        onChange={handleFormChange}
                        placeholder="مثال: تصميم، برمجة، تدريس (مفصولة بفواصل)"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="experience">الخبرات السابقة</label>
                      <textarea
                        id="experience"
                        name="experience"
                        value={volunteerForm.experience}
                        onChange={handleFormChange}
                        rows="3"
                        placeholder="اذكر خبراتك السابقة"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    <FaTimes />
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    <FaCheck />
                    إضافة المتطوع
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Volunteer Modal */}
      <AnimatePresence>
        {showEditModal && selectedVolunteer && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              className="modal-content volunteer-form-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>
                  <FaEdit />
                  تعديل بيانات المتطوع
                </h2>
                <button
                  className="close-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleEditVolunteer} className="volunteer-form">
                <div className="form-grid">
                  {/* نفس الحقول مع القيم المحملة */}
                  <div className="form-section">
                    <h3>البيانات الشخصية</h3>

                    <div className="form-group">
                      <label htmlFor="edit-name">الاسم الكامل *</label>
                      <input
                        type="text"
                        id="edit-name"
                        name="name"
                        value={volunteerForm.name}
                        onChange={handleFormChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit-email">البريد الإلكتروني *</label>
                      <input
                        type="email"
                        id="edit-email"
                        name="email"
                        value={volunteerForm.email}
                        onChange={handleFormChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit-phone">رقم الهاتف *</label>
                      <input
                        type="tel"
                        id="edit-phone"
                        name="phone"
                        value={volunteerForm.phone}
                        onChange={handleFormChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit-department">القسم *</label>
                      <select
                        id="edit-department"
                        name="department"
                        value={volunteerForm.department}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="">اختر القسم</option>
                        <option value="education">التعليم والتدريب</option>
                        <option value="health">الصحة والرعاية</option>
                        <option value="social">الشؤون الاجتماعية</option>
                        <option value="finance">المالية والمحاسبة</option>
                        <option value="media">الإعلام والتسويق</option>
                        <option value="logistics">اللوجستيات والتنظيم</option>
                        <option value="it">تقنية المعلومات</option>
                        <option value="legal">الشؤون القانونية</option>
                        <option value="other">أخرى</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit-skills">المهارات</label>
                      <input
                        type="text"
                        id="edit-skills"
                        name="skills"
                        value={volunteerForm.skills}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    <FaTimes />
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    <FaCheck />
                    حفظ التغييرات
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Volunteers;
