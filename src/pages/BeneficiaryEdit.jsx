import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  selectBeneficiaryById, 
  fetchBeneficiaries 
} from '../features/beneficiaries/beneficiariesSlice';
import BeneficiaryForm from '../components/BeneficiaryForm';
import './BeneficiaryEdit.css';

/**
 * BeneficiaryEdit Component
 * 
 * This component provides an interface for editing an existing beneficiary.
 * It loads the beneficiary data and passes it to the BeneficiaryForm.
 */
const BeneficiaryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Get focus field from URL query params
  const queryParams = new URLSearchParams(location.search);
  const focusField = queryParams.get('focus');
  
  // Get beneficiary from Redux store
  const beneficiary = useSelector(state => selectBeneficiaryById(state, id));
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Fetch beneficiaries if not already loaded
    dispatch(fetchBeneficiaries())
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false));
  }, [dispatch]);
  
  const handleComplete = () => {
    // Navigate back to beneficiaries list
    navigate('/');
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };
  
  if (isLoading) {
    return <div className="loading">جاري تحميل البيانات...</div>;
  }
  
  if (!beneficiary) {
    return (
      <div className="not-found">
        <h2>المستفيد غير موجود</h2>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          العودة للقائمة الرئيسية
        </button>
      </div>
    );
  }
  
  return (
    <motion.div 
      className="beneficiary-edit-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="page-header">
        <h1>تعديل بيانات المستفيد</h1>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/')}
        >
          إلغاء
        </button>
      </div>
      
      <BeneficiaryForm 
        beneficiary={beneficiary} 
        onComplete={handleComplete} 
        isEditing={true}
        focusField={focusField}
      />
    </motion.div>
  );
};

export default BeneficiaryEdit;
