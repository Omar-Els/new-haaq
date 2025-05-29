import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaQuran, FaMosque, FaHandHoldingHeart, FaUsers, FaBookOpen, FaChalkboardTeacher,
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebook, FaTwitter,
  FaInstagram, FaYoutube, FaHeart, FaGift, FaGraduationCap, FaHandsHelping,
  FaEye, FaBullseye, FaLightbulb, FaAward, FaCalendarAlt, FaChartLine
} from 'react-icons/fa';
import './AboutDaawa.css';

/**
 * AboutDaawa Component
 *
 * This component displays information about "دعوة الحق" organization,
 * its mission, vision, and activities.
 */
const AboutDaawa = () => {
  const [activeTab, setActiveTab] = useState('about');
  const [animatedStats, setAnimatedStats] = useState({
    beneficiaries: 0,
    volunteers: 0,
    projects: 0
  });
  const [hoveredCard, setHoveredCard] = useState(null);
  const [expandedActivity, setExpandedActivity] = useState(null);

  // Animated counter effect for statistics
  useEffect(() => {
    if (activeTab === 'about') {
      const targets = { beneficiaries: 5000, volunteers: 200, projects: 50 };
      const duration = 2000; // 2 seconds
      const steps = 60; // 60 steps for smooth animation
      const stepDuration = duration / steps;

      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;

        setAnimatedStats({
          beneficiaries: Math.floor(targets.beneficiaries * progress),
          volunteers: Math.floor(targets.volunteers * progress),
          projects: Math.floor(targets.projects * progress)
        });

        if (currentStep >= steps) {
          clearInterval(interval);
          setAnimatedStats(targets);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }
  }, [activeTab]);

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

  // Content for each tab
  const tabContent = {
    about: (
      <motion.div variants={itemVariants}>
        <h2>من نحن</h2>
        <p className="lead-text">
          دعوة الحق هي مؤسسة خيرية تهدف إلى نشر الوعي الديني والثقافي وتقديم المساعدات للمحتاجين في المجتمع.
        </p>
        <p>
          تأسست دعوة الحق في عام 2010 على يد مجموعة من المتطوعين المخلصين الذين يؤمنون بأهمية العمل الخيري والدعوي في خدمة المجتمع.
          منذ ذلك الحين، نمت المؤسسة لتصبح واحدة من أهم المؤسسات الخيرية في المنطقة، مع شبكة واسعة من المتطوعين والداعمين.
        </p>
        <div className="stats-container">
          <motion.div
            className="stat-card"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setHoveredCard('beneficiaries')}
            onHoverEnd={() => setHoveredCard(null)}
          >
            <motion.div
              className="stat-icon"
              animate={{ rotate: hoveredCard === 'beneficiaries' ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <FaUsers />
            </motion.div>
            <motion.div
              className="stat-number"
              key={animatedStats.beneficiaries}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {animatedStats.beneficiaries.toLocaleString()}+
            </motion.div>
            <div className="stat-label">مستفيد</div>
            <div className="stat-description">من الأسر المحتاجة</div>
          </motion.div>

          <motion.div
            className="stat-card"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setHoveredCard('volunteers')}
            onHoverEnd={() => setHoveredCard(null)}
          >
            <motion.div
              className="stat-icon"
              animate={{ rotate: hoveredCard === 'volunteers' ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <FaHandHoldingHeart />
            </motion.div>
            <motion.div
              className="stat-number"
              key={animatedStats.volunteers}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {animatedStats.volunteers.toLocaleString()}+
            </motion.div>
            <div className="stat-label">متطوع</div>
            <div className="stat-description">يعملون بإخلاص</div>
          </motion.div>

          <motion.div
            className="stat-card"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setHoveredCard('projects')}
            onHoverEnd={() => setHoveredCard(null)}
          >
            <motion.div
              className="stat-icon"
              animate={{ rotate: hoveredCard === 'projects' ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <FaMosque />
            </motion.div>
            <motion.div
              className="stat-number"
              key={animatedStats.projects}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {animatedStats.projects.toLocaleString()}+
            </motion.div>
            <div className="stat-label">مشروع</div>
            <div className="stat-description">تم تنفيذها بنجاح</div>
          </motion.div>
        </div>
      </motion.div>
    ),
    mission: (
      <motion.div variants={itemVariants}>
        <h2>رسالتنا ورؤيتنا</h2>
        <div className="mission-vision">
          <motion.div
            className="mission-card"
            whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(0,0,0,0.15)" }}
            transition={{ duration: 0.3 }}
          >
            <div className="card-icon">
              <FaBullseye />
            </div>
            <h3>رسالتنا</h3>
            <p>
              نسعى لنشر الوعي الديني والثقافي وتقديم المساعدات للمحتاجين وتنمية المجتمع من خلال برامج تعليمية وثقافية واجتماعية متنوعة.
            </p>
          </motion.div>
          <motion.div
            className="vision-card"
            whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(0,0,0,0.15)" }}
            transition={{ duration: 0.3 }}
          >
            <div className="card-icon">
              <FaEye />
            </div>
            <h3>رؤيتنا</h3>
            <p>
              أن نكون مؤسسة رائدة في العمل الخيري والدعوي، نساهم في بناء مجتمع متماسك ومتكافل، يتمتع أفراده بالوعي الديني والثقافي والاجتماعي.
            </p>
          </motion.div>
        </div>
        <motion.div
          className="values"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="values-header">
            <FaLightbulb className="values-icon" />
            <h3>قيمنا</h3>
          </div>
          <div className="values-grid">
            {[
              { icon: FaHeart, text: "الإخلاص في العمل" },
              { icon: FaAward, text: "الشفافية والمصداقية" },
              { icon: FaLightbulb, text: "التميز والإبداع" },
              { icon: FaHandsHelping, text: "التعاون والعمل الجماعي" },
              { icon: FaUsers, text: "المسؤولية المجتمعية" }
            ].map((value, index) => (
              <motion.div
                key={index}
                className="value-item"
                whileHover={{ scale: 1.05, backgroundColor: "var(--primary-color)", color: "white" }}
                transition={{ duration: 0.2 }}
              >
                <value.icon className="value-icon" />
                <span>{value.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    ),
    activities: (
      <motion.div variants={itemVariants}>
        <h2>أنشطتنا</h2>
        <div className="activities-grid">
          {[
            {
              id: 'religious',
              icon: FaQuran,
              title: 'الأنشطة الدينية',
              color: '#2ecc71',
              items: [
                'دروس تحفيظ القرآن الكريم',
                'محاضرات وندوات دينية',
                'مسابقات قرآنية',
                'برامج رمضانية',
                'دروس التفسير والحديث',
                'برامج الحج والعمرة'
              ]
            },
            {
              id: 'charity',
              icon: FaHandHoldingHeart,
              title: 'الأنشطة الخيرية',
              color: '#e74c3c',
              items: [
                'كفالة الأيتام والأرامل',
                'مساعدة الأسر المحتاجة',
                'توزيع المواد الغذائية',
                'مشاريع كسوة العيد',
                'المساعدات الطبية',
                'مشاريع الإسكان'
              ]
            },
            {
              id: 'educational',
              icon: FaGraduationCap,
              title: 'الأنشطة التعليمية',
              color: '#3498db',
              items: [
                'دورات تعليمية متنوعة',
                'برامج محو الأمية',
                'مساعدات تعليمية للطلاب',
                'تدريب وتأهيل الشباب',
                'دورات الحاسوب واللغات',
                'برامج التعليم المهني'
              ]
            },
            {
              id: 'cultural',
              icon: FaBookOpen,
              title: 'الأنشطة الثقافية',
              color: '#f39c12',
              items: [
                'معارض كتب',
                'ندوات ثقافية',
                'مسابقات ثقافية',
                'إصدارات ومطبوعات',
                'المكتبة العامة',
                'الأنشطة الفنية والأدبية'
              ]
            }
          ].map((activity, index) => (
            <motion.div
              key={activity.id}
              className={`activity-card ${expandedActivity === activity.id ? 'expanded' : ''}`}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
              style={{ '--activity-color': activity.color }}
            >
              <div className="activity-header" onClick={() =>
                setExpandedActivity(expandedActivity === activity.id ? null : activity.id)
              }>
                <motion.div
                  className="activity-icon"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <activity.icon />
                </motion.div>
                <h3>{activity.title}</h3>
                <motion.div
                  className="expand-icon"
                  animate={{ rotate: expandedActivity === activity.id ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  ▼
                </motion.div>
              </div>

              <AnimatePresence>
                <motion.div
                  className="activity-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: expandedActivity === activity.id ? 'auto' : '120px',
                    opacity: 1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <ul>
                    {activity.items.map((item, itemIndex) => (
                      <motion.li
                        key={itemIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: itemIndex * 0.1 }}
                      >
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>

              <div className="activity-stats">
                <div className="stat">
                  <FaCalendarAlt />
                  <span>نشاط أسبوعي</span>
                </div>
                <div className="stat">
                  <FaChartLine />
                  <span>نمو مستمر</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    ),
    contact: (
      <motion.div variants={itemVariants}>
        <h2>تواصل معنا</h2>
        <div className="contact-info">
          <motion.div
            className="contact-card"
            whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(0,0,0,0.15)" }}
            transition={{ duration: 0.3 }}
          >
            <div className="contact-header">
              <FaMapMarkerAlt className="contact-icon" />
              <h3>معلومات الاتصال</h3>
            </div>
            <div className="contact-details">
              <div className="contact-item">
                <FaMapMarkerAlt />
                <span>شارع الأزهر، القاهرة، مصر</span>
              </div>
              <div className="contact-item">
                <FaPhone />
                <span>01234567890</span>
              </div>
              <div className="contact-item">
                <FaEnvelope />
                <span>info@daawa-elhaq.org</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="contact-card"
            whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(0,0,0,0.15)" }}
            transition={{ duration: 0.3 }}
          >
            <div className="contact-header">
              <FaClock className="contact-icon" />
              <h3>ساعات العمل</h3>
            </div>
            <div className="working-hours">
              <div className="hour-item">
                <span className="days">السبت - الخميس</span>
                <span className="time">9:00 ص - 5:00 م</span>
              </div>
              <div className="hour-item weekend">
                <span className="days">الجمعة</span>
                <span className="time">مغلق</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="social-media"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3>تابعنا على وسائل التواصل الاجتماعي</h3>
          <div className="social-icons">
            {[
              { icon: FaFacebook, name: 'فيسبوك', color: '#1877f2', url: '#' },
              { icon: FaTwitter, name: 'تويتر', color: '#1da1f2', url: '#' },
              { icon: FaInstagram, name: 'انستغرام', color: '#e4405f', url: '#' },
              { icon: FaYoutube, name: 'يوتيوب', color: '#ff0000', url: '#' }
            ].map((social, index) => (
              <motion.a
                key={index}
                href={social.url}
                className="social-icon"
                whileHover={{
                  scale: 1.1,
                  backgroundColor: social.color,
                  color: 'white'
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{ '--social-color': social.color }}
              >
                <social.icon />
                <span>{social.name}</span>
              </motion.a>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="contact-form-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3>أرسل لنا رسالة</h3>
          <form className="contact-form">
            <div className="form-row">
              <input type="text" placeholder="الاسم" required />
              <input type="email" placeholder="البريد الإلكتروني" required />
            </div>
            <input type="text" placeholder="الموضوع" required />
            <textarea placeholder="الرسالة" rows="4" required></textarea>
            <motion.button
              type="submit"
              className="submit-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              إرسال الرسالة
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    )
  };

  return (
    <motion.div
      className="about-daawa-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="page-header" variants={itemVariants}>
        <h1>عن دعوة الحق</h1>
      </motion.div>

      <motion.div className="tabs-container" variants={itemVariants}>
        <div className="tabs">
          {[
            { id: 'about', label: 'من نحن', icon: FaUsers },
            { id: 'mission', label: 'رسالتنا ورؤيتنا', icon: FaBullseye },
            { id: 'activities', label: 'أنشطتنا', icon: FaHandsHelping },
            { id: 'contact', label: 'تواصل معنا', icon: FaPhone }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <tab.icon className="tab-icon" />
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  className="tab-indicator"
                  layoutId="activeTab"
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="tab-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {tabContent[activeTab]}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default AboutDaawa;
