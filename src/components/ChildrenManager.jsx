import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ChildrenManager.css';

/**
 * ChildrenManager Component
 *
 * This component manages a list of children for a beneficiary.
 * It allows adding, editing, and removing children.
 *
 * @param {Object} props - Component props
 * @param {Array} props.children - Array of children objects
 * @param {Function} props.onChange - Callback when children list changes
 */
const ChildrenManager = ({ children = [], onChange }) => {
  const [childrenList, setChildrenList] = useState(children);
  const [newChild, setNewChild] = useState({
    name: '',
    age: '',
    gender: 'male',
    schoolLevel: '',
    healthStatus: 'healthy'
  });
  const [editIndex, setEditIndex] = useState(-1);
  const [errors, setErrors] = useState({});

  // Handle input change for new/edited child
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editIndex >= 0) {
      // Editing existing child
      const updatedList = [...childrenList];
      updatedList[editIndex] = {
        ...updatedList[editIndex],
        [name]: value
      };
      setChildrenList(updatedList);
      onChange(updatedList);
    } else {
      // Adding new child
      setNewChild({
        ...newChild,
        [name]: value
      });
    }
  };

  // Validate child data
  const validateChild = (child) => {
    const newErrors = {};

    if (!child.name.trim()) {
      newErrors.name = 'اسم الابن مطلوب';
    }

    if (!child.age) {
      newErrors.age = 'العمر مطلوب';
    } else if (isNaN(child.age) || Number(child.age) < 0 || Number(child.age) > 100) {
      newErrors.age = 'العمر يجب أن يكون رقم بين 0 و 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add new child to the list
  const handleAddChild = () => {
    if (validateChild(newChild)) {
      const updatedList = [...childrenList, {
        ...newChild,
        id: Date.now().toString(),
        age: Number(newChild.age)
      }];

      setChildrenList(updatedList);
      onChange(updatedList);

      // Reset form
      setNewChild({
        name: '',
        age: '',
        gender: 'male',
        schoolLevel: '',
        healthStatus: 'healthy'
      });
      setErrors({});
    }
  };

  // Start editing a child
  const handleEditStart = (index) => {
    setEditIndex(index);
    setErrors({});
  };

  // Save edited child
  const handleEditSave = () => {
    if (validateChild(childrenList[editIndex])) {
      // Ensure age is a number
      const updatedList = [...childrenList];
      updatedList[editIndex] = {
        ...updatedList[editIndex],
        age: Number(updatedList[editIndex].age)
      };

      setChildrenList(updatedList);
      onChange(updatedList);
      setEditIndex(-1);
      setErrors({});
    }
  };

  // Cancel editing
  const handleEditCancel = () => {
    setEditIndex(-1);
    setErrors({});
  };

  // Remove a child from the list
  const handleRemoveChild = (index) => {
    const updatedList = childrenList.filter((_, i) => i !== index);
    setChildrenList(updatedList);
    onChange(updatedList);

    if (editIndex === index) {
      setEditIndex(-1);
    } else if (editIndex > index) {
      setEditIndex(editIndex - 1);
    }
  };

  // Animation variants
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="children-manager">
      <h3>بيانات الأبناء</h3>

      {/* Children List */}
      {childrenList.length > 0 ? (
        <motion.ul
          className="children-list"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {childrenList.map((child, index) => (
              <motion.li
                key={child.id || index}
                className="child-item"
                variants={itemVariants}
                exit="exit"
              >
                {editIndex === index ? (
                  // Edit form
                  <div className="child-edit-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor={`edit-name-${index}`}>الاسم</label>
                        <input
                          type="text"
                          id={`edit-name-${index}`}
                          name="name"
                          value={child.name}
                          onChange={handleInputChange}
                          className={errors.name ? 'error' : ''}
                        />
                        {errors.name && <span className="error-text">{errors.name}</span>}
                      </div>

                      <div className="form-group">
                        <label htmlFor={`edit-age-${index}`}>العمر</label>
                        <input
                          type="number"
                          id={`edit-age-${index}`}
                          name="age"
                          value={child.age}
                          onChange={handleInputChange}
                          className={errors.age ? 'error' : ''}
                        />
                        {errors.age && <span className="error-text">{errors.age}</span>}
                      </div>

                      <div className="form-group">
                        <label htmlFor={`edit-gender-${index}`}>النوع</label>
                        <select
                          id={`edit-gender-${index}`}
                          name="gender"
                          value={child.gender}
                          onChange={handleInputChange}
                        >
                          <option value="male">ذكر</option>
                          <option value="female">أنثى</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor={`edit-schoolLevel-${index}`}>المرحلة الدراسية</label>
                        <select
                          id={`edit-schoolLevel-${index}`}
                          name="schoolLevel"
                          value={child.schoolLevel}
                          onChange={handleInputChange}
                        >
                          <option value="">غير ملتحق</option>
                          <option value="kindergarten">حضانة</option>
                          <option value="primary">ابتدائي</option>
                          <option value="preparatory">إعدادي</option>
                          <option value="secondary">ثانوي</option>
                          <option value="university">جامعي</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor={`edit-healthStatus-${index}`}>الحالة الصحية</label>
                        <select
                          id={`edit-healthStatus-${index}`}
                          name="healthStatus"
                          value={child.healthStatus}
                          onChange={handleInputChange}
                        >
                          <option value="healthy">سليم</option>
                          <option value="chronic">مرض مزمن</option>
                          <option value="disability">إعاقة</option>
                        </select>
                      </div>
                    </div>

                    <div className="edit-actions">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleEditSave}
                      >
                        حفظ
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleEditCancel}
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display child info
                  <div className="child-info">
                    <div className="child-details">
                      <h4>{child.name}</h4>
                      <div className="child-meta">
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
                    </div>
                    <div className="child-actions">
                      <button
                        type="button"
                        className="btn-icon edit"
                        onClick={() => handleEditStart(index)}
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        className="btn-icon delete"
                        onClick={() => handleRemoveChild(index)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      ) : (
        <p className="no-children">لا يوجد أبناء مسجلين</p>
      )}

      {/* Add New Child Form */}
      {editIndex === -1 && (
        <div className="add-child-form">
          <h4>إضافة ابن جديد</h4>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="new-child-name">الاسم</label>
              <input
                type="text"
                id="new-child-name"
                name="name"
                value={newChild.name}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="new-child-age">العمر</label>
              <input
                type="number"
                id="new-child-age"
                name="age"
                value={newChild.age}
                onChange={handleInputChange}
                className={errors.age ? 'error' : ''}
              />
              {errors.age && <span className="error-text">{errors.age}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="new-child-gender">النوع</label>
              <select
                id="new-child-gender"
                name="gender"
                value={newChild.gender}
                onChange={handleInputChange}
              >
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="new-child-schoolLevel">المرحلة الدراسية</label>
              <select
                id="new-child-schoolLevel"
                name="schoolLevel"
                value={newChild.schoolLevel}
                onChange={handleInputChange}
              >
                <option value="">غير ملتحق</option>
                <option value="kindergarten">حضانة</option>
                <option value="primary">ابتدائي</option>
                <option value="preparatory">إعدادي</option>
                <option value="secondary">ثانوي</option>
                <option value="university">جامعي</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="new-child-healthStatus">الحالة الصحية</label>
              <select
                id="new-child-healthStatus"
                name="healthStatus"
                value={newChild.healthStatus}
                onChange={handleInputChange}
              >
                <option value="healthy">سليم</option>
                <option value="chronic">مرض مزمن</option>
                <option value="disability">إعاقة</option>
              </select>
            </div>

            <div className="form-group">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddChild}
              >
                إضافة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildrenManager;
