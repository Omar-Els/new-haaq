import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaQuran, FaMosque, FaHandHoldingHeart, FaUsers, FaBookOpen, FaChalkboardTeacher } from 'react-icons/fa';
import './AboutDaawa.css';

/**
 * AboutDaawa Component
 *
 * This component displays information about "دعوة الحق" organization,
 * its mission, vision, and activities.
 */
const AboutDaawa = () => {
  const [activeTab, setActiveTab] = useState('about');

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
          <div className="stat-card">
            <div className="stat-icon"><FaUsers /></div>
            <div className="stat-number">5000+</div>
            <div className="stat-label">مستفيد</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><FaHandHoldingHeart /></div>
            <div className="stat-number">200+</div>
            <div className="stat-label">متطوع</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><FaMosque /></div>
            <div className="stat-number">50+</div>
            <div className="stat-label">مشروع</div>
          </div>
        </div>
      </motion.div>
    ),
    mission: (
      <motion.div variants={itemVariants}>
        <h2>رسالتنا ورؤيتنا</h2>
        <div className="mission-vision">
          <div className="mission-card">
            <h3>رسالتنا</h3>
            <p>
              نسعى لنشر الوعي الديني والثقافي وتقديم المساعدات للمحتاجين وتنمية المجتمع من خلال برامج تعليمية وثقافية واجتماعية متنوعة.
            </p>
          </div>
          <div className="vision-card">
            <h3>رؤيتنا</h3>
            <p>
              أن نكون مؤسسة رائدة في العمل الخيري والدعوي، نساهم في بناء مجتمع متماسك ومتكافل، يتمتع أفراده بالوعي الديني والثقافي والاجتماعي.
            </p>
          </div>
        </div>
        <div className="values">
          <h3>قيمنا</h3>
          <ul className="values-list">
            <li>الإخلاص في العمل</li>
            <li>الشفافية والمصداقية</li>
            <li>التميز والإبداع</li>
            <li>التعاون والعمل الجماعي</li>
            <li>المسؤولية المجتمعية</li>
          </ul>
        </div>
      </motion.div>
    ),
    activities: (
      <motion.div variants={itemVariants}>
        <h2>أنشطتنا</h2>
        <div className="activities-grid">
          <div className="activity-card">
            <div className="activity-icon"><FaQuran /></div>
            <h3>الأنشطة الدينية</h3>
            <ul>
              <li>دروس تحفيظ القرآن الكريم</li>
              <li>محاضرات وندوات دينية</li>
              <li>مسابقات قرآنية</li>
              <li>برامج رمضانية</li>
            </ul>
          </div>
          <div className="activity-card">
            <div className="activity-icon"><FaHandHoldingHeart /></div>
            <h3>الأنشطة الخيرية</h3>
            <ul>
              <li>كفالة الأيتام والأرامل</li>
              <li>مساعدة الأسر المحتاجة</li>
              <li>توزيع المواد الغذائية</li>
              <li>مشاريع كسوة العيد</li>
            </ul>
          </div>
          <div className="activity-card">
            <div className="activity-icon"><FaChalkboardTeacher /></div>
            <h3>الأنشطة التعليمية</h3>
            <ul>
              <li>دورات تعليمية متنوعة</li>
              <li>برامج محو الأمية</li>
              <li>مساعدات تعليمية للطلاب</li>
              <li>تدريب وتأهيل الشباب</li>
            </ul>
          </div>
          <div className="activity-card">
            <div className="activity-icon"><FaBookOpen /></div>
            <h3>الأنشطة الثقافية</h3>
            <ul>
              <li>معارض كتب</li>
              <li>ندوات ثقافية</li>
              <li>مسابقات ثقافية</li>
              <li>إصدارات ومطبوعات</li>
            </ul>
          </div>
        </div>
      </motion.div>
    ),
    contact: (
      <motion.div variants={itemVariants}>
        <h2>تواصل معنا</h2>
        <div className="contact-info">
          <div className="contact-card">
            <h3>معلومات الاتصال</h3>
            <p><strong>العنوان:</strong> شارع الأزهر، القاهرة، مصر</p>
            <p><strong>الهاتف:</strong> 01234567890</p>
            <p><strong>البريد الإلكتروني:</strong> info@daawa-elhaq.org</p>
          </div>
          <div className="contact-card">
            <h3>ساعات العمل</h3>
            <p>من السبت إلى الخميس</p>
            <p>9:00 صباحًا - 5:00 مساءً</p>
            <p>الجمعة: مغلق</p>
          </div>
        </div>
        <div className="social-media">
          <h3>تابعنا على وسائل التواصل الاجتماعي</h3>
          <div className="social-icons">
            <a href="#" className="social-icon">فيسبوك</a>
            <a href="#" className="social-icon">تويتر</a>
            <a href="#" className="social-icon">انستغرام</a>
            <a href="#" className="social-icon">يوتيوب</a>
          </div>
        </div>
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
          <button
            className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            من نحن
          </button>
          <button
            className={`tab-btn ${activeTab === 'mission' ? 'active' : ''}`}
            onClick={() => setActiveTab('mission')}
          >
            رسالتنا ورؤيتنا
          </button>
          <button
            className={`tab-btn ${activeTab === 'activities' ? 'active' : ''}`}
            onClick={() => setActiveTab('activities')}
          >
            أنشطتنا
          </button>
          <button
            className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            تواصل معنا
          </button>
        </div>
        <div className="tab-content">
          {tabContent[activeTab]}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AboutDaawa;
