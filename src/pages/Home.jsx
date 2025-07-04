import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  fetchBeneficiaries,
  setFilter,
  clearFilters,
  selectFilteredBeneficiaries,
  selectBeneficiariesLoading,
  selectBeneficiariesError,
  selectBeneficiariesFilter,
} from "../features/beneficiaries/beneficiariesSlice";
import BeneficiaryCard from "../components/BeneficiaryCard";
import BeneficiaryForm from "../components/BeneficiaryForm";
import PhotoGallery from "../components/PhotoGallery";
import "./Home.css";

/**
 * Home Component
 *
 * This is the main welcome page with search functionality.
 * Beneficiaries are only shown when searching.
 */
const Home = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dispatch = useDispatch();
  const beneficiaries = useSelector(selectFilteredBeneficiaries);
  const isLoading = useSelector(selectBeneficiariesLoading);
  const error = useSelector(selectBeneficiariesError);
  const filter = useSelector(selectBeneficiariesFilter);

  // Fetch beneficiaries on component mount
  useEffect(() => {
    dispatch(fetchBeneficiaries());
  }, [dispatch]);

  // Check if any filter is active
  useEffect(() => {
    const hasActiveFilter = filter.name || filter.nationalId || filter.beneficiaryId || filter.phone;
    setIsSearching(!!hasActiveFilter);
  }, [filter]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    dispatch(setFilter({ [name]: value }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setIsSearching(false);
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      className="home-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Section - Only shown when not searching */}
      {!isSearching && (
        <motion.div className="welcome-section" variants={itemVariants}>
          <motion.h1 
            className="welcome-title"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            مرحباً بك في نظام إدارة دعوة الحق
          </motion.h1>
          <motion.p 
            className="welcome-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            نظام متكامل لإدارة المستفيدين والمتطوعين والمبادرات
          </motion.p>
          
          <motion.div 
            className="welcome-stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">{beneficiaries.length}</div>
                <div className="stat-label">مستفيد مسجل</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">0</div>
                <div className="stat-label">متطوع نشط</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">0</div>
                <div className="stat-label">مبادرة نشطة</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="welcome-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <motion.button
              className="btn btn-primary"
              onClick={toggleAddForm}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showAddForm ? "إلغاء" : "إضافة مستفيد جديد"}
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      {/* Search Section - Always visible */}
      <motion.div className="search-section card" variants={itemVariants}>
        <h2>{isSearching ? "نتائج البحث" : "البحث عن مستفيد"}</h2>
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="name">الاسم</label>
            <input
              type="text"
              id="name"
              name="name"
              value={filter.name}
              onChange={handleFilterChange}
              placeholder="ابحث بالاسم"
              autoComplete="off"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="nationalId">الرقم القومي</label>
            <input
              type="text"
              id="nationalId"
              name="nationalId"
              value={filter.nationalId}
              onChange={handleFilterChange}
              placeholder="ابحث بالرقم القومي"
              autoComplete="off"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="beneficiaryId">رقم المستفيد</label>
            <input
              type="text"
              id="beneficiaryId"
              name="beneficiaryId"
              value={filter.beneficiaryId}
              onChange={handleFilterChange}
              placeholder="ابحث برقم المستفيد"
              autoComplete="off"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="phone">رقم الهاتف</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={filter.phone}
              onChange={handleFilterChange}
              placeholder="ابحث برقم الهاتف"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="search-actions">
          <motion.button
            className="btn btn-secondary"
            onClick={handleClearFilters}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            مسح البحث
          </motion.button>
          
          {!isSearching && (
            <motion.button
              className="btn btn-primary"
              onClick={toggleAddForm}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showAddForm ? "إلغاء" : "إضافة مستفيد جديد"}
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Add Form - Only shown when toggled */}
      {showAddForm && (
        <motion.div
          className="add-form-container"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <BeneficiaryForm onComplete={() => setShowAddForm(false)} />
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          className="error-message"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      {/* Beneficiaries Results - Only shown when searching */}
      {isSearching && (
        <>
          {isLoading ? (
            <div className="loading-message">جاري تحميل البيانات...</div>
          ) : (
            <motion.div className="beneficiaries-grid" variants={containerVariants}>
              {beneficiaries.length > 0 ? (
                beneficiaries.map((beneficiary) => (
                  <motion.div key={beneficiary.id} variants={itemVariants}>
                    <BeneficiaryCard beneficiary={beneficiary} />
                  </motion.div>
                ))
              ) : (
                <motion.div className="no-results" variants={itemVariants}>
                  <p>لا يوجد مستفيدين متطابقين مع البحث</p>
                  <motion.button
                    className="btn btn-primary"
                    onClick={toggleAddForm}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    إضافة مستفيد جديد
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}
        </>
      )}

      {/* Photo Gallery Section - Always visible */}
      <motion.section
        className="gallery-section"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <PhotoGallery />
      </motion.section>
    </motion.div>
  );
};

export default Home;

// Sources:
// - Framer Motion: https://www.framer.com/motion/
// - Redux Toolkit: https://redux-toolkit.js.org/
