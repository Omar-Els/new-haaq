import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addInitiative, updateInitiative } from '../features/initiatives/initiativesSlice';
import { selectAllBeneficiaries } from '../features/beneficiaries/beneficiariesSlice';
import './InitiativeForm.css';

/**
 * InitiativeForm Component
 *
 * This component provides a form for adding or editing initiatives.
 * It now includes the ability to select beneficiaries from the existing list.
 *
 * @param {Object} props - Component props
 * @param {Object} props.initiative - Existing initiative data for editing (optional)
 * @param {Function} props.onComplete - Callback function when form is submitted
 * @param {boolean} props.isEditing - Whether the form is in edit mode
 */
const InitiativeForm = ({ initiative = null, onComplete, isEditing = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    beneficiaries: [],
    totalAmount: 0
  });

  const [errors, setErrors] = useState({});
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState([]);

  const dispatch = useDispatch();
  const allBeneficiaries = useSelector(selectAllBeneficiaries);

  // If editing, populate form with existing data
  useEffect(() => {
    if (initiative) {
      setFormData({
        ...initiative,
        date: initiative.date || new Date().toISOString().split('T')[0]
      });

      // Set selected beneficiaries if they exist
      if (initiative.beneficiaries && initiative.beneficiaries.length > 0) {
        setSelectedBeneficiaries(initiative.beneficiaries.map(b => b.id));
      }
    }
  }, [initiative]);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'اسم المبادرة مطلوب';
    }

    if (!formData.date) {
      newErrors.date = 'تاريخ المبادرة مطلوب';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'وصف المبادرة مطلوب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleBeneficiaryToggle = (beneficiaryId) => {
    setSelectedBeneficiaries(prev => {
      if (prev.includes(beneficiaryId)) {
        return prev.filter(id => id !== beneficiaryId);
      } else {
        return [...prev, beneficiaryId];
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Get full beneficiary objects for selected IDs
    const selectedBeneficiaryObjects = allBeneficiaries
      .filter(b => selectedBeneficiaries.includes(b.id));

    const initiativeData = {
      ...formData,
      beneficiaries: selectedBeneficiaryObjects
    };

    if (isEditing) {
      dispatch(updateInitiative(initiativeData));
    } else {
      dispatch(addInitiative(initiativeData));
    }

    onComplete();
  };

  return (
    <div className="form-container form-fade-in">
      <h2>{isEditing ? 'تعديل المبادرة' : 'إضافة مبادرة جديدة'}</h2>
      <form onSubmit={handleSubmit} className="form-grid single-column">
        <div className="form-group">
          <label htmlFor="name">اسم المبادرة</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <div className="error-message">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="date">تاريخ المبادرة</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={errors.date ? 'error' : ''}
          />
          {errors.date && <div className="error-message">{errors.date}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="description">وصف المبادرة</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className={errors.description ? 'error' : ''}
          ></textarea>
          {errors.description && <div className="error-message">{errors.description}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="beneficiaries-selection">المستفيدون</label>
          <div id="beneficiaries-selection" className="beneficiaries-selection">
            {allBeneficiaries.length > 0 ? (
              <div className="beneficiaries-list">
                {allBeneficiaries.map(beneficiary => (
                  <div key={beneficiary.id} className="beneficiary-checkbox">
                    <input
                      type="checkbox"
                      id={`beneficiary-${beneficiary.id}`}
                      checked={selectedBeneficiaries.includes(beneficiary.id)}
                      onChange={() => handleBeneficiaryToggle(beneficiary.id)}
                    />
                    <label htmlFor={`beneficiary-${beneficiary.id}`}>
                      {beneficiary.name} - {beneficiary.nationalId}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-beneficiaries">لا يوجد مستفيدين مسجلين. يرجى إضافة مستفيدين أولاً.</p>
            )}
          </div>
          <div className="selected-count">
            تم اختيار {selectedBeneficiaries.length} مستفيد
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="totalAmount">إجمالي الدعم</label>
          <input
            type="number"
            id="totalAmount"
            name="totalAmount"
            value={formData.totalAmount}
            onChange={handleChange}
            min="0"
            step="0.01"
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onComplete}>
            إلغاء
          </button>
          <button type="submit" className="btn-primary">
            {isEditing ? 'تحديث المبادرة' : 'إضافة المبادرة'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InitiativeForm;


