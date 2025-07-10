import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHeart, FaShare, FaBookmark, FaComment, FaThumbsUp,
  FaEye, FaDownload, FaPrint, FaExpand, FaCompress,
  FaVolumeUp, FaVolumeMute, FaPlay, FaPause, FaStar,
  FaFlag, FaLink, FaCopy, FaCheck, FaTimes
} from 'react-icons/fa';
import './InteractiveFeatures.css';

/**
 * InteractiveFeatures Component
 * 
 * مكون تفاعلي يوفر ميزات متقدمة للتفاعل مع المحتوى
 */
const InteractiveFeatures = ({ 
  contentId, 
  title = "محتوى دعوة الحق",
  showLike = true,
  showShare = true,
  showBookmark = true,
  showComment = true,
  showView = true,
  position = "floating" // floating, inline, sidebar
}) => {
  const [interactions, setInteractions] = useState({
    likes: 0,
    views: 0,
    shares: 0,
    bookmarks: 0,
    comments: []
  });

  const [userActions, setUserActions] = useState({
    liked: false,
    bookmarked: false,
    shared: false,
    viewed: false
  });

  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // تحميل البيانات من localStorage
  useEffect(() => {
    const savedInteractions = localStorage.getItem(`interactions_${contentId}`);
    const savedUserActions = localStorage.getItem(`userActions_${contentId}`);

    if (savedInteractions) {
      setInteractions(JSON.parse(savedInteractions));
    }

    if (savedUserActions) {
      setUserActions(JSON.parse(savedUserActions));
    }

    // تسجيل مشاهدة
    if (!userActions.viewed) {
      handleView();
    }
  }, [contentId]);

  // حفظ البيانات في localStorage
  const saveData = (newInteractions, newUserActions) => {
    localStorage.setItem(`interactions_${contentId}`, JSON.stringify(newInteractions));
    localStorage.setItem(`userActions_${contentId}`, JSON.stringify(newUserActions));
  };

  // معالج الإعجاب
  const handleLike = () => {
    const newLiked = !userActions.liked;
    const newInteractions = {
      ...interactions,
      likes: newLiked ? interactions.likes + 1 : interactions.likes - 1
    };
    const newUserActions = { ...userActions, liked: newLiked };

    setInteractions(newInteractions);
    setUserActions(newUserActions);
    saveData(newInteractions, newUserActions);
  };

  // معالج المشاهدة
  const handleView = () => {
    if (!userActions.viewed) {
      const newInteractions = { ...interactions, views: interactions.views + 1 };
      const newUserActions = { ...userActions, viewed: true };

      setInteractions(newInteractions);
      setUserActions(newUserActions);
      saveData(newInteractions, newUserActions);
    }
  };

  // معالج الحفظ
  const handleBookmark = () => {
    const newBookmarked = !userActions.bookmarked;
    const newInteractions = {
      ...interactions,
      bookmarks: newBookmarked ? interactions.bookmarks + 1 : interactions.bookmarks - 1
    };
    const newUserActions = { ...userActions, bookmarked: newBookmarked };

    setInteractions(newInteractions);
    setUserActions(newUserActions);
    saveData(newInteractions, newUserActions);
  };

  // معالج المشاركة
  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `${title} - دعوة الحق`;

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
      
      // تسجيل المشاركة
      if (!userActions.shared) {
        const newInteractions = { ...interactions, shares: interactions.shares + 1 };
        const newUserActions = { ...userActions, shared: true };
        setInteractions(newInteractions);
        setUserActions(newUserActions);
        saveData(newInteractions, newUserActions);
      }
    }

    setShowShareMenu(false);
  };

  // نسخ الرابط
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('فشل في نسخ الرابط:', err);
    }
  };

  // إضافة تعليق
  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        text: newComment,
        author: 'مستخدم',
        timestamp: new Date().toISOString(),
        likes: 0
      };

      const newInteractions = {
        ...interactions,
        comments: [...interactions.comments, comment]
      };

      setInteractions(newInteractions);
      saveData(newInteractions, userActions);
      setNewComment('');
      setShowCommentBox(false);
    }
  };

  // تبديل الشاشة الكاملة
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <motion.div 
      className={`interactive-features ${position}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="features-container">
        {/* أزرار التفاعل الرئيسية */}
        <div className="main-actions">
          {showLike && (
            <motion.button
              className={`action-btn like-btn ${userActions.liked ? 'active' : ''}`}
              onClick={handleLike}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={userActions.liked ? 'إلغاء الإعجاب' : 'أعجبني'}
            >
              <FaHeart />
              <span>{interactions.likes}</span>
            </motion.button>
          )}

          {showShare && (
            <motion.button
              className="action-btn share-btn"
              onClick={() => setShowShareMenu(!showShareMenu)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="مشاركة"
            >
              <FaShare />
              <span>{interactions.shares}</span>
            </motion.button>
          )}

          {showBookmark && (
            <motion.button
              className={`action-btn bookmark-btn ${userActions.bookmarked ? 'active' : ''}`}
              onClick={handleBookmark}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={userActions.bookmarked ? 'إلغاء الحفظ' : 'حفظ'}
            >
              <FaBookmark />
              <span>{interactions.bookmarks}</span>
            </motion.button>
          )}

          {showComment && (
            <motion.button
              className="action-btn comment-btn"
              onClick={() => setShowCommentBox(!showCommentBox)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="تعليق"
            >
              <FaComment />
              <span>{interactions.comments.length}</span>
            </motion.button>
          )}

          {showView && (
            <div className="view-count" title="عدد المشاهدات">
              <FaEye />
              <span>{interactions.views}</span>
            </div>
          )}
        </div>

        {/* قائمة المشاركة */}
        <AnimatePresence>
          {showShareMenu && (
            <motion.div
              className="share-menu"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <button onClick={() => handleShare('facebook')} className="share-option facebook">
                فيسبوك
              </button>
              <button onClick={() => handleShare('twitter')} className="share-option twitter">
                تويتر
              </button>
              <button onClick={() => handleShare('whatsapp')} className="share-option whatsapp">
                واتساب
              </button>
              <button onClick={copyLink} className="share-option copy">
                <FaLink />
                {copySuccess ? <FaCheck /> : 'نسخ الرابط'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* صندوق التعليقات */}
        <AnimatePresence>
          {showCommentBox && (
            <motion.div
              className="comment-box"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="comment-input">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="اكتب تعليقك هنا..."
                  rows="3"
                />
                <div className="comment-actions">
                  <button onClick={handleAddComment} className="btn btn-primary">
                    إرسال
                  </button>
                  <button onClick={() => setShowCommentBox(false)} className="btn btn-secondary">
                    إلغاء
                  </button>
                </div>
              </div>

              {/* عرض التعليقات */}
              {interactions.comments.length > 0 && (
                <div className="comments-list">
                  {interactions.comments.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-author">{comment.author}</div>
                      <div className="comment-text">{comment.text}</div>
                      <div className="comment-time">
                        {new Date(comment.timestamp).toLocaleString('ar-EG')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default InteractiveFeatures;
