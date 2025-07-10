import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaFileExcel, FaEdit, FaTrash, FaMoneyBillWave, FaCreditCard, FaWallet, FaHandHoldingUsd } from 'react-icons/fa';
import { selectAllBeneficiaries } from '../features/beneficiaries/beneficiariesSlice';
import {
  selectAllTransactions,
  selectFinanceStats,
  selectFinanceLoading,
  addTransaction,
  deleteTransaction,
  calculateStats
} from '../features/finance/financeSlice';
import './Finance.css';

/**
 * Finance Component
 *
 * This component displays financial information including income, expenses,
 * and transaction history.
 */
const Finance = () => {
  const dispatch = useDispatch();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTopUpForm, setShowTopUpForm] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    type: 'expense',
    description: '',
    beneficiaries: []
  });

  const [topUpData, setTopUpData] = useState({
    amount: '',
    method: 'cash',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  // استخدام بيانات المعاملات من Redux
  const transactions = useSelector(selectAllTransactions);
  const stats = useSelector(selectFinanceStats);
  const isLoading = useSelector(selectFinanceLoading);
  const beneficiaries = useSelector(selectAllBeneficiaries);

  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState([]);
  const [showBeneficiariesSelection, setShowBeneficiariesSelection] = useState(false);

  // إعادة حساب الإحصائيات عند تغيير المعاملات
  useEffect(() => {
    dispatch(calculateStats());
  }, [transactions, dispatch]);

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
    if (showTopUpForm) setShowTopUpForm(false);
    if (!showAddForm) {
      // Reset form when opening
      setNewTransaction({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        type: 'expense',
        description: '',
        beneficiaries: []
      });
      setSelectedBeneficiaries([]);
    }
  };

  const toggleTopUpForm = () => {
    setShowTopUpForm(!showTopUpForm);
    if (showAddForm) setShowAddForm(false);
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

  const handleTopUpInputChange = (e) => {
    const { name, value } = e.target;
    setTopUpData({
      ...topUpData,
      [name]: value
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction({
      ...newTransaction,
      [name]: value
    });
  };

  const toggleBeneficiarySelection = () => {
    setShowBeneficiariesSelection(!showBeneficiariesSelection);
  };

  const handleBeneficiaryChange = (beneficiaryId) => {
    if (selectedBeneficiaries.includes(beneficiaryId)) {
      setSelectedBeneficiaries(selectedBeneficiaries.filter(id => id !== beneficiaryId));
    } else {
      setSelectedBeneficiaries([...selectedBeneficiaries, beneficiaryId]);
    }
  };

  // وظيفة حذف المعاملة
  const handleDeleteTransaction = (transactionId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المعاملة؟')) {
      dispatch(deleteTransaction(transactionId))
        .unwrap()
        .then(() => {
          // إظهار رسالة نجاح (يمكن إضافة إشعار هنا)
          console.log('تم حذف المعاملة بنجاح');
          // إعادة حساب الإحصائيات
          dispatch(calculateStats());
        })
        .catch(error => {
          console.error('خطأ في حذف المعاملة:', error);
          // يمكن إضافة إشعار خطأ هنا
        });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create new transaction with selected beneficiaries
    const transaction = {
      ...newTransaction,
      // تحويل المبلغ إلى رقم
      amount: parseFloat(newTransaction.amount),
      beneficiaries: selectedBeneficiaries.map(id => {
        const beneficiary = beneficiaries.find(b => b.id === id);
        return {
          id: beneficiary.id,
          name: beneficiary.name
        };
      })
    };

    // إضافة المعاملة باستخدام Redux
    dispatch(addTransaction(transaction))
      .unwrap()
      .then(() => {
        // إظهار رسالة نجاح (يمكن إضافة إشعار هنا)
        console.log('تمت إضافة المعاملة بنجاح');
        // إعادة حساب الإحصائيات
        dispatch(calculateStats());
        // إغلاق النموذج
        toggleAddForm();
      })
      .catch(error => {
        console.error('خطأ في إضافة المعاملة:', error);
        // يمكن إضافة إشعار خطأ هنا
      });
  };

  const handleTopUpSubmit = (e) => {
    e.preventDefault();

    // إنشاء معاملة جديدة من نوع إيراد (توب أب)
    const transaction = {
      date: topUpData.date,
      amount: parseFloat(topUpData.amount),
      type: 'income',
      description: `توب أب (${getMethodName(topUpData.method)}): ${topUpData.description}`,
      beneficiaries: []
    };

    // إضافة المعاملة باستخدام Redux
    dispatch(addTransaction(transaction))
      .unwrap()
      .then(() => {
        // إظهار رسالة نجاح
        console.log('تم إضافة التوب أب بنجاح');
        // إعادة حساب الإحصائيات
        dispatch(calculateStats());
        // إغلاق النموذج
        toggleTopUpForm();
      })
      .catch(error => {
        console.error('خطأ في إضافة التوب أب:', error);
      });
  };

  // وظيفة مساعدة للحصول على اسم طريقة الدفع بالعربية
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

  return (
    <motion.div
      className="finance-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="page-header">
        <h1>المالية</h1>
        <div className="header-actions">
          <motion.button
            className="btn btn-success"
            onClick={toggleTopUpForm}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showTopUpForm ? "إلغاء" : <><FaMoneyBillWave /> توب أب</>}
          </motion.button>
          <motion.button
            className="btn btn-primary"
            onClick={toggleAddForm}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showAddForm ? "إلغاء" : <><FaPlus /> إضافة معاملة جديدة</>}
          </motion.button>
        </div>
      </div>

      {/* بطاقات ملخص المالية */}
      <div className="finance-summary">
        <motion.div
          className="summary-card income-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h3>الإيرادات</h3>
          <div className="summary-amount">{stats.totalIncome.toFixed(2)} جنيه مصري</div>
        </motion.div>

        <motion.div
          className="summary-card expense-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h3>المصروفات</h3>
          <div className="summary-amount">{stats.totalExpenses.toFixed(2)} جنيه مصري</div>
        </motion.div>

        <motion.div
          className="summary-card balance-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <h3>الرصيد</h3>
          <div className="summary-amount">{stats.balance.toFixed(2)} جنيه مصري</div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showTopUpForm && (
          <motion.div
            className="add-form-container card top-up-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h2>إضافة توب أب</h2>
            <form onSubmit={handleTopUpSubmit}>
              <div className="form-group">
                <label htmlFor="topup-date">التاريخ</label>
                <input
                  type="date"
                  id="topup-date"
                  name="date"
                  value={topUpData.date}
                  onChange={handleTopUpInputChange}
                  required
                  autoComplete="off"
                  aria-label="تاريخ التوب أب"
                />
              </div>

              <div className="form-group">
                <label htmlFor="topup-amount">المبلغ</label>
                <input
                  type="number"
                  id="topup-amount"
                  name="amount"
                  value={topUpData.amount}
                  onChange={handleTopUpInputChange}
                  required
                  min="0"
                  step="0.01"
                  autoComplete="off"
                  aria-label="مبلغ التوب أب"
                  placeholder="أدخل المبلغ"
                />
              </div>

              <div className="form-group">
                <label htmlFor="topup-method">طريقة الدفع</label>
                <select
                  id="topup-method"
                  name="method"
                  value={topUpData.method}
                  onChange={handleTopUpInputChange}
                  required
                  autoComplete="off"
                  aria-label="اختر طريقة الدفع"
                >
                  <option value="cash">نقدي</option>
                  <option value="card">بطاقة ائتمان</option>
                  <option value="bank">تحويل بنكي</option>
                  <option value="donation">تبرع</option>
                </select>

                <div className="payment-method-icons">
                  <div
                    className={`payment-method-icon ${topUpData.method === 'cash' ? 'active' : ''}`}
                    onClick={() => setTopUpData({...topUpData, method: 'cash'})}
                  >
                    <FaMoneyBillWave />
                    <span>نقدي</span>
                  </div>
                  <div
                    className={`payment-method-icon ${topUpData.method === 'card' ? 'active' : ''}`}
                    onClick={() => setTopUpData({...topUpData, method: 'card'})}
                  >
                    <FaCreditCard />
                    <span>بطاقة ائتمان</span>
                  </div>
                  <div
                    className={`payment-method-icon ${topUpData.method === 'bank' ? 'active' : ''}`}
                    onClick={() => setTopUpData({...topUpData, method: 'bank'})}
                  >
                    <FaWallet />
                    <span>تحويل بنكي</span>
                  </div>
                  <div
                    className={`payment-method-icon ${topUpData.method === 'donation' ? 'active' : ''}`}
                    onClick={() => setTopUpData({...topUpData, method: 'donation'})}
                  >
                    <FaHandHoldingUsd />
                    <span>تبرع</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="topup-description">الوصف</label>
                <textarea
                  id="topup-description"
                  name="description"
                  value={topUpData.description}
                  onChange={handleTopUpInputChange}
                  required
                  placeholder="أدخل وصفًا للتوب أب أو اسم المتبرع"
                  autoComplete="off"
                  aria-label="وصف التوب أب"
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-success">
                  <FaMoneyBillWave /> إضافة التوب أب
                </button>
                <button type="button" className="btn btn-secondary" onClick={toggleTopUpForm}>إلغاء</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="add-form-container card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h2>إضافة معاملة جديدة</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="date">التاريخ</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={newTransaction.date}
                  onChange={handleInputChange}
                  required
                  autoComplete="off"
                  aria-label="تاريخ المعاملة"
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">نوع المعاملة</label>
                <select
                  id="type"
                  name="type"
                  value={newTransaction.type}
                  onChange={handleInputChange}
                  required
                  autoComplete="off"
                  aria-label="اختر نوع المعاملة"
                >
                  <option value="income">إيراد</option>
                  <option value="expense">مصروف</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="amount">المبلغ</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={newTransaction.amount}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  autoComplete="off"
                  aria-label="مبلغ المعاملة"
                  placeholder="أدخل المبلغ"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">الوصف</label>
                <textarea
                  id="description"
                  name="description"
                  value={newTransaction.description}
                  onChange={handleInputChange}
                  required
                  autoComplete="off"
                  aria-label="وصف المعاملة"
                  placeholder="أدخل وصف المعاملة"
                  rows="3"
                />
              </div>

              {newTransaction.type === 'expense' && (
                <div className="form-group">
                  <label>المستفيدين</label>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={toggleBeneficiarySelection}
                    aria-label="إضافة أو إخفاء قائمة المستفيدين"
                    aria-expanded={showBeneficiariesSelection}
                  >
                    {showBeneficiariesSelection ? "إخفاء المستفيدين" : "إضافة مستفيدين"}
                  </button>

                  <AnimatePresence>
                    {showBeneficiariesSelection && (
                      <motion.div
                        className="beneficiaries-selection"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        {beneficiaries.length > 0 ? (
                          <div className="beneficiaries-list">
                            {beneficiaries.map(beneficiary => (
                              <div key={beneficiary.id} className="beneficiary-checkbox">
                                <input
                                  type="checkbox"
                                  id={`beneficiary-${beneficiary.id}`}
                                  checked={selectedBeneficiaries.includes(beneficiary.id)}
                                  onChange={() => handleBeneficiaryChange(beneficiary.id)}
                                />
                                <label htmlFor={`beneficiary-${beneficiary.id}`}>
                                  {beneficiary.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="no-beneficiaries">
                            لا يوجد مستفيدين متاحين
                          </div>
                        )}
                        <div className="selected-count">
                          تم اختيار {selectedBeneficiaries.length} مستفيد
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">حفظ</button>
                <button type="button" className="btn btn-secondary" onClick={toggleAddForm}>إلغاء</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* عرض المعاملات */}
      <div className="transactions-list">
        {transactions.length > 0 ? (
          transactions.map(transaction => (
            <motion.div
              key={transaction.id}
              className="transaction-card card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="transaction-header">
                <h3>{transaction.type === 'income' ? 'إيراد' : 'مصروف'}</h3>
                <span className="transaction-date">{transaction.date}</span>
              </div>
              <div className="transaction-amount">
                <span className={transaction.type === 'income' ? 'income-amount' : 'expense-amount'}>
                  {parseFloat(transaction.amount).toFixed(2)} جنيه مصري
                </span>
              </div>
              <div className="transaction-description">
                {transaction.description}
              </div>

              {transaction.type === 'expense' && transaction.beneficiaries.length > 0 && (
                <div className="transaction-beneficiaries-container">
                  <button
                    className="show-beneficiaries-btn"
                    onClick={(e) => {
                      // تبديل عرض المستفيدين
                      e.currentTarget.parentNode.classList.toggle('show-details');
                    }}
                  >
                    عرض المستفيدين ({transaction.beneficiaries.length})
                  </button>
                  <div className="transaction-beneficiaries">
                    <ul>
                      {transaction.beneficiaries.map(beneficiary => {
                        // حساب المبلغ لكل مستفيد (بالتساوي)
                        const amountPerBeneficiary = (
                          parseFloat(transaction.amount) / transaction.beneficiaries.length
                        ).toFixed(2);

                        return (
                          <li key={beneficiary.id}>
                            <span className="beneficiary-name">{beneficiary.name}</span>
                            <span className="beneficiary-amount">{amountPerBeneficiary} جنيه</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}

              <div className="transaction-actions">
                <button
                  className="btn-icon edit-btn"
                  title="تعديل المعاملة"
                  onClick={() => console.log('تعديل المعاملة', transaction.id)}
                >
                  <FaEdit />
                </button>
                <button
                  className="btn-icon delete-btn"
                  title="حذف المعاملة"
                  onClick={() => handleDeleteTransaction(transaction.id)}
                >
                  <FaTrash />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="no-transactions">
            لا توجد معاملات مالية
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Finance;

















