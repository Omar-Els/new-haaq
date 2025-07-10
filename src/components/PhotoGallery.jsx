import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaImages, FaSearch, FaTimes, FaChevronLeft, FaChevronRight,
  FaExpand, FaDownload, FaHeart, FaShare, FaCalendarAlt,
  FaMapMarkerAlt, FaUser
} from 'react-icons/fa';
import './PhotoGallery.css';

/**
 * PhotoGallery Component
 * 
 * معرض الصور مع إمكانية البحث عن المستفيدين
 */
const PhotoGallery = () => {
  // جلب الصور من localStorage بدلاً من بيانات وهمية
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const savedImages = JSON.parse(localStorage.getItem('gallery_images') || '[]');
    setPhotos(savedImages);
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  // فلترة الصور حسب البحث
  const filteredPhotos = photos.filter(photo =>
    (photo.beneficiaryName && photo.beneficiaryName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (photo.title && photo.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (photo.description && photo.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (photo.location && photo.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // فتح الصورة في عارض كبير
  const openLightbox = (photo, index) => {
    setSelectedPhoto(photo);
    setCurrentPhotoIndex(index);
    setShowLightbox(true);
  };

  // إغلاق عارض الصور
  const closeLightbox = () => {
    setShowLightbox(false);
    setSelectedPhoto(null);
  };

  // الانتقال للصورة التالية
  const nextPhoto = () => {
    const nextIndex = (currentPhotoIndex + 1) % filteredPhotos.length;
    setCurrentPhotoIndex(nextIndex);
    setSelectedPhoto(filteredPhotos[nextIndex]);
  };

  // الانتقال للصورة السابقة
  const prevPhoto = () => {
    const prevIndex = currentPhotoIndex === 0 ? filteredPhotos.length - 1 : currentPhotoIndex - 1;
    setCurrentPhotoIndex(prevIndex);
    setSelectedPhoto(filteredPhotos[prevIndex]);
  };

  // مشاركة الصورة
  const sharePhoto = (photo) => {
    if (navigator.share) {
      navigator.share({
        title: photo.title,
        text: photo.description,
        url: window.location.href
      });
    } else {
      // نسخ الرابط للحافظة
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ الرابط للحافظة');
    }
  };

  return (
    <div className="photo-gallery">
      {/* Header */}
      <div className="gallery-header">
        <div className="header-content">
          <FaImages className="header-icon" />
          <h2>معرض الصور</h2>
          <p>صور من أنشطة دعوة الحق وخدماتها للمجتمع</p>
        </div>

        {/* Search Box */}
        <div className="search-container">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="ابحث عن مستفيد أو نشاط..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm('')}
              >
                <FaTimes />
              </button>
            )}
          </div>
          <div className="search-results">
            {searchTerm && (
              <span>{filteredPhotos.length} نتيجة من أصل {photos.length}</span>
            )}
          </div>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="photos-grid">
        <AnimatePresence>
          {filteredPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              className="photo-card"
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -5 }}
              onClick={() => openLightbox(photo, index)}
            >
              <div className="photo-container">
                <img
                  src={photo.imageData || photo.url}
                  alt={photo.title}
                  onClick={() => openLightbox(photo, index)}
                  className="gallery-photo"
                  style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px' }}
                />
                <div className="photo-overlay">
                  <FaExpand className="expand-icon" />
                </div>
              </div>
              
              <div className="photo-info">
                <h3>{photo.title}</h3>
                <p className="photo-description">{photo.description}</p>
                
                <div className="photo-meta">
                  <div className="meta-item">
                    <FaUser />
                    <span>{photo.beneficiaryName}</span>
                  </div>
                  <div className="meta-item">
                    <FaMapMarkerAlt />
                    <span>{photo.location}</span>
                  </div>
                  <div className="meta-item">
                    <FaCalendarAlt />
                    <span>{new Date(photo.date).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>

                <div className="photo-actions">
                  <button className="action-btn like-btn">
                    <FaHeart />
                    <span>{photo.likes}</span>
                  </button>
                  <button 
                    className="action-btn share-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      sharePhoto(photo);
                    }}
                  >
                    <FaShare />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredPhotos.length === 0 && searchTerm && (
        <div className="empty-state">
          <FaSearch className="empty-icon" />
          <h3>لا توجد نتائج</h3>
          <p>لم نجد أي صور تطابق بحثك عن "{searchTerm}"</p>
          <button
            className="btn btn-primary"
            onClick={() => setSearchTerm('')}
          >
            مسح البحث
          </button>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {showLightbox && selectedPhoto && (
          <motion.div
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <motion.div
              className="lightbox-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-btn" onClick={closeLightbox}>
                <FaTimes />
              </button>

              <div className="lightbox-image">
                <img src={selectedPhoto.url} alt={selectedPhoto.title} />
                
                {filteredPhotos.length > 1 && (
                  <>
                    <button className="nav-btn prev-btn" onClick={prevPhoto}>
                      <FaChevronRight />
                    </button>
                    <button className="nav-btn next-btn" onClick={nextPhoto}>
                      <FaChevronLeft />
                    </button>
                  </>
                )}
              </div>

              <div className="lightbox-info">
                <h3>{selectedPhoto.title}</h3>
                <p>{selectedPhoto.description}</p>
                
                <div className="lightbox-meta">
                  <div className="meta-row">
                    <FaUser />
                    <span>المستفيد: {selectedPhoto.beneficiaryName}</span>
                  </div>
                  <div className="meta-row">
                    <FaMapMarkerAlt />
                    <span>المكان: {selectedPhoto.location}</span>
                  </div>
                  <div className="meta-row">
                    <FaCalendarAlt />
                    <span>التاريخ: {new Date(selectedPhoto.date).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>

                <div className="lightbox-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => sharePhoto(selectedPhoto)}
                  >
                    <FaShare />
                    مشاركة
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => window.open(selectedPhoto.url, '_blank')}
                  >
                    <FaDownload />
                    تحميل
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotoGallery;
