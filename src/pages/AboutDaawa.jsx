import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaQuran, FaMosque, FaHandHoldingHeart, FaUsers, FaBookOpen, FaChalkboardTeacher,
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebook, FaTwitter,
  FaInstagram, FaYoutube, FaHeart, FaGift, FaGraduationCap, FaHandsHelping,
  FaEye, FaBullseye, FaLightbulb, FaAward, FaCalendarAlt, FaChartLine,
  FaExternalLinkAlt, FaDownload, FaShare, FaPrint, FaWhatsapp, FaTelegram,
  FaLinkedin, FaGlobe, FaNewspaper, FaVideo, FaImages, FaFileAlt,
  FaDonate, FaUserPlus, FaHandshake, FaHistory, FaCertificate, FaStar,
  FaCheck
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
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [newsItems, setNewsItems] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Load news items
  useEffect(() => {
    const mockNews = [
      {
        id: 1,
        title: 'إطلاق مبادرة كسوة الشتاء 2024',
        date: '2024-01-15',
        summary: 'بدء توزيع الملابس الشتوية على الأسر المحتاجة',
        image: '/images/winter-clothes.jpg',
        link: '#news-1'
      },
      {
        id: 2,
        title: 'افتتاح مركز جديد لتحفيظ القرآن',
        date: '2024-01-10',
        summary: 'افتتاح مركز تحفيظ القرآن الكريم في منطقة المعادي',
        image: '/images/quran-center.jpg',
        link: '#news-2'
      },
      {
        id: 3,
        title: 'حملة التبرع بالدم الشهرية',
        date: '2024-01-05',
        summary: 'نجاح حملة التبرع بالدم وجمع 200 كيس دم',
        image: '/images/blood-donation.jpg',
        link: '#news-3'
      }
    ];
    setNewsItems(mockNews);
  }, []);

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

  // Handle contact form submission
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setSubmitMessage('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.');
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);

      // Clear message after 5 seconds
      setTimeout(() => setSubmitMessage(''), 5000);
    }, 2000);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Share functionality
  const handleShare = (platform) => {
    const url = window.location.href;
    const title = 'دعوة الحق - مؤسسة خيرية';
    const text = 'تعرف على مؤسسة دعوة الحق وأنشطتها الخيرية والدعوية';

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
    setShowShareMenu(false);
  };

  // Print page
  const handlePrint = () => {
    window.print();
  };

  // Download page as PDF (mock function)
  const handleDownload = () => {
    alert('سيتم إضافة ميزة تحميل PDF قريباً');
  };

  // Format time for display
  const formatTime = (date) => {
    return date.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Check if organization is currently open
  const isOpen = () => {
    const day = currentTime.getDay();
    const hour = currentTime.getHours();

    // Friday is closed (day 5), Saturday to Thursday 9-17
    if (day === 5) return false;
    return hour >= 9 && hour < 17;
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

        {/* Latest News Section */}
        <motion.div
          className="news-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="section-header">
            <FaNewspaper className="section-icon" />
            <h3>آخر الأخبار</h3>
          </div>
          <div className="news-grid">
            {newsItems.map((news, index) => (
              <motion.div
                key={news.id}
                className="news-card"
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ duration: 0.3 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="news-date">
                  <FaCalendarAlt />
                  <span>{new Date(news.date).toLocaleDateString('ar-EG')}</span>
                </div>
                <h4>{news.title}</h4>
                <p>{news.summary}</p>
                <motion.a
                  href={news.link}
                  className="news-link"
                  whileHover={{ scale: 1.05 }}
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`سيتم فتح الخبر: ${news.title}`);
                  }}
                >
                  اقرأ المزيد <FaExternalLinkAlt />
                </motion.a>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="quick-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="section-header">
            <FaHandshake className="section-icon" />
            <h3>كيف يمكنك المساعدة</h3>
          </div>
          <div className="actions-grid">
            <motion.button
              className="action-btn donate-btn"
              whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(231, 76, 60, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => alert('سيتم توجيهك لصفحة التبرع')}
            >
              <FaDonate />
              <span>تبرع الآن</span>
            </motion.button>
            <motion.button
              className="action-btn volunteer-btn"
              whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(52, 152, 219, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => alert('سيتم توجيهك لصفحة التطوع')}
            >
              <FaUserPlus />
              <span>انضم كمتطوع</span>
            </motion.button>
            <motion.button
              className="action-btn gallery-btn"
              whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(46, 204, 113, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowGallery(true)}
            >
              <FaImages />
              <span>معرض الصور</span>
            </motion.button>
          </div>
        </motion.div>
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
              <motion.button
                className="activity-header"
                onClick={() =>
                  setExpandedActivity(expandedActivity === activity.id ? null : activity.id)
                }
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label={`${expandedActivity === activity.id ? 'إخفاء' : 'عرض'} تفاصيل ${activity.title}`}
                aria-expanded={expandedActivity === activity.id}
              >
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
              </motion.button>

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
              <motion.button
                className="contact-item clickable"
                whileHover={{ scale: 1.02, backgroundColor: "rgba(52, 152, 219, 0.1)" }}
                onClick={() => window.open('https://maps.google.com/?q=شارع الأزهر، القاهرة، مصر', '_blank')}
                aria-label="فتح الموقع في خرائط جوجل"
              >
                <FaMapMarkerAlt />
                <span>شارع الأزهر، القاهرة، مصر</span>
                <FaExternalLinkAlt className="external-icon" />
              </motion.button>
              <motion.button
                className="contact-item clickable"
                whileHover={{ scale: 1.02, backgroundColor: "rgba(46, 204, 113, 0.1)" }}
                onClick={() => window.open('tel:01234567890', '_self')}
                aria-label="الاتصال بالرقم 01234567890"
              >
                <FaPhone />
                <span>01234567890</span>
                <FaExternalLinkAlt className="external-icon" />
              </motion.button>
              <motion.button
                className="contact-item clickable"
                whileHover={{ scale: 1.02, backgroundColor: "rgba(231, 76, 60, 0.1)" }}
                onClick={() => window.open('mailto:info@daawa-elhaq.org', '_self')}
                aria-label="إرسال بريد إلكتروني إلى info@daawa-elhaq.org"
              >
                <FaEnvelope />
                <span>info@daawa-elhaq.org</span>
                <FaExternalLinkAlt className="external-icon" />
              </motion.button>
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
              <div className="current-status">
                <div className={`status-indicator ${isOpen() ? 'open' : 'closed'}`}>
                  <div className="status-dot"></div>
                  <span>{isOpen() ? 'مفتوح الآن' : 'مغلق الآن'}</span>
                </div>
                <div className="current-time">
                  <FaClock />
                  <span>{formatTime(currentTime)}</span>
                </div>
              </div>
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
              {
                icon: FaFacebook,
                name: 'فيسبوك',
                color: '#1877f2',
                url: 'https://facebook.com/daawa.elhaq',
                followers: '15K'
              },
              {
                icon: FaTwitter,
                name: 'تويتر',
                color: '#1da1f2',
                url: 'https://twitter.com/daawa_elhaq',
                followers: '8K'
              },
              {
                icon: FaInstagram,
                name: 'انستغرام',
                color: '#e4405f',
                url: 'https://instagram.com/daawa.elhaq',
                followers: '12K'
              },
              {
                icon: FaYoutube,
                name: 'يوتيوب',
                color: '#ff0000',
                url: 'https://youtube.com/@daawa-elhaq',
                followers: '25K'
              },
              {
                icon: FaWhatsapp,
                name: 'واتساب',
                color: '#25d366',
                url: 'https://wa.me/201234567890',
                followers: 'مباشر'
              },
              {
                icon: FaTelegram,
                name: 'تليجرام',
                color: '#0088cc',
                url: 'https://t.me/daawa_elhaq',
                followers: '5K'
              }
            ].map((social, index) => (
              <motion.a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                whileHover={{
                  scale: 1.1,
                  backgroundColor: social.color,
                  color: 'white',
                  boxShadow: `0 8px 25px ${social.color}40`
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{ '--social-color': social.color }}
                onClick={(e) => {
                  // For demo purposes, show alert instead of opening real links
                  e.preventDefault();
                  alert(`سيتم فتح ${social.name}: ${social.url}`);
                }}
              >
                <social.icon />
                <div className="social-info">
                  <span className="social-name">{social.name}</span>
                  <span className="social-followers">{social.followers}</span>
                </div>
                <FaExternalLinkAlt className="external-icon" />
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
          {submitMessage && (
            <motion.div
              className="submit-message success"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <FaCheck />
              <span>{submitMessage}</span>
            </motion.div>
          )}
          <form className="contact-form" onSubmit={handleContactSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contact-name">الاسم</label>
                <input
                  type="text"
                  id="contact-name"
                  name="name"
                  value={contactForm.name}
                  onChange={handleInputChange}
                  placeholder="أدخل اسمك الكامل"
                  required
                  autoComplete="name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="contact-email">البريد الإلكتروني</label>
                <input
                  type="email"
                  id="contact-email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleInputChange}
                  placeholder="أدخل بريدك الإلكتروني"
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="contact-subject">الموضوع</label>
              <input
                type="text"
                id="contact-subject"
                name="subject"
                value={contactForm.subject}
                onChange={handleInputChange}
                placeholder="موضوع الرسالة"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact-message">الرسالة</label>
              <textarea
                id="contact-message"
                name="message"
                value={contactForm.message}
                onChange={handleInputChange}
                placeholder="اكتب رسالتك هنا..."
                rows="4"
                required
              ></textarea>
            </div>
            <motion.button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <FaEnvelope />
                  إرسال الرسالة
                </>
              )}
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
      {/* Floating Action Toolbar */}
      <motion.div
        className="floating-toolbar"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        <motion.button
          className="toolbar-btn share-btn"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowShareMenu(!showShareMenu)}
          title="مشاركة الصفحة"
          aria-label="مشاركة الصفحة على وسائل التواصل الاجتماعي"
          aria-expanded={showShareMenu}
        >
          <FaShare />
        </motion.button>

        <AnimatePresence>
          {showShareMenu && (
            <motion.div
              className="share-menu"
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              {[
                { platform: 'facebook', icon: FaFacebook, color: '#1877f2' },
                { platform: 'twitter', icon: FaTwitter, color: '#1da1f2' },
                { platform: 'whatsapp', icon: FaWhatsapp, color: '#25d366' },
                { platform: 'telegram', icon: FaTelegram, color: '#0088cc' },
                { platform: 'linkedin', icon: FaLinkedin, color: '#0077b5' }
              ].map((item) => (
                <motion.button
                  key={item.platform}
                  className="share-option"
                  style={{ '--share-color': item.color }}
                  whileHover={{ scale: 1.1, backgroundColor: item.color, color: 'white' }}
                  onClick={() => handleShare(item.platform)}
                  title={`مشاركة على ${item.platform}`}
                  aria-label={`مشاركة الصفحة على ${item.platform}`}
                >
                  <item.icon />
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          className="toolbar-btn print-btn"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handlePrint}
          title="طباعة الصفحة"
          aria-label="طباعة محتوى الصفحة"
        >
          <FaPrint />
        </motion.button>

        <motion.button
          className="toolbar-btn download-btn"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleDownload}
          title="تحميل كـ PDF"
          aria-label="تحميل الصفحة كملف PDF"
        >
          <FaDownload />
        </motion.button>
      </motion.div>

      <motion.div className="page-header" variants={itemVariants}>
        <h1>عن دعوة الحق</h1>
        <p>تعرف على مؤسستنا ورسالتها وأنشطتها المتنوعة</p>
      </motion.div>

      <motion.div className="tabs-container" variants={itemVariants}>
        <div className="tabs" role="tablist" aria-label="أقسام صفحة عن دعوة الحق">
          {[
            { id: 'about', label: 'من نحن', icon: FaUsers },
            { id: 'mission', label: 'رسالتنا ورؤيتنا', icon: FaBullseye },
            { id: 'activities', label: 'أنشطتنا', icon: FaHandsHelping },
            { id: 'contact', label: 'تواصل معنا', icon: FaPhone }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              id={`tab-${tab.id}`}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              aria-label={`انتقل إلى تبويب ${tab.label}`}
              aria-selected={activeTab === tab.id}
              role="tab"
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
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
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
