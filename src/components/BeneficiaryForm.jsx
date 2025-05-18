import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  addBeneficiary,
  updateBeneficiary,
} from "../features/beneficiaries/beneficiariesSlice";
import ImageUpload from "./ImageUpload";
import ChildrenManager from "./ChildrenManager";
import "./BeneficiaryForm.css";

/**
 * BeneficiaryForm Component
 *
 * This component provides a form for adding or editing beneficiary information.
 *
 * @param {Object} props - Component props
 * @param {Object} props.beneficiary - Existing beneficiary data for editing (optional)
 * @param {Function} props.onComplete - Callback function when form is submitted
 * @param {boolean} props.isEditing - Whether the form is in edit mode
 * @param {string} props.focusField - Field to focus on when form loads (optional)
 */
const BeneficiaryForm = ({
  beneficiary = null,
  onComplete,
  isEditing = false,
  focusField = null,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    nationalId: "",
    beneficiaryId: "",
    phone: "",
    income: "",
    address: "",
    familyMembers: "1",
    maritalStatus: "single",
    spouseIdImage: "",
    wifeIdImage: "",
    notes: "",
    children: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create refs for each input field
  const inputRefs = {
    name: useRef(null),
    nationalId: useRef(null),
    beneficiaryId: useRef(null),
    phone: useRef(null),
    income: useRef(null),
    address: useRef(null),
    familyMembers: useRef(null),
    maritalStatus: useRef(null),
    spouseIdImage: useRef(null),
    wifeIdImage: useRef(null),
    notes: useRef(null)
  };

  const dispatch = useDispatch();

  // If editing, populate form with existing data
  useEffect(() => {
    if (beneficiary) {
      setFormData({
        ...beneficiary,
        income: beneficiary.income.toString(),
        familyMembers: beneficiary.familyMembers ? beneficiary.familyMembers.toString() : "1",
      });
    }
  }, [beneficiary]);

  // Focus on specified field if provided
  useEffect(() => {
    if (focusField && inputRefs[focusField]) {
      // Slight delay to ensure the form is fully rendered
      setTimeout(() => {
        // For regular input fields
        if (inputRefs[focusField].current) {
          inputRefs[focusField].current.focus();

          // Scroll to the field
          inputRefs[focusField].current.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });

          // Highlight the field
          inputRefs[focusField].current.classList.add('highlight-field');

          // Remove highlight after 2 seconds
          setTimeout(() => {
            if (inputRefs[focusField].current) {
              inputRefs[focusField].current.classList.remove('highlight-field');
            }
          }, 2000);
        }
        // For image upload fields
        else if (focusField === 'spouseIdImage' || focusField === 'wifeIdImage') {
          // Find the container for the image upload
          const container = document.getElementById(`${focusField}-container`);
          if (container) {
            container.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });

            // Highlight the container
            container.classList.add('highlight-field');

            // Remove highlight after 2 seconds
            setTimeout(() => {
              container.classList.remove('highlight-field');
            }, 2000);
          }
        }
      }, 300);
    }
  }, [focusField]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageUpload = (field, imageData) => {
    setFormData({
      ...formData,
      [field]: imageData,
    });
  };

  const handleChildrenChange = (children) => {
    setFormData({
      ...formData,
      children
    });
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "الاسم مطلوب";
    }

    if (!formData.nationalId) {
      errors.nationalId = "الرقم القومي مطلوب";
    } else if (!/^\d{14}$/.test(formData.nationalId)) {
      errors.nationalId = "الرقم القومي يجب أن يكون 14 رقم";
    }

    if (!formData.beneficiaryId) {
      errors.beneficiaryId = "رقم المستفيد مطلوب";
    }

    if (!formData.phone) {
      errors.phone = "رقم الهاتف مطلوب";
    } else if (!/^01[0125]\d{8}$/.test(formData.phone)) {
      errors.phone = "رقم الهاتف غير صالح";
    }

    if (!formData.income) {
      errors.income = "الدخل مطلوب";
    } else if (isNaN(formData.income) || Number(formData.income) < 0) {
      errors.income = "الدخل يجب أن يكون رقم موجب";
    }

    if (!formData.address.trim()) {
      errors.address = "العنوان مطلوب";
    }

    if (!formData.familyMembers) {
      errors.familyMembers = "عدد أفراد الأسرة مطلوب";
    } else if (isNaN(formData.familyMembers) || Number(formData.familyMembers) < 1) {
      errors.familyMembers = "عدد أفراد الأسرة يجب أن يكون رقم موجب";
    }

    // Validate ID images if married
    if (formData.maritalStatus === 'married') {
      if (!formData.spouseIdImage) {
        errors.spouseIdImage = "صورة بطاقة الزوج مطلوبة";
      }

      if (!formData.wifeIdImage) {
        errors.wifeIdImage = "صورة بطاقة الزوجة مطلوبة";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      // Convert income to number
      const submissionData = {
        ...formData,
        income: Number(formData.income),
      };

      // Dispatch action based on whether we're adding or editing
      const action = isEditing
        ? updateBeneficiary(submissionData)
        : addBeneficiary(submissionData);

      dispatch(action)
        .unwrap()
        .then(() => {
          setIsSubmitting(false);
          onComplete();
        })
        .catch((error) => {
          setIsSubmitting(false);
          console.error("Error:", error);
        });
    }
  };

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      className="beneficiary-form-container"
      variants={formVariants}
      initial="hidden"
      animate="visible"
    >
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="name">الاسم</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={formErrors.name ? "error" : ""}
              ref={inputRefs.name}
            />
            {formErrors.name && (
              <span className="error-text">{formErrors.name}</span>
            )}
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="nationalId">الرقم القومي</label>
            <input
              type="text"
              id="nationalId"
              name="nationalId"
              value={formData.nationalId}
              onChange={handleChange}
              className={formErrors.nationalId ? "error" : ""}
              ref={inputRefs.nationalId}
            />
            {formErrors.nationalId && (
              <span className="error-text">{formErrors.nationalId}</span>
            )}
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="beneficiaryId">رقم المستفيد</label>
            <input
              type="text"
              id="beneficiaryId"
              name="beneficiaryId"
              value={formData.beneficiaryId}
              onChange={handleChange}
              className={formErrors.beneficiaryId ? "error" : ""}
              ref={inputRefs.beneficiaryId}
            />
            {formErrors.beneficiaryId && (
              <span className="error-text">{formErrors.beneficiaryId}</span>
            )}
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="phone">رقم الهاتف</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={formErrors.phone ? "error" : ""}
              ref={inputRefs.phone}
            />
            {formErrors.phone && (
              <span className="error-text">{formErrors.phone}</span>
            )}
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="income">الدخل (جنيه)</label>
            <input
              type="number"
              id="income"
              name="income"
              value={formData.income}
              onChange={handleChange}
              className={formErrors.income ? "error" : ""}
              ref={inputRefs.income}
            />
            {formErrors.income && (
              <span className="error-text">{formErrors.income}</span>
            )}
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="maritalStatus">الحالة الاجتماعية</label>
            <select
              id="maritalStatus"
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
              ref={inputRefs.maritalStatus}
            >
              <option value="single">أعزب</option>
              <option value="married">متزوج</option>
              <option value="divorced">مطلق</option>
              <option value="widowed">أرمل</option>
            </select>
          </motion.div>

          <motion.div className="form-group full-width" variants={itemVariants}>
            <label htmlFor="address">العنوان</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={formErrors.address ? "error" : ""}
              rows="3"
              ref={inputRefs.address}
            ></textarea>
            {formErrors.address && (
              <span className="error-text">{formErrors.address}</span>
            )}
          </motion.div>

          <motion.div className="form-group full-width" variants={itemVariants}>
            <label htmlFor="notes">ملاحظات</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              ref={inputRefs.notes}
              placeholder="أي ملاحظات إضافية عن المستفيد..."
            ></textarea>
          </motion.div>

          {/* ID Images (only if married) */}
          {formData.maritalStatus === 'married' && (
            <div className="form-section">
              <h3>صور البطاقات</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>صورة بطاقة الزوج</label>
                  <ImageUpload
                    initialImage={formData.spouseIdImage}
                    onImageUpload={(imageData) => handleImageUpload('spouseIdImage', imageData)}
                    label="اختر صورة بطاقة الزوج"
                    id="spouseIdImage-container"
                  />
                  {formErrors.spouseIdImage && <div className="error-message">{formErrors.spouseIdImage}</div>}
                </div>

                <div className="form-group">
                  <label>صورة بطاقة الزوجة</label>
                  <ImageUpload
                    initialImage={formData.wifeIdImage}
                    onImageUpload={(imageData) => handleImageUpload('wifeIdImage', imageData)}
                    label="اختر صورة بطاقة الزوجة"
                    id="wifeIdImage-container"
                  />
                  {formErrors.wifeIdImage && <div className="error-message">{formErrors.wifeIdImage}</div>}
                </div>
              </div>
            </div>
          )}

          {/* Children Manager */}
          <motion.div className="form-group full-width" variants={itemVariants}>
            <ChildrenManager
              children={formData.children}
              onChange={handleChildrenChange}
            />
          </motion.div>
        </div>

        <motion.div className="form-actions" variants={itemVariants}>
          <motion.button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSubmitting
              ? "جاري الحفظ..."
              : isEditing
              ? "تحديث البيانات"
              : "إضافة المستفيد"}
          </motion.button>

          <motion.button
            type="button"
            className="btn btn-secondary"
            onClick={onComplete}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            إلغاء
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default BeneficiaryForm;

// Sources:
// - Form Validation: https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation
// - Framer Motion: https://www.framer.com/motion/



