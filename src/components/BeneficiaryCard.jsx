import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { deleteBeneficiary } from '../features/beneficiaries/beneficiariesSlice';
import BeneficiaryForm from './BeneficiaryForm';
import { formatDate } from '../utils/helpers';

/**
 * BeneficiaryCard Component
 *
 * This component displays information about a beneficiary in a card format.
 * It includes options to edit or delete the beneficiary.
 *
 * @param {Object} props - Component props
 * @param {Object} props.beneficiary - The beneficiary data to display
 */
const BeneficiaryCard = ({ beneficiary }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const dispatch = useDispatch();

  const handleDelete = () => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستفيد؟')) {
      dispatch(deleteBeneficiary(beneficiary.id));
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      setShowDetails(false);
    }
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
    if (showDetails) {
      setIsEditing(false);
    }
  };

  // Get priority class based on priority value
  const getPriorityClass = (priority) => {
    if (priority >= 8) return 'priority-high';
    if (priority >= 5) return 'priority-medium';
    return 'priority-low';
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    hover: { y: -5, boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }
  };

  if (isEditing) {
    return (
      <motion.div
        className="beneficiary-card card"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="card-header">
          <h3>تعديل بيانات المستفيد</h3>
          <button className="close-btn" onClick={toggleEdit}>×</button>
        </div>
        <BeneficiaryForm
          beneficiary={beneficiary}
          onComplete={() => setIsEditing(false)}
          isEditing={true}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="beneficiary-card card"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <div className="card-header">
        <div className="header-content">
          {beneficiary.profileImage && (
            <div className="profile-image-container">
              <img
                src={beneficiary.profileImage}
                alt={`صورة ${beneficiary.name}`}
                className="profile-image"
              />
            </div>
          )}
          <div className="header-text">
            <h3>{beneficiary.name}</h3>
            <div className={`priority-badge ${getPriorityClass(beneficiary.priority)}`}>
              الأولوية: {beneficiary.priority}
            </div>
          </div>
        </div>
      </div>

      <div className="card-content">
        <div className="info-row">
          <span className="info-label">رقم المستفيد:</span>
          <span className="info-value">{beneficiary.beneficiaryId}</span>
        </div>

        <div className="info-row">
          <span className="info-label">الرقم القومي:</span>
          <span className="info-value">{beneficiary.nationalId}</span>
        </div>

        <div className="info-row">
          <span className="info-label">رقم الهاتف:</span>
          <span className="info-value">{beneficiary.phone}</span>
        </div>

        <div className="info-row">
          <span className="info-label">الدخل:</span>
          <span className="info-value">{beneficiary.income} جنيه</span>
        </div>

        {showDetails && (
          <motion.div
            className="details-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="info-row">
              <span className="info-label">العنوان:</span>
              <span className="info-value">{beneficiary.address}</span>
            </div>

            <div className="info-row">
              <span className="info-label">الحالة الاجتماعية:</span>
              <span className="info-value">{beneficiary.maritalStatus}</span>
            </div>

            <div className="info-row">
              <span className="info-label">تاريخ الإضافة:</span>
              <span className="info-value">{formatDate(beneficiary.createdAt)}</span>
            </div>

            {beneficiary.notes && (
              <div className="info-row">
                <span className="info-label">ملاحظات:</span>
                <span className="info-value notes-text">{beneficiary.notes}</span>
              </div>
            )}

            {beneficiary.children && beneficiary.children.length > 0 && (
              <div className="children-section">
                <h4>الأبناء ({beneficiary.children.length})</h4>
                <ul className="children-list">
                  {beneficiary.children.map((child, index) => (
                    <li key={child.id || index} className="child-item">
                      <div className="child-name">{child.name}</div>
                      <div className="child-info">
                        <span>{child.age} سنة</span>
                        <span>{child.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
                        {child.schoolLevel && (
                          <span>
                            {child.schoolLevel === 'kindergarten' && 'حضانة'}
                            {child.schoolLevel === 'primary' && 'ابتدائي'}
                            {child.schoolLevel === 'preparatory' && 'إعدادي'}
                            {child.schoolLevel === 'secondary' && 'ثانوي'}
                            {child.schoolLevel === 'university' && 'جامعي'}
                          </span>
                        )}
                        {child.healthStatus !== 'healthy' && (
                          <span className="health-status">
                            {child.healthStatus === 'chronic' ? 'مرض مزمن' : 'إعاقة'}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {beneficiary.profileImage && (
              <div className="image-row">
                <span className="info-label">صورة المستفيد:</span>
                <img
                  src={beneficiary.profileImage}
                  alt={`صورة ${beneficiary.name}`}
                  className="profile-image-large"
                />
              </div>
            )}

            {beneficiary.spouseIdImage && (
              <div className="image-row">
                <span className="info-label">صورة بطاقة الزوج:</span>
                <img
                  src={beneficiary.spouseIdImage}
                  alt="بطاقة الزوج"
                  className="id-image"
                />
              </div>
            )}

            {beneficiary.wifeIdImage && (
              <div className="image-row">
                <span className="info-label">صورة بطاقة الزوجة:</span>
                <img
                  src={beneficiary.wifeIdImage}
                  alt="بطاقة الزوجة"
                  className="id-image"
                />
              </div>
            )}
          </motion.div>
        )}
      </div>

      <div className="card-actions">
        <motion.button
          className="btn btn-secondary"
          onClick={toggleDetails}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {showDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
        </motion.button>

        <motion.button
          className="btn btn-primary"
          onClick={toggleEdit}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          تعديل
        </motion.button>

        <motion.button
          className="btn btn-danger"
          onClick={handleDelete}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          حذف
        </motion.button>
      </div>
    </motion.div>
  );
};

export default BeneficiaryCard;

// Sources:
// - Framer Motion: https://www.framer.com/motion/
// - Card Design: https://uxdesign.cc/designing-cards-for-mobile-apps-5f6c6dbf6b2c
