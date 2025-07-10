import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import {
  FaQuran, FaHandHoldingHeart, FaUsers, FaPhone, FaEnvelope, FaMapMarkerAlt, 
  FaClock, FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaHeart, 
  FaGraduationCap, FaHandsHelping, FaEye, FaBullseye, FaCheck, FaRocket, 
  FaArrowRight, FaArrowLeft, FaWhatsapp, FaTelegram
} from 'react-icons/fa';

import './AboutDaawa.css';

/**
 * AboutDaawa Component - Redesigned
 * 
 * A modern, dynamic page showcasing "دعوة الحق" organization
 * with real-time data integration and interactive features
 */

// Stable selectors to prevent unnecessary re-renders
const selectBeneficiaries = state => state.beneficiaries?.beneficiaries || [];
const selectVolunteers = state => state.volunteers?.volunteers || [];
const selectInitiatives = state => state.initiatives?.initiatives || [];
const selectTransactions = state => state.finance?.transactions || [];

// Memoized stats selector
const selectStats = (() => {
  let lastState = null;
  let lastResult = null;
  
  return (state) => {
    const beneficiaries = selectBeneficiaries(state);
    const volunteers = selectVolunteers(state);
    const initiatives = selectInitiatives(state);
    const transactions = selectTransactions(state);
    
    // Check if state has actually changed
    const currentState = {
      beneficiariesLength: beneficiaries.length,
      volunteersLength: volunteers.length,
      initiativesLength: initiatives.length,
      transactions: transactions
    };
    
    if (lastState && 
        lastState.beneficiariesLength === currentState.beneficiariesLength &&
        lastState.volunteersLength === currentState.volunteersLength &&
        lastState.initiativesLength === currentState.initiativesLength &&
        lastState.transactions === currentState.transactions) {
      return lastResult;
    }
    
    lastState = currentState;
    lastResult = {
      beneficiaries: beneficiaries.length,
      volunteers: volunteers.length,
      initiatives: initiatives.length,
      totalDonations: transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0),
      totalExpenses: transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
    };
    
    return lastResult;
  };
})();

const AboutDaawa = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [showStats, setShowStats] = useState(false);

  
  // Get real statistics using memoized selector
  const realStats = useSelector(selectStats);

  // Main sections data - memoized to prevent recreation on every render
  const sections = useMemo(() => [
    {
      id: 'overview',
      title: 'نظرة عامة',
      icon: FaEye,
      color: '#3498db',
      content: {
        description: 'دعوة الحق مؤسسة خيرية رائدة تأسست عام 2010، تهدف إلى نشر الوعي الديني والثقافي وتقديم المساعدات الإنسانية للمحتاجين.',
        highlights: [
          'مؤسسة مرخصة ومعتمدة رسمياً',
          'شبكة واسعة من المتطوعين والداعمين',
          'برامج متنوعة ومستدامة',
          'شفافية كاملة في جميع العمليات'
        ]
      }
    },
    {
      id: 'mission',
      title: 'رسالتنا',
      icon: FaBullseye,
      color: '#e74c3c',
      content: {
        description: 'نسعى إلى بناء مجتمع إسلامي متكافل ومتضامن من خلال نشر القيم الإسلامية وتقديم المساعدات الإنسانية.',
        goals: [
          'تقديم المساعدات المادية والمعنوية للمحتاجين',
          'نشر الوعي الديني والثقافي في المجتمع',
          'تعزيز روح التكافل والتضامن الاجتماعي',
          'دعم التعليم والصحة للأسر المحتاجة'
        ]
      }
    },
    {
      id: 'vision',
      title: 'رؤيتنا',
      icon: FaRocket,
      color: '#2ecc71',
      content: {
        description: 'نسعى لأن نكون مؤسسة رائدة في العمل الخيري والدعوي، تساهم في بناء مجتمع إسلامي متطور ومتضامن.',
        objectives: [
          'الوصول إلى أكبر عدد من المستفيدين',
          'تطوير برامج مبتكرة في العمل الخيري',
          'بناء شراكات استراتيجية مع المؤسسات الأخرى',
          'تحقيق الاستدامة في المشاريع الخيرية'
        ]
      }
    },
    {
      id: 'activities',
      title: 'أنشطتنا',
      icon: FaHandsHelping,
      color: '#f39c12',
      content: {
        description: 'نقدم مجموعة متنوعة من الأنشطة والبرامج التي تغطي مختلف احتياجات المجتمع.',
        activities: [
          {
            title: 'المساعدات الإنسانية',
            description: 'تقديم المساعدات المادية والغذائية للأسر المحتاجة',
            icon: FaHandHoldingHeart,
            color: '#e74c3c'
          },
          {
            title: 'البرامج التعليمية',
            description: 'دعم التعليم وبرامج محو الأمية والتدريب المهني',
            icon: FaGraduationCap,
            color: '#3498db'
          },
          {
            title: 'الرعاية الصحية',
            description: 'تقديم الخدمات الطبية والرعاية الصحية للمحتاجين',
            icon: FaHeart,
            color: '#2ecc71'
          },
          {
            title: 'البرامج الدينية',
            description: 'حلقات تحفيظ القرآن الكريم والدروس الدينية',
            icon: FaQuran,
            color: '#9b59b6'
          },
          {
            title: 'المشاريع التنموية',
            description: 'إقامة مشاريع صغيرة ومتوسطة للأسر المحتاجة',
            icon: FaHandsHelping,
            color: '#f39c12'
          },
          {
            title: 'التوعية المجتمعية',
            description: 'برامج التوعية الصحية والاجتماعية والثقافية',
            icon: FaUsers,
            color: '#1abc9c'
          }
        ]
      }
    }
  ], []);

  // Auto-play sections
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSection((prev) => (prev + 1) % sections.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, sections.length]);

  // Show stats when component mounts
  useEffect(() => {
    const timer = setTimeout(() => setShowStats(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const nextSection = useCallback(() => {
    setCurrentSection((prev) => (prev + 1) % sections.length);
    setIsAutoPlaying(false);
  }, [sections.length]);

  const prevSection = useCallback(() => {
    setCurrentSection((prev) => (prev - 1 + sections.length) % sections.length);
    setIsAutoPlaying(false);
  }, [sections.length]);

  // معالجات أزرار التواصل الاجتماعي
  const handleSocialClick = useCallback((platform) => {
    const urls = {
      facebook: 'https://facebook.com/dawaaelhaq',
      twitter: 'https://twitter.com/dawaaelhaq',
      instagram: 'https://instagram.com/dawaaelhaq',
      youtube: 'https://youtube.com/@dawaaelhaq',
      whatsapp: 'https://wa.me/201234567890',
      telegram: 'https://t.me/dawaaelhaq'
    };
    
    const url = urls[platform];
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, []);

  const goToSection = useCallback((index) => {
    setCurrentSection(index);
    setIsAutoPlaying(false);
  }, []);

  return (
    <div className="about-daawa-new">
      {/* Hero Section */}
      <motion.div 
        className="hero-section"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-content">
          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            دعوة الحق
          </motion.h1>
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            مؤسسة خيرية رائدة في العمل الدعوي والإنساني
          </motion.p>
          <motion.div 
            className="hero-stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            {showStats && (
              <div className="stats-grid">
                <motion.div 
                  className="stat-item"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
                >
                  <div className="stat-number">{realStats.beneficiaries}</div>
                  <div className="stat-label">مستفيد</div>
                </motion.div>
                <motion.div 
                  className="stat-item"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.4, type: "spring", stiffness: 200 }}
                >
                  <div className="stat-number">{realStats.volunteers}</div>
                  <div className="stat-label">متطوع</div>
                </motion.div>
                <motion.div 
                  className="stat-item"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.6, type: "spring", stiffness: 200 }}
                >
                  <div className="stat-number">{realStats.initiatives}</div>
                  <div className="stat-label">مبادرة</div>
                </motion.div>
                <motion.div 
                  className="stat-item"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.8, type: "spring", stiffness: 200 }}
                >
                  <div className="stat-number">{realStats.totalDonations.toLocaleString()}</div>
                  <div className="stat-label">جنيه تبرعات</div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Interactive Sections */}
      <div className="sections-container">
        {/* Section Navigation */}
        <motion.div 
          className="section-nav"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <button 
            className="nav-btn prev-btn"
            onClick={prevSection}
            aria-label="القسم السابق"
          >
            <FaArrowRight />
          </button>
          
          <div className="section-indicators">
            {sections.map((section, index) => (
              <button
                key={section.id}
                className={`indicator ${currentSection === index ? 'active' : ''}`}
                onClick={() => goToSection(index)}
                aria-label={`انتقل إلى ${section.title}`}
              >
                {React.createElement(section.icon)}
                <span>{section.title}</span>
              </button>
            ))}
          </div>

          <button 
            className="nav-btn next-btn"
            onClick={nextSection}
            aria-label="القسم التالي"
          >
            <FaArrowLeft />
          </button>
        </motion.div>

        {/* Section Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            className="section-content"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
          >
            <div className="section-header">
              <div 
                className="section-icon"
                style={{ color: sections[currentSection].color }}
              >
                {React.createElement(sections[currentSection].icon)}
              </div>
              <h2>{sections[currentSection].title}</h2>
            </div>

            <div className="section-body">
              {sections[currentSection].id === 'overview' && (
                <div className="overview-content">
                  <p className="section-description">
                    {sections[currentSection].content.description}
                  </p>
                  <div className="highlights-grid">
                    {sections[currentSection].content.highlights.map((highlight, index) => (
                      <motion.div
                        key={index}
                        className="highlight-item"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <FaCheck className="check-icon" />
                        <span>{highlight}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {(sections[currentSection].id === 'mission' || sections[currentSection].id === 'vision') && (
                <div className="mission-vision-content">
                  <p className="section-description">
                    {sections[currentSection].content.description}
                  </p>
                  <div className="goals-grid">
                    {(sections[currentSection].content.goals || sections[currentSection].content.objectives).map((goal, index) => (
                      <motion.div
                        key={index}
                        className="goal-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{ borderLeftColor: sections[currentSection].color }}
                      >
                        <div className="goal-number">{index + 1}</div>
                        <span>{goal}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {sections[currentSection].id === 'activities' && (
                <div className="activities-content">
                  <p className="section-description">
                    {sections[currentSection].content.description}
                  </p>
                  <div className="activities-grid">
                    {sections[currentSection].content.activities.map((activity, index) => (
                      <motion.div
                        key={index}
                        className="activity-card"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        style={{ borderTopColor: activity.color }}
                      >
                        <div 
                          className="activity-icon"
                          style={{ color: activity.color }}
                        >
                          {React.createElement(activity.icon)}
                        </div>
                        <h3>{activity.title}</h3>
                        <p>{activity.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Contact Section */}
      <motion.div 
        className="contact-section"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <div className="contact-container">
          <div className="contact-info">
            <h3>تواصل معنا</h3>
            <div className="contact-items">
              <div className="contact-item">
                <FaPhone />
                <div>
                  <strong>الهاتف:</strong>
                  <p>+20 123 456 7890</p>
                </div>
              </div>
              <div className="contact-item">
                <FaEnvelope />
                <div>
                  <strong>البريد الإلكتروني:</strong>
                  <p>info@dawaaelhaq.org</p>
                </div>
              </div>
              <div className="contact-item">
                <FaMapMarkerAlt />
                <div>
                  <strong>العنوان:</strong>
                  <p>القاهرة، مصر</p>
                </div>
              </div>
              <div className="contact-item">
                <FaClock />
                <div>
                  <strong>ساعات العمل:</strong>
                  <p>الأحد - الخميس: 9:00 ص - 5:00 م</p>
                </div>
              </div>
            </div>
          </div>

          <div className="social-media">
            <h3>تابعنا على وسائل التواصل</h3>
            <div className="social-icons">
              {[
                { icon: FaFacebook, name: 'فيسبوك', color: '#1877f2', platform: 'facebook' },
                { icon: FaTwitter, name: 'تويتر', color: '#1da1f2', platform: 'twitter' },
                { icon: FaInstagram, name: 'انستغرام', color: '#e4405f', platform: 'instagram' },
                { icon: FaYoutube, name: 'يوتيوب', color: '#ff0000', platform: 'youtube' },
                { icon: FaWhatsapp, name: 'واتساب', color: '#25d366', platform: 'whatsapp' },
                { icon: FaTelegram, name: 'تليجرام', color: '#0088cc', platform: 'telegram' }
              ].map((social, index) => (
                <motion.button
                  key={index}
                  className="social-btn"
                  style={{ '--social-color': social.color }}
                  whileHover={{ scale: 1.1, backgroundColor: social.color }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  onClick={() => handleSocialClick(social.platform)}
                  aria-label={`تابعنا على ${social.name}`}
                >
                  {React.createElement(social.icon)}
                  <span>{social.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutDaawa;
