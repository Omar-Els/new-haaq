import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FaFileExcel, FaFilePdf, FaChartBar, FaChartPie, FaChartLine } from 'react-icons/fa';
import { selectAllInitiatives } from '../features/initiatives/initiativesSlice';
import { selectAllTransactions, selectFinanceStats } from '../features/finance/financeSlice';
import { selectAllBeneficiaries } from '../features/beneficiaries/beneficiariesSlice';
import { exportToExcel } from '../utils/helpers';
import { exportSheetToPDF, exportMonthlyReportToPDF, exportDetailedSheetToPDF, exportYearlyReportToPDF } from '../utils/pdfExporter';
import './Reports.css';

/**
 * Reports Component
 *
 * This component displays reports and statistics about initiatives,
 * finances, and beneficiaries.
 */
const Reports = () => {
  const [activeTab, setActiveTab] = useState('initiatives');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [chartType, setChartType] = useState('bar');
  
  const dispatch = useDispatch();
  
  // Get data from Redux store
  const initiatives = useSelector(selectAllInitiatives);
  const transactions = useSelector(selectAllTransactions);
  const financeStats = useSelector(selectFinanceStats);
  const beneficiaries = useSelector(selectAllBeneficiaries);
  
  // Filter data based on selected year and month
  const filteredInitiatives = initiatives.filter(initiative => {
    const initiativeDate = new Date(initiative.date);
    const initiativeYear = initiativeDate.getFullYear();
    const initiativeMonth = initiativeDate.getMonth();
    
    if (selectedMonth === null) {
      return initiativeYear === selectedYear;
    } else {
      return initiativeYear === selectedYear && initiativeMonth === selectedMonth;
    }
  });
  
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const transactionYear = transactionDate.getFullYear();
    const transactionMonth = transactionDate.getMonth();
    
    if (selectedMonth === null) {
      return transactionYear === selectedYear;
    } else {
      return transactionYear === selectedYear && transactionMonth === selectedMonth;
    }
  });
  
  // Calculate statistics
  const initiativesStats = {
    total: filteredInitiatives.length,
    totalBeneficiaries: filteredInitiatives.reduce((total, initiative) => 
      total + (initiative.beneficiaries?.length || 0), 0),
    totalAmount: filteredInitiatives.reduce((total, initiative) => 
      total + (parseFloat(initiative.totalAmount) || 0), 0)
  };
  
  const financesStats = {
    totalIncome: filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((total, t) => total + parseFloat(t.amount), 0),
    totalExpenses: filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((total, t) => total + parseFloat(t.amount), 0),
    balance: 0
  };
  
  financesStats.balance = financesStats.totalIncome - financesStats.totalExpenses;
  
  // Available years for filtering
  const years = Array.from(
    new Set([
      ...initiatives.map(i => new Date(i.date).getFullYear()),
      ...transactions.map(t => new Date(t.date).getFullYear())
    ])
  ).sort((a, b) => b - a); // Sort descending
  
  if (years.length === 0) {
    years.push(new Date().getFullYear());
  }
  
  // Available months for filtering
  const months = [
    { value: 0, label: 'يناير' },
    { value: 1, label: 'فبراير' },
    { value: 2, label: 'مارس' },
    { value: 3, label: 'أبريل' },
    { value: 4, label: 'مايو' },
    { value: 5, label: 'يونيو' },
    { value: 6, label: 'يوليو' },
    { value: 7, label: 'أغسطس' },
    { value: 8, label: 'سبتمبر' },
    { value: 9, label: 'أكتوبر' },
    { value: 10, label: 'نوفمبر' },
    { value: 11, label: 'ديسمبر' }
  ];
  
  // Animation variants
  const containerVariants = {
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
    visible: { y: 0, opacity: 1 }
  };
  
  // Handle export to Excel
  const handleExportToExcel = (data, filename) => {
    exportToExcel(data, filename);
  };
  
  return (
    <motion.div
      className="reports-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="page-header" variants={itemVariants}>
        <h1>التقارير والإحصائيات</h1>
      </motion.div>
      
      <motion.div className="filters-container" variants={itemVariants}>
        <div className="filter-group">
          <label htmlFor="year">السنة</label>
          <select
            id="year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="month">الشهر</label>
          <select
            id="month"
            value={selectedMonth === null ? '' : selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value === '' ? null : parseInt(e.target.value))}
          >
            <option value="">كل الشهور</option>
            {months.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="chartType">نوع الرسم البياني</label>
          <select
            id="chartType"
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
          >
            <option value="bar">أعمدة</option>
            <option value="pie">دائري</option>
            <option value="line">خطي</option>
          </select>
        </div>
      </motion.div>
      
      <motion.div className="tabs-container" variants={itemVariants}>
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'initiatives' ? 'active' : ''}`}
            onClick={() => setActiveTab('initiatives')}
          >
            تقارير المبادرات
          </button>
          <button
            className={`tab-btn ${activeTab === 'finances' ? 'active' : ''}`}
            onClick={() => setActiveTab('finances')}
          >
            تقارير الماليات
          </button>
          <button
            className={`tab-btn ${activeTab === 'beneficiaries' ? 'active' : ''}`}
            onClick={() => setActiveTab('beneficiaries')}
          >
            تقارير المستفيدين
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'initiatives' && (
            <div className="initiatives-report">
              <div className="report-header">
                <h2>تقارير المبادرات</h2>
                <button
                  className="btn btn-primary"
                  onClick={() => exportMonthlyReportToPDF(filteredInitiatives, selectedMonth, selectedYear)}
                >
                  <FaFilePdf /> تصدير إلى PDF
                </button>
              </div>
              
              <div className="stats-cards">
                <div className="stat-card">
                  <div className="stat-title">عدد المبادرات</div>
                  <div className="stat-value">{initiativesStats.total}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">عدد المستفيدين</div>
                  <div className="stat-value">{initiativesStats.totalBeneficiaries}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">إجمالي المبالغ</div>
                  <div className="stat-value">{initiativesStats.totalAmount.toFixed(2)} جنيه</div>
                </div>
              </div>
              
              <div className="chart-container">
                <div className="chart-placeholder">
                  {chartType === 'bar' && <FaChartBar className="chart-icon" />}
                  {chartType === 'pie' && <FaChartPie className="chart-icon" />}
                  {chartType === 'line' && <FaChartLine className="chart-icon" />}
                  <p>الرسم البياني للمبادرات</p>
                </div>
              </div>
              
              <div className="data-table">
                <h3>قائمة المبادرات</h3>
                {filteredInitiatives.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>اسم المبادرة</th>
                        <th>التاريخ</th>
                        <th>عدد المستفيدين</th>
                        <th>إجمالي المبلغ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInitiatives.map(initiative => (
                        <tr key={initiative.id}>
                          <td>{initiative.name}</td>
                          <td>{initiative.date}</td>
                          <td>{initiative.beneficiaries?.length || 0}</td>
                          <td>{parseFloat(initiative.totalAmount || 0).toFixed(2)} جنيه</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-data">لا توجد بيانات للعرض</p>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'finances' && (
            <div className="finances-report">
              <div className="report-header">
                <h2>تقارير الماليات</h2>
                <button
                  className="btn btn-primary"
                  onClick={() => exportMonthlyReportToPDF(filteredTransactions, selectedMonth, selectedYear)}
                >
                  <FaFilePdf /> تصدير إلى PDF
                </button>
              </div>
              
              <div className="stats-cards">
                <div className="stat-card income">
                  <div className="stat-title">إجمالي الإيرادات</div>
                  <div className="stat-value">{financesStats.totalIncome.toFixed(2)} جنيه</div>
                </div>
                <div className="stat-card expense">
                  <div className="stat-title">إجمالي المصروفات</div>
                  <div className="stat-value">{financesStats.totalExpenses.toFixed(2)} جنيه</div>
                </div>
                <div className="stat-card balance">
                  <div className="stat-title">الرصيد</div>
                  <div className="stat-value">{financesStats.balance.toFixed(2)} جنيه</div>
                </div>
              </div>
              
              <div className="chart-container">
                <div className="chart-placeholder">
                  {chartType === 'bar' && <FaChartBar className="chart-icon" />}
                  {chartType === 'pie' && <FaChartPie className="chart-icon" />}
                  {chartType === 'line' && <FaChartLine className="chart-icon" />}
                  <p>الرسم البياني للماليات</p>
                </div>
              </div>
              
              <div className="data-table">
                <h3>قائمة المعاملات المالية</h3>
                {filteredTransactions.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>التاريخ</th>
                        <th>النوع</th>
                        <th>الوصف</th>
                        <th>المبلغ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map(transaction => (
                        <tr key={transaction.id}>
                          <td>{transaction.date}</td>
                          <td>{transaction.type === 'income' ? 'إيراد' : 'مصروف'}</td>
                          <td>{transaction.description}</td>
                          <td className={transaction.type === 'income' ? 'income-amount' : 'expense-amount'}>
                            {parseFloat(transaction.amount).toFixed(2)} جنيه
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-data">لا توجد بيانات للعرض</p>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'beneficiaries' && (
            <div className="beneficiaries-report">
              <div className="report-header">
                <h2>تقارير المستفيدين</h2>
                <button
                  className="btn btn-primary"
                  onClick={() => exportMonthlyReportToPDF(beneficiaries, selectedMonth, selectedYear)}
                >
                  <FaFilePdf /> تصدير إلى PDF
                </button>
              </div>
              
              <div className="stats-cards">
                <div className="stat-card">
                  <div className="stat-title">عدد المستفيدين</div>
                  <div className="stat-value">{beneficiaries.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">عدد الأسر</div>
                  <div className="stat-value">
                    {beneficiaries.filter(b => b.maritalStatus === 'married').length}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">عدد الأفراد</div>
                  <div className="stat-value">
                    {beneficiaries.filter(b => b.maritalStatus !== 'married').length}
                  </div>
                </div>
              </div>
              
              <div className="chart-container">
                <div className="chart-placeholder">
                  {chartType === 'bar' && <FaChartBar className="chart-icon" />}
                  {chartType === 'pie' && <FaChartPie className="chart-icon" />}
                  {chartType === 'line' && <FaChartLine className="chart-icon" />}
                  <p>الرسم البياني للمستفيدين</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Reports;
