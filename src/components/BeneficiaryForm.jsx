import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  addBeneficiary,
  updateBeneficiary,
} from "../features/beneficiaries/beneficiariesSlice";
import { selectAllSheets, addBeneficiaryToSheet } from "../features/sheets/sheetsSlice";
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
    priority: "5", // Default medium priority
    profileImage: "",
    spouseIdImage: "",
    wifeIdImage: "",
    notes: "",
    children: [],
    sheetId: "" // حقل الكشف الجديد
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
    priority: useRef(null),
    profileImage: useRef(null),
    spouseIdImage: useRef(null),
    wifeIdImage: useRef(null),
    notes: useRef(null)
  };

  const dispatch = useDispatch();
  const sheets = useSelector(selectAllSheets);

  // If editing, populate form with existing data
  useEffect(() => {
    if (beneficiary) {
      setFormData({
        ...beneficiary,
        income: beneficiary.income.toString(),
        familyMembers: beneficiary.familyMembers ? beneficiary.familyMembers.toString() : "1",
        priority: beneficiary.priority ? beneficiary.priority.toString() : "5",
        // Ensure image fields are properly set
        profileImage: beneficiary.profileImage || "",
        spouseIdImage: beneficiary.spouseIdImage || "",
        wifeIdImage: beneficiary.wifeIdImage || "",
        sheetId: beneficiary.sheetId || "",
      });
    }
  }, [beneficiary]);

  // Clear image fields when marital status changes from married to something else
  useEffect(() => {
    if (formData.maritalStatus !== 'married') {
      setFormData(prevData => ({
        ...prevData,
        spouseIdImage: "",
        wifeIdImage: ""
      }));
    }
  }, [formData.maritalStatus]);

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
        else if (focusField === 'profileImage' || focusField === 'spouseIdImage' || focusField === 'wifeIdImage') {
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

    // Note: Image uploads are optional, so no validation required for images

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      // Convert income, familyMembers, and priority to numbers
      const submissionData = {
        ...formData,
        income: Number(formData.income),
        familyMembers: Number(formData.familyMembers),
        priority: Number(formData.priority),
      };

      // Dispatch action based on whether we're adding or editing
      const action = isEditing
        ? updateBeneficiary(submissionData)
        : addBeneficiary(submissionData);

      dispatch(action)
        .unwrap()
        .then((savedBeneficiary) => {
          // إضافة المستفيد للكشف إذا تم تحديده
          if (formData.sheetId && !isEditing) {
            dispatch(addBeneficiaryToSheet({
              sheetId: formData.sheetId,
              beneficiary: savedBeneficiary
            })).catch((sheetError) => {
              console.warn('⚠️ فشل في إضافة المستفيد للكشف:', sheetError);
            });
          }
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
      className="form-container form-fade-in"
      variants={formVariants}
      initial="hidden"
      animate="visible"
    >
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="name" className="adaptive-text">الاسم</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`adaptive-text ${formErrors.name ? "error" : ""}`}
              ref={inputRefs.name}
              autoComplete="name"
              aria-describedby={formErrors.name ? "name-error" : undefined}
              placeholder="أدخل اسم المستفيد"
            />
            {formErrors.name && (
              <span id="name-error" className="error-text" role="alert">{formErrors.name}</span>
            )}
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="nationalId" className="adaptive-text">الرقم القومي</label>
            <input
              type="text"
              id="nationalId"
              name="nationalId"
              value={formData.nationalId}
              onChange={handleChange}
              className={`adaptive-text ${formErrors.nationalId ? "error" : ""}`}
              ref={inputRefs.nationalId}
              autoComplete="off"
              aria-describedby={formErrors.nationalId ? "nationalId-error" : undefined}
              placeholder="أدخل الرقم القومي"
              maxLength="14"
            />
            {formErrors.nationalId && (
              <span id="nationalId-error" className="error-text" role="alert">{formErrors.nationalId}</span>
            )}
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="beneficiaryId" className="adaptive-text">رقم المستفيد</label>
            <input
              type="text"
              id="beneficiaryId"
              name="beneficiaryId"
              value={formData.beneficiaryId}
              onChange={handleChange}
              className={`adaptive-text ${formErrors.beneficiaryId ? "error" : ""}`}
              ref={inputRefs.beneficiaryId}
              autoComplete="off"
              aria-describedby={formErrors.beneficiaryId ? "beneficiaryId-error" : undefined}
              placeholder="أدخل رقم المستفيد"
            />
            {formErrors.beneficiaryId && (
              <span id="beneficiaryId-error" className="error-text" role="alert">{formErrors.beneficiaryId}</span>
            )}
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="phone" className="adaptive-text">رقم الهاتف</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`adaptive-text ${formErrors.phone ? "error" : ""}`}
              ref={inputRefs.phone}
              autoComplete="tel"
              aria-describedby={formErrors.phone ? "phone-error" : undefined}
              placeholder="أدخل رقم الهاتف"
              maxLength="11"
            />
            {formErrors.phone && (
              <span id="phone-error" className="error-text" role="alert">{formErrors.phone}</span>
            )}
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="income" className="adaptive-text">الدخل (جنيه)</label>
            <input
              type="number"
              id="income"
              name="income"
              value={formData.income}
              onChange={handleChange}
              className={`adaptive-text ${formErrors.income ? "error" : ""}`}
              ref={inputRefs.income}
              autoComplete="off"
              aria-describedby={formErrors.income ? "income-error" : undefined}
              placeholder="أدخل الدخل الشهري"
              min="0"
              step="1"
            />
            {formErrors.income && (
              <span id="income-error" className="error-text" role="alert">{formErrors.income}</span>
            )}
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="maritalStatus" className="adaptive-text">الحالة الاجتماعية</label>
            <select
              id="maritalStatus"
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
              ref={inputRefs.maritalStatus}
              autoComplete="off"
              aria-label="اختر الحالة الاجتماعية"
              className="adaptive-text"
            >
              <option value="single">أعزب</option>
              <option value="married">متزوج</option>
              <option value="divorced">مطلق</option>
              <option value="widowed">أرمل</option>
            </select>
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="familyMembers" className="adaptive-text">عدد أفراد الأسرة</label>
            <select
              id="familyMembers"
              name="familyMembers"
              value={formData.familyMembers}
              onChange={handleChange}
              ref={inputRefs.familyMembers}
              autoComplete="off"
              aria-label="اختر عدد أفراد الأسرة"
              className="adaptive-text"
            >
              {[...Array(15)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="priority" className="adaptive-text">الأولوية</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              ref={inputRefs.priority}
              autoComplete="off"
              aria-label="اختر مستوى الأولوية"
              className="adaptive-text"
            >
              <option value="1">1 - منخفضة جداً</option>
              <option value="2">2 - منخفضة</option>
              <option value="3">3 - أقل من المتوسط</option>
              <option value="4">4 - أقل من المتوسط</option>
              <option value="5">5 - متوسطة</option>
              <option value="6">6 - أعلى من المتوسط</option>
              <option value="7">7 - أعلى من المتوسط</option>
              <option value="8">8 - عالية</option>
              <option value="9">9 - عالية جداً</option>
              <option value="10">10 - عاجلة</option>
            </select>
            <small className="form-help-text">يمكنك تعديل الأولوية حسب الحاجة (1 = منخفضة، 10 = عاجلة)</small>
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="sheetId" className="adaptive-text">الكشف</label>
            <select
              id="sheetId"
              name="sheetId"
              value={formData.sheetId}
              onChange={handleChange}
              autoComplete="off"
              aria-label="اختر الكشف"
              className="adaptive-text"
            >
              <option value="">اختر الكشف (اختياري)</option>
              {sheets.map((sheet) => (
                <option key={sheet.id} value={sheet.id}>
                  {sheet.name} ({sheet.beneficiaryCount} مستفيد)
                </option>
              ))}
            </select>
            <small className="form-help-text">اختر الكشف الذي سيتم إضافة المستفيد إليه (اختياري)</small>
          </motion.div>

          <motion.div className="form-group full-width" variants={itemVariants}>
            <label htmlFor="address" className="adaptive-text">العنوان</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`adaptive-text ${formErrors.address ? "error" : ""}`}
              rows="3"
              ref={inputRefs.address}
              autoComplete="street-address"
              aria-describedby={formErrors.address ? "address-error" : undefined}
              placeholder="أدخل العنوان التفصيلي"
            ></textarea>
            {formErrors.address && (
              <span id="address-error" className="error-text" role="alert">{formErrors.address}</span>
            )}
          </motion.div>

          <motion.div className="form-group full-width" variants={itemVariants}>
            <label htmlFor="notes" className="adaptive-text">ملاحظات</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              ref={inputRefs.notes}
              placeholder="أي ملاحظات إضافية عن المستفيد..."
              autoComplete="off"
              aria-label="ملاحظات إضافية عن المستفيد"
              className="adaptive-text"
            ></textarea>
          </motion.div>

          {/* Profile Image */}
          <motion.div className="form-group full-width" variants={itemVariants}>
            <h3 className="adaptive-text">صورة المستفيد</h3>
            <div className="form-group">
              <label htmlFor="profileImage-upload" className="adaptive-text">صورة شخصية للمستفيد (اختيارية)</label>
              <ImageUpload
                key={`profile-${formData.name}`}
                initialImage={formData.profileImage}
                onImageUpload={(imageData) => handleImageUpload('profileImage', imageData)}
                label="اختر صورة المستفيد"
                id="profileImage-container"
                inputId="profileImage-upload"
              />
              <small className="form-help-text adaptive-text" id="profileImage-help">يمكنك رفع صورة شخصية للمستفيد (اختيارية)</small>
            </div>
          </motion.div>

          {/* ID Images (only if married) */}
          {formData.maritalStatus === 'married' && (
            <motion.div className="form-section" variants={itemVariants}>
              <h3 className="adaptive-text">صور البطاقات (اختيارية)</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="spouseIdImage-upload" className="adaptive-text">صورة بطاقة الزوج (اختيارية)</label>
                  <ImageUpload
                    key={`spouse-${formData.maritalStatus}`}
                    initialImage={formData.spouseIdImage}
                    onImageUpload={(imageData) => handleImageUpload('spouseIdImage', imageData)}
                    label="اختر صورة بطاقة الزوج"
                    id="spouseIdImage-container"
                    inputId="spouseIdImage-upload"
                  />
                  <small className="form-help-text adaptive-text" id="spouseIdImage-help">يمكنك رفع صورة بطاقة الزوج (اختيارية)</small>
                </div>

                <div className="form-group">
                  <label htmlFor="wifeIdImage-upload" className="adaptive-text">صورة بطاقة الزوجة (اختيارية)</label>
                  <ImageUpload
                    key={`wife-${formData.maritalStatus}`}
                    initialImage={formData.wifeIdImage}
                    onImageUpload={(imageData) => handleImageUpload('wifeIdImage', imageData)}
                    label="اختر صورة بطاقة الزوجة"
                    id="wifeIdImage-container"
                    inputId="wifeIdImage-upload"
                  />
                  <small className="form-help-text adaptive-text" id="wifeIdImage-help">يمكنك رفع صورة بطاقة الزوجة (اختيارية)</small>
                </div>
              </div>
            </motion.div>
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
            className="btn-primary adaptive-text"
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
            className="btn-secondary adaptive-text"
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



