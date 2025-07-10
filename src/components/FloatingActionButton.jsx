import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaMoneyBillWave, FaTimes, FaHandHoldingUsd, FaCreditCard, FaWallet } from 'react-icons/fa';
import { addTransaction, calculateStats } from '../features/finance/financeSlice';
import { addNotification } from '../features/notifications/notificationsSlice';
import './FloatingActionButton.css';

/**
 * FloatingActionButton Component
 *
 * A floating action button that provides quick access to the top-up functionality
 * from anywhere in the application.
 */
const FloatingActionButton = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [showTopUpForm, setShowTopUpForm] = useState(false);

  // State for top-up form
  const [topUpData, setTopUpData] = useState({
    amount: '',
    method: 'cash',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Toggle the FAB menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (showTopUpForm) {
      setShowTopUpForm(false);
    }
  };

  // Toggle the top-up form
  const toggleTopUpForm = () => {
    setShowTopUpForm(!showTopUpForm);
    if (!showTopUpForm) {
      // Reset form when opening
      setTopUpData({
        amount: '',
        method: 'cash',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTopUpData({
      ...topUpData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Create new transaction
    const transaction = {
      date: topUpData.date,
      amount: parseFloat(topUpData.amount),
      type: 'income',
      description: `توب أب (${getMethodName(topUpData.method)}): ${topUpData.description}`,
      beneficiaries: []
    };

    // Add transaction to Redux store
    dispatch(addTransaction(transaction))
      .unwrap()
      .then(() => {
        // Show success notification
        dispatch(addNotification({
          type: 'success',
          message: 'تم إضافة التوب أب بنجاح'
        }));

        // Recalculate stats
        dispatch(calculateStats());

        // Close form and menu
        setShowTopUpForm(false);
        setIsOpen(false);
      })
      .catch(error => {
        // Show error notification
        dispatch(addNotification({
          type: 'error',
          message: 'حدث خطأ أثناء إضافة التوب أب'
        }));
        console.error('Error adding top-up:', error);
      });
  };

  // Helper function to get method name in Arabic
  const getMethodName = (method) => {
    switch (method) {
      case 'cash':
        return 'نقدي';
      case 'card':
        return 'بطاقة ائتمان';
      case 'bank':
        return 'تحويل بنكي';
      case 'donation':
        return 'تبرع';
      default:
        return method;
    }
  };

  // تسجيل وجود الزر في وحدة التخزين المحلية للتأكد من ظهوره
  useEffect(() => {
    // تعيين علامة في localStorage لتتبع تحميل الزر
    localStorage.setItem('fabLoaded', 'true');

    // تنظيف عند إزالة المكون
    return () => {
      localStorage.removeItem('fabLoaded');
    };
  }, []);

  return (
    <>
      {/* Backdrop for when form is open */}
      <AnimatePresence>
        {(isOpen || showTopUpForm) && (
          <motion.div
            className="fab-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsOpen(false);
              setShowTopUpForm(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Top-up Form */}
      <AnimatePresence>
        {showTopUpForm && (
          <motion.div
            className="topup-form-container"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <div className="topup-form-header">
              <h3>إضافة توب أب</h3>
              <button className="close-btn" onClick={toggleTopUpForm}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="fab-topup-date">التاريخ</label>
                <input
                  type="date"
                  id="fab-topup-date"
                  name="date"
                  value={topUpData.date}
                  onChange={handleInputChange}
                  required
                  autoComplete="off"
                />
              </div>

              <div className="form-group">
                <label htmlFor="fab-topup-amount">المبلغ</label>
                <input
                  type="number"
                  id="fab-topup-amount"
                  name="amount"
                  value={topUpData.amount}
                  onChange={handleInputChange}
                  placeholder="أدخل المبلغ"
                  required
                  min="0"
                  step="0.01"
                  autoComplete="off"
                />
              </div>

              <div className="form-group">
                <label id="payment-method-label">طريقة الدفع</label>
                <select
                  id="fab-payment-method"
                  name="method"
                  value={topUpData.method}
                  onChange={handleInputChange}
                  className="visually-hidden"
                  aria-labelledby="payment-method-label"
                >
                  <option value="cash">نقدي</option>
                  <option value="card">بطاقة</option>
                  <option value="bank">تحويل</option>
                  <option value="donation">تبرع</option>
                </select>
                <div className="payment-methods" role="radiogroup" aria-labelledby="payment-method-label">
                  <div
                    className={`payment-method ${topUpData.method === 'cash' ? 'active' : ''}`}
                    onClick={() => setTopUpData({...topUpData, method: 'cash'})}
                    role="radio"
                    aria-checked={topUpData.method === 'cash'}
                    tabIndex={topUpData.method === 'cash' ? 0 : -1}
                  >
                    <FaMoneyBillWave />
                    <span>نقدي</span>
                  </div>
                  <div
                    className={`payment-method ${topUpData.method === 'card' ? 'active' : ''}`}
                    onClick={() => setTopUpData({...topUpData, method: 'card'})}
                    role="radio"
                    aria-checked={topUpData.method === 'card'}
                    tabIndex={topUpData.method === 'card' ? 0 : -1}
                  >
                    <FaCreditCard />
                    <span>بطاقة</span>
                  </div>
                  <div
                    className={`payment-method ${topUpData.method === 'bank' ? 'active' : ''}`}
                    onClick={() => setTopUpData({...topUpData, method: 'bank'})}
                    role="radio"
                    aria-checked={topUpData.method === 'bank'}
                    tabIndex={topUpData.method === 'bank' ? 0 : -1}
                  >
                    <FaWallet />
                    <span>تحويل</span>
                  </div>
                  <div
                    className={`payment-method ${topUpData.method === 'donation' ? 'active' : ''}`}
                    onClick={() => setTopUpData({...topUpData, method: 'donation'})}
                    role="radio"
                    aria-checked={topUpData.method === 'donation'}
                    tabIndex={topUpData.method === 'donation' ? 0 : -1}
                  >
                    <FaHandHoldingUsd />
                    <span>تبرع</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="fab-topup-description">الوصف</label>
                <textarea
                  id="fab-topup-description"
                  name="description"
                  value={topUpData.description}
                  onChange={handleInputChange}
                  placeholder="أدخل وصفًا للتوب أب"
                  required
                  autoComplete="off"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  <FaMoneyBillWave /> إضافة التوب أب
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Menu Items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fab-menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <motion.button
              className="fab-item"
              onClick={toggleTopUpForm}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaMoneyBillWave />
              <span>توب أب</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <motion.button
        className={`fab-button fn-button ${isOpen ? 'open' : ''}`}
        onClick={toggleMenu}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{ display: 'flex', visibility: 'visible', opacity: 1 }}
      >
        {isOpen ? <FaTimes /> : <FaPlus />}
      </motion.button>
    </>
  );
};

export default FloatingActionButton;
