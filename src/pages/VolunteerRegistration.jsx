import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt,
  FaBriefcase, FaGraduationCap, FaUsers, FaUserPlus, FaCheck,
  FaTimes, FaIdCard, FaVenusMars
} from 'react-icons/fa';
import { addVolunteer } from '../features/volunteers/volunteersSlice';
import { addNotification } from '../features/notifications/notificationsSlice';
import './VolunteerRegistration.css';

/**
 * VolunteerRegistration Component
 * 
 * صفحة تسجيل المتطوعين الجديدة
 */
const VolunteerRegistration = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // معالج تغيير الحقول
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // مسح الخطأ عند التعديل
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // التحقق من صحة البيانات
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'الاسم مطلوب';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^01[0-2,5]{1}[0-9]{8}$/.test(formData.phone)) {
      newErrors.phone = 'رقم الهاتف غير صحيح';
    }

    if (!formData.nationalId.trim()) {
      newErrors.nationalId = 'الرقم القومي مطلوب';
    } else if (!/^[0-9]{14}$/.test(formData.nationalId)) {
      newErrors.nationalId = 'الرقم القومي يجب أن يكون 14 رقم';
    }

    if (!formData.qualification.trim()) {
      newErrors.qualification = 'المؤهل مطلوب';
    }

    if (!formData.department) {
      newErrors.department = 'القسم مطلوب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      dispatch(addNotification({
        type: 'error',
        message: 'يرجى تصحيح الأخطاء في النموذج'
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      // تحويل المهارات إلى مصفوفة
      const skillsArray = formData.skills.split(',').map(skill => skill.trim()).filter(Boolean);
      
      // إضافة المتطوع
      dispatch(addVolunteer({
        ...formData,
        skills: skillsArray,
        status: 'active'
      }));

      dispatch(addNotification({
        type: 'success',
        message: 'تم تسجيل المتطوع بنجاح!'
      }));

      // إعادة تعيين النموذج
      setFormData({
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

      // الانتقال لصفحة المتطوعين
      setTimeout(() => {
        navigate('/volunteers');
      }, 2000);

    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.'
      }));
    } finally {
      setIsSubmitting(false);
    }
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
      className="form-container form-fade-in"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="registration-header" variants={itemVariants}>
        <div className="header-content">
          <FaUserPlus className="header-icon" />
          <h1>تسجيل متطوع جديد</h1>
          <p>انضم إلى فريق دعوة الحق وساهم في خدمة المجتمع</p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div className="form-container" variants={itemVariants}>
        <form onSubmit={handleSubmit} className="registration-form">
          
          {/* البيانات الشخصية */}
          <div className="form-section">
            <h2>
              <FaUser />
              البيانات الشخصية
            </h2>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name" className="adaptive-text">الاسم الكامل *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? 'error adaptive-text' : 'adaptive-text'}
                  placeholder="أدخل الاسم الكامل"
                />
                {errors.name && <span className="error-message adaptive-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="nationalId" className="adaptive-text">الرقم القومي *</label>
                <input
                  type="text"
                  id="nationalId"
                  name="nationalId"
                  value={formData.nationalId}
                  onChange={handleInputChange}
                  className={errors.nationalId ? 'error adaptive-text' : 'adaptive-text'}
                  placeholder="14 رقم"
                  maxLength="14"
                />
                {errors.nationalId && <span className="error-message adaptive-text">{errors.nationalId}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="adaptive-text">البريد الإلكتروني *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'error adaptive-text' : 'adaptive-text'}
                  placeholder="example@email.com"
                />
                {errors.email && <span className="error-message adaptive-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="adaptive-text">رقم الهاتف *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={errors.phone ? 'error adaptive-text' : 'adaptive-text'}
                  placeholder="01234567890"
                />
                {errors.phone && <span className="error-message adaptive-text">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="gender" className="adaptive-text">الجنس</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="adaptive-text"
                >
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="birthDate" className="adaptive-text">تاريخ الميلاد</label>
                <input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className="adaptive-text"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="address" className="adaptive-text">العنوان</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="أدخل العنوان الكامل"
                  className="adaptive-text"
                />
              </div>
            </div>
          </div>

          {/* المؤهلات والوظيفة */}
          <div className="form-section">
            <h2>
              <FaGraduationCap />
              المؤهلات والوظيفة
            </h2>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="qualification" className="adaptive-text">المؤهل التعليمي *</label>
                <select
                  id="qualification"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  className={errors.qualification ? 'error adaptive-text' : 'adaptive-text'}
                >
                  <option value="">اختر المؤهل</option>
                  <option value="high-school">ثانوية عامة</option>
                  <option value="diploma">دبلوم</option>
                  <option value="bachelor">بكالوريوس</option>
                  <option value="master">ماجستير</option>
                  <option value="phd">دكتوراه</option>
                  <option value="other">أخرى</option>
                </select>
                {errors.qualification && <span className="error-message adaptive-text">{errors.qualification}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="job" className="adaptive-text">الوظيفة الحالية</label>
                <input
                  type="text"
                  id="job"
                  name="job"
                  value={formData.job}
                  onChange={handleInputChange}
                  placeholder="مثال: مهندس، طبيب، معلم"
                  className="adaptive-text"
                />
              </div>

              <div className="form-group">
                <label htmlFor="department" className="adaptive-text">القسم المفضل *</label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className={errors.department ? 'error adaptive-text' : 'adaptive-text'}
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
                {errors.department && <span className="error-message adaptive-text">{errors.department}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="availability" className="adaptive-text">التوفر</label>
                <select
                  id="availability"
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  className="adaptive-text"
                >
                  <option value="part-time">دوام جزئي</option>
                  <option value="full-time">دوام كامل</option>
                  <option value="weekends">نهاية الأسبوع فقط</option>
                  <option value="flexible">مرن</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label htmlFor="skills" className="adaptive-text">المهارات</label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="مثال: تصميم، برمجة، تدريس، إدارة (مفصولة بفواصل)"
                  className="adaptive-text"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="experience" className="adaptive-text">الخبرات السابقة</label>
                <textarea
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="اذكر خبراتك السابقة في العمل التطوعي أو المهني"
                  className="adaptive-text"
                />
              </div>
            </div>
          </div>

          {/* بيانات الطوارئ */}
          <div className="form-section">
            <h2>
              <FaPhone />
              بيانات الطوارئ
            </h2>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="emergencyContact.name" className="adaptive-text">اسم شخص للطوارئ</label>
                <input
                  type="text"
                  id="emergencyContact.name"
                  name="emergencyContact.name"
                  value={formData.emergencyContact.name}
                  onChange={handleInputChange}
                  placeholder="اسم الشخص"
                  className="adaptive-text"
                />
              </div>

              <div className="form-group">
                <label htmlFor="emergencyContact.phone" className="adaptive-text">رقم هاتف الطوارئ</label>
                <input
                  type="tel"
                  id="emergencyContact.phone"
                  name="emergencyContact.phone"
                  value={formData.emergencyContact.phone}
                  onChange={handleInputChange}
                  placeholder="01234567890"
                  className="adaptive-text"
                />
              </div>

              <div className="form-group">
                <label htmlFor="emergencyContact.relation" className="adaptive-text">صلة القرابة</label>
                <input
                  type="text"
                  id="emergencyContact.relation"
                  name="emergencyContact.relation"
                  value={formData.emergencyContact.relation}
                  onChange={handleInputChange}
                  placeholder="مثال: والد، أخ، صديق"
                  className="adaptive-text"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="notes" className="adaptive-text">ملاحظات إضافية</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="أي ملاحظات أو معلومات إضافية"
                  className="adaptive-text"
                />
              </div>
            </div>
          </div>

          {/* أزرار الإرسال */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary adaptive-text"
              onClick={() => navigate('/volunteers')}
            >
              <FaTimes />
              إلغاء
            </button>
            
            <button
              type="submit"
              className={`btn-primary ${isSubmitting ? 'btn-loading' : ''} adaptive-text`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  جاري التسجيل...
                </>
              ) : (
                <>
                  <FaCheck />
                  تسجيل المتطوع
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default VolunteerRegistration;
