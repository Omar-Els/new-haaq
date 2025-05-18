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
import "./Home.css";

/**
 * Home Component
 *
 * This is the main page for displaying and managing beneficiaries.
 * It includes search filters and a list of beneficiary cards.
 */
const Home = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const dispatch = useDispatch();
  const beneficiaries = useSelector(selectFilteredBeneficiaries);
  const isLoading = useSelector(selectBeneficiariesLoading);
  const error = useSelector(selectBeneficiariesError);
  const filter = useSelector(selectBeneficiariesFilter);

  // Fetch beneficiaries on component mount
  useEffect(() => {
    dispatch(fetchBeneficiaries());
  }, [dispatch]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    dispatch(setFilter({ [name]: value }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
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
      <motion.div className="page-header" variants={itemVariants}>
        <h1>المستفيدين</h1>
        <motion.button
          className="btn btn-primary"
          onClick={toggleAddForm}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {showAddForm ? "إلغاء" : "إضافة مستفيد جديد"}
        </motion.button>
      </motion.div>

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

      <motion.div className="filters-container card" variants={itemVariants}>
        <h2>البحث عن مستفيد</h2>
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

        <motion.button
          className="btn btn-secondary"
          onClick={handleClearFilters}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          مسح البحث
        </motion.button>
      </motion.div>

      {error && (
        <motion.div
          className="error-message"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

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
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Home;

// Sources:
// - Framer Motion: https://www.framer.com/motion/
// - Redux Toolkit: https://redux-toolkit.js.org/
