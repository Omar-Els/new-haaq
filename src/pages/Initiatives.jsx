import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchInitiatives, 
  selectAllInitiatives,
  selectInitiativesLoading,
  selectInitiativesError,
  deleteInitiative
} from '../features/initiatives/initiativesSlice';
import InitiativeForm from '../components/InitiativeForm';
import { exportToExcel } from '../utils/helpers';
import './Initiatives.css';

/**
 * Initiatives Component
 * 
 * This component displays all seasonal initiatives (Ramadan, Eid al-Fitr, Eid al-Adha, etc.)
 * with details of participating beneficiaries and support values.
 */
const Initiatives = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentInitiative, setCurrentInitiative] = useState(null);
  const [showDetails, setShowDetails] = useState(null);
  
  const dispatch = useDispatch();
  
  // Add safe checks for Redux state
  const initiatives = useSelector((state) => {
    return state.initiatives ? selectAllInitiatives(state) : [];
  });
  
  const isLoading = useSelector((state) => {
    return state.initiatives ? selectInitiativesLoading(state) : false;
  });
  
  const error = useSelector((state) => {
    return state.initiatives ? selectInitiativesError(state) : null;
  });

  // Log state for debugging
  console.log('Initiatives:', initiatives);
  console.log('Loading:', isLoading);
  console.log('Error:', error);

  useEffect(() => {
    dispatch(fetchInitiatives());
  }, [dispatch]);

  const handleAddInitiative = () => {
    setCurrentInitiative(null);
    setShowAddForm(true);
  };

  const handleEditInitiative = (initiative) => {
    setCurrentInitiative(initiative);
    setShowAddForm(true);
  };

  const handleDeleteInitiative = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المبادرة؟')) {
      dispatch(deleteInitiative(id));
    }
  };

  const handleExportToExcel = (initiative) => {
    const data = [
      {
        'اسم المبادرة': initiative.name,
        'التاريخ': initiative.date,
        'الوصف': initiative.description,
        'عدد المستفيدين': initiative.beneficiaries?.length || 0,
        'إجمالي الدعم': initiative.totalAmount || 0
      }
    ];
    
    exportToExcel(data, `initiative-${initiative.id}`);
  };

  const toggleDetails = (id) => {
    setShowDetails(showDetails === id ? null : id);
  };

  return (
    <div className="initiatives-container">
      <div className="page-header">
        <h1>المبادرات الموسمية</h1>
        <button 
          className="btn btn-primary"
          onClick={handleAddInitiative}
        >
          إضافة مبادرة جديدة
        </button>
      </div>

      {showAddForm && (
        <InitiativeForm 
          initiative={currentInitiative}
          isEditing={!!currentInitiative}
          onComplete={() => {
            setShowAddForm(false);
            setCurrentInitiative(null);
          }}
        />
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="loading-message">جاري تحميل البيانات...</div>
      ) : (
        <div className="initiatives-grid">
          {initiatives && initiatives.length > 0 ? (
            initiatives.map((initiative) => (
              <div 
                key={initiative.id} 
                className="initiative-card card"
              >
                <h3>{initiative.name}</h3>
                <p className="initiative-date">التاريخ: {initiative.date}</p>
                <p className="initiative-description">{initiative.description}</p>
                <div className="initiative-stats">
                  <div className="stat">
                    <span className="stat-label">عدد المستفيدين:</span>
                    <span className="stat-value">{initiative.beneficiaries?.length || 0}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">إجمالي الدعم:</span>
                    <span className="stat-value">{initiative.totalAmount || 0} جنيه</span>
                  </div>
                </div>
                
                {showDetails === initiative.id && (
                  <div className="initiative-details">
                    <h4>المستفيدون:</h4>
                    {initiative.beneficiaries?.length > 0 ? (
                      <ul className="beneficiaries-list">
                        {initiative.beneficiaries.map(beneficiary => (
                          <li key={beneficiary.id}>{beneficiary.name}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>لا يوجد مستفيدين مسجلين في هذه المبادرة</p>
                    )}
                  </div>
                )}
                
                <div className="card-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => toggleDetails(initiative.id)}
                  >
                    {showDetails === initiative.id ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleEditInitiative(initiative)}
                  >
                    تعديل
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDeleteInitiative(initiative.id)}
                  >
                    حذف
                  </button>
                  <button 
                    className="btn btn-info"
                    onClick={() => handleExportToExcel(initiative)}
                  >
                    تصدير إلى Excel
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <p>لا توجد مبادرات حال</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Initiatives;

