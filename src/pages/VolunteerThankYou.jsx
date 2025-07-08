import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaCheckCircle, FaHeart, FaHome, FaUsers, FaEnvelope,
  FaPhone, FaWhatsapp, FaFacebook, FaTwitter
} from 'react-icons/fa';
import './VolunteerThankYou.css';

/**
 * VolunteerThankYou Component
 * 
 * صفحة شكر المتطوعين بعد إرسال الطلب
 */
const VolunteerThankYou = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      className="thank-you-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="thank-you-content" variants={itemVariants}>
        <div className="success-icon">
          <FaCheckCircle />
        </div>
        
        <h1 className="adaptive-text">شكراً لك!</h1>
        <h2 className="adaptive-text">تم إرسال طلب الانضمام بنجاح</h2>
        
        <p className="main-message adaptive-text">
          نشكرك على رغبتك في الانضمام لفريق دعوة الحق. 
          سيتم مراجعة طلبك والتواصل معك خلال 3-5 أيام عمل.
        </p>

        <div className="next-steps">
          <h3 className="adaptive-text">الخطوات التالية:</h3>
          <div className="steps-list">
            <div className="step-item">
              <span className="step-number">1</span>
              <div className="step-content">
                <h4 className="adaptive-text">مراجعة الطلب</h4>
                <p className="adaptive-text">سيقوم فريقنا بمراجعة طلبك والتحقق من البيانات</p>
              </div>
            </div>
            
            <div className="step-item">
              <span className="step-number">2</span>
              <div className="step-content">
                <h4 className="adaptive-text">المقابلة الشخصية</h4>
                <p className="adaptive-text">سنتواصل معك لترتيب مقابلة شخصية أو عبر الهاتف</p>
              </div>
            </div>
            
            <div className="step-item">
              <span className="step-number">3</span>
              <div className="step-content">
                <h4 className="adaptive-text">التدريب والتأهيل</h4>
                <p className="adaptive-text">ستحصل على التدريب اللازم للبدء في العمل التطوعي</p>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-info">
          <h3 className="adaptive-text">تواصل معنا</h3>
          <p className="adaptive-text">إذا كان لديك أي استفسار، لا تتردد في التواصل معنا:</p>
          
          <div className="contact-methods">
            <a href="tel:01234567890" className="contact-method">
              <FaPhone />
              <span>01234567890</span>
            </a>
            
            <a href="mailto:volunteers@daawa-elhaq.org" className="contact-method">
              <FaEnvelope />
              <span>volunteers@daawa-elhaq.org</span>
            </a>
            
            <a href="https://wa.me/201234567890" className="contact-method">
              <FaWhatsapp />
              <span>واتساب</span>
            </a>
          </div>
        </div>

        <div className="social-follow">
          <h3 className="adaptive-text">تابعنا على وسائل التواصل</h3>
          <div className="social-links">
            <a href="#" className="social-link facebook">
              <FaFacebook />
              <span>فيسبوك</span>
            </a>
            
            <a href="#" className="social-link twitter">
              <FaTwitter />
              <span>تويتر</span>
            </a>
            
            <a href="#" className="social-link whatsapp">
              <FaWhatsapp />
              <span>واتساب</span>
            </a>
          </div>
        </div>

        <div className="action-buttons">
          <Link to="/" className="btn btn-primary">
            <FaHome />
            العودة للرئيسية
          </Link>
          
          <Link to="/about" className="btn btn-secondary">
            <FaHeart />
            تعرف على دعوة الحق
          </Link>
        </div>
      </motion.div>

      <motion.div className="decorative-elements" variants={itemVariants}>
        <div className="floating-heart heart-1">
          <FaHeart />
        </div>
        <div className="floating-heart heart-2">
          <FaHeart />
        </div>
        <div className="floating-heart heart-3">
          <FaHeart />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VolunteerThankYou;
