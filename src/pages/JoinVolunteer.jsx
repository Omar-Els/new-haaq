import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt,
  FaBriefcase, FaGraduationCap, FaHeart, FaUsers, FaHandsHelping,
  FaCheckCircle, FaArrowRight, FaUserPlus
} from 'react-icons/fa';
import { addVolunteer } from '../features/volunteers/volunteersSlice';
import { addNotification } from '../features/notifications/notificationsSlice';
import './JoinVolunteer.css';

/**
 * JoinVolunteer Component
 * 
 * صفحة انضمام المتطوعين الجدد
 */
const JoinVolunteer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    gender: 'male',
    department: '',
    skills: '',
    experience: '',
    education: '',
    motivation: '',
    availability: 'part-time',
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    },
    agreeToTerms: false
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 4;

  // معالج تغيير الحقول
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
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
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // التحقق من صحة الخطوة الحالية
  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.name && formData.email && formData.phone;
      case 2:
        return formData.department && formData.skills;
      case 3:
        return formData.motivation;
      case 4:
        return formData.agreeToTerms;
      default:
        return false;
    }
  };

  // الانتقال للخطوة التالية
  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  // الرجوع للخطوة السابقة
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(4)) {
      dispatch(addNotification({
        type: 'error',
        message: 'يرجى الموافقة على الشروط والأحكام'
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
        status: 'pending', // في انتظار الموافقة
        applicationDate: new Date().toISOString()
      }));

      dispatch(addNotification({
        type: 'success',
        message: 'تم إرسال طلب الانضمام بنجاح! سيتم مراجعته والرد عليك قريباً.'
      }));

      // الانتقال لصفحة الشكر
      setTimeout(() => {
        navigate('/volunteer-thank-you');
      }, 2000);

    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.'
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
      className="join-volunteer-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="join-header" variants={itemVariants}>
        <div className="header-content">
          <FaUserPlus className="header-icon" />
          <h1>انضم كمتطوع</h1>
          <p>كن جزءاً من فريق دعوة الحق وساهم في خدمة المجتمع</p>
        </div>
        
        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <div className="progress-steps">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`progress-step ${currentStep >= step ? 'active' : ''}`}
              >
                {currentStep > step ? <FaCheckCircle /> : step}
              </div>
            ))}
          </div>
          <div className="progress-labels">
            <span>البيانات الشخصية</span>
            <span>المهارات والخبرات</span>
            <span>الدافع والتوقعات</span>
            <span>الموافقة والإرسال</span>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div className="form-container" variants={itemVariants}>
        <form onSubmit={handleSubmit} className="volunteer-form">
          
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <motion.div
              className="form-step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <h2>
                <FaUser />
                البيانات الشخصية
              </h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">الاسم الكامل *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
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
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="01234567890"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="gender">الجنس</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="birthDate">تاريخ الميلاد</label>
                  <input
                    type="date"
                    id="birthDate"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="address">العنوان</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="أدخل عنوانك الكامل"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Skills and Experience */}
          {currentStep === 2 && (
            <motion.div
              className="form-step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <h2>
                <FaBriefcase />
                المهارات والخبرات
              </h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="department">القسم المفضل *</label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
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
                  <label htmlFor="availability">التوفر</label>
                  <select
                    id="availability"
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                  >
                    <option value="part-time">دوام جزئي</option>
                    <option value="full-time">دوام كامل</option>
                    <option value="weekends">نهاية الأسبوع فقط</option>
                    <option value="flexible">مرن</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="skills">المهارات *</label>
                  <input
                    type="text"
                    id="skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    required
                    placeholder="مثال: تصميم، برمجة، تدريس، إدارة (مفصولة بفواصل)"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="education">المؤهل التعليمي</label>
                  <input
                    type="text"
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    placeholder="مثال: بكالوريوس هندسة، دبلوم تجارة"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="experience">الخبرات السابقة</label>
                  <textarea
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="اذكر خبراتك السابقة في العمل التطوعي أو المهني"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Motivation */}
          {currentStep === 3 && (
            <motion.div
              className="form-step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <h2>
                <FaHeart />
                الدافع والتوقعات
              </h2>
              
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="motivation">لماذا تريد الانضمام لدعوة الحق؟ *</label>
                  <textarea
                    id="motivation"
                    name="motivation"
                    value={formData.motivation}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    placeholder="اكتب دافعك للانضمام وكيف يمكنك المساهمة في أهداف المؤسسة"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="emergencyContact.name">اسم شخص للطوارئ</label>
                  <input
                    type="text"
                    id="emergencyContact.name"
                    name="emergencyContact.name"
                    value={formData.emergencyContact.name}
                    onChange={handleInputChange}
                    placeholder="اسم الشخص"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="emergencyContact.phone">رقم هاتف الطوارئ</label>
                  <input
                    type="tel"
                    id="emergencyContact.phone"
                    name="emergencyContact.phone"
                    value={formData.emergencyContact.phone}
                    onChange={handleInputChange}
                    placeholder="01234567890"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="emergencyContact.relation">صلة القرابة</label>
                  <input
                    type="text"
                    id="emergencyContact.relation"
                    name="emergencyContact.relation"
                    value={formData.emergencyContact.relation}
                    onChange={handleInputChange}
                    placeholder="مثال: والد، أخ، صديق"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Terms and Submit */}
          {currentStep === 4 && (
            <motion.div
              className="form-step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <h2>
                <FaCheckCircle />
                الموافقة والإرسال
              </h2>
              
              <div className="terms-section">
                <div className="terms-content">
                  <h3>الشروط والأحكام</h3>
                  <ul>
                    <li>الالتزام بقيم ومبادئ مؤسسة دعوة الحق</li>
                    <li>المحافظة على سرية المعلومات والبيانات</li>
                    <li>الالتزام بالمواعيد والمهام المحددة</li>
                    <li>التعامل بأخلاق واحترام مع الجميع</li>
                    <li>عدم استغلال المنصب لأغراض شخصية</li>
                  </ul>
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      required
                    />
                    <span className="checkmark"></span>
                    أوافق على الشروط والأحكام المذكورة أعلاه
                  </label>
                </div>

                <div className="summary-section">
                  <h3>ملخص البيانات</h3>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <strong>الاسم:</strong> {formData.name}
                    </div>
                    <div className="summary-item">
                      <strong>البريد:</strong> {formData.email}
                    </div>
                    <div className="summary-item">
                      <strong>الهاتف:</strong> {formData.phone}
                    </div>
                    <div className="summary-item">
                      <strong>القسم:</strong> {formData.department}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="form-navigation">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={prevStep}
              >
                السابق
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                className={`btn btn-primary ${!validateStep(currentStep) ? 'disabled' : ''}`}
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
              >
                التالي
                <FaArrowRight />
              </button>
            ) : (
              <button
                type="submit"
                className={`btn btn-success ${!validateStep(4) || isSubmitting ? 'disabled' : ''}`}
                disabled={!validateStep(4) || isSubmitting}
              >
                {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
                <FaUserPlus />
              </button>
            )}
          </div>
        </form>
      </motion.div>

      {/* Benefits Section */}
      <motion.div className="benefits-section" variants={itemVariants}>
        <h2>لماذا تنضم لدعوة الحق؟</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <FaHeart className="benefit-icon" />
            <h3>خدمة المجتمع</h3>
            <p>ساهم في تحسين حياة الأسر المحتاجة وكن جزءاً من التغيير الإيجابي</p>
          </div>
          <div className="benefit-card">
            <FaUsers className="benefit-icon" />
            <h3>فريق متميز</h3>
            <p>انضم لفريق من المتطوعين المتفانين والمتخصصين في مختلف المجالات</p>
          </div>
          <div className="benefit-card">
            <FaGraduationCap className="benefit-icon" />
            <h3>تطوير المهارات</h3>
            <p>اكتسب خبرات جديدة وطور مهاراتك من خلال التدريبات والورش</p>
          </div>
          <div className="benefit-card">
            <FaHandsHelping className="benefit-icon" />
            <h3>أثر إيجابي</h3>
            <p>كن جزءاً من قصص نجاح حقيقية وشاهد أثر عملك على أرض الواقع</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default JoinVolunteer;
