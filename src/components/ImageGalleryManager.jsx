import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaImages, FaPlus, FaTrash, FaEdit, FaEye, FaTimes,
  FaUpload, FaDownload, FaShare, FaHeart, FaComment,
  FaCalendarAlt, FaMapMarkerAlt, FaUser, FaTag
} from 'react-icons/fa';
import './ImageGalleryManager.css';
import { useSelector } from 'react-redux';
import { selectAllBeneficiaries } from '../features/beneficiaries/beneficiariesSlice';
import { selectAllVolunteers } from '../features/volunteers/volunteersSlice';

/**
 * ImageGalleryManager Component
 * 
 * مكون إدارة معرض الصور مع إمكانية الربط بالمستفيدين والمتطوعين
 */
const ImageGalleryManager = ({ 
  entityType = 'beneficiary', // 'beneficiary' or 'volunteer'
  entityId,
  entityName,
  onClose 
}) => {
  const [images, setImages] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [newImage, setNewImage] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    tags: '',
    file: null,
    preview: null
  });
  const [editImage, setEditImage] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [tab, setTab] = useState('beneficiary');
  const [selectedId, setSelectedId] = useState('');
  const [selectedName, setSelectedName] = useState('');

  const beneficiaries = useSelector(selectAllBeneficiaries);
  const volunteers = useSelector(selectAllVolunteers);

  useEffect(() => {
    if (tab === 'beneficiary' && beneficiaries.length > 0) {
      if (!selectedId) {
        setSelectedId(beneficiaries[0].id);
        setSelectedName(beneficiaries[0].name);
      } else {
        const b = beneficiaries.find(b => b.id === selectedId);
        if (b) setSelectedName(b.name);
      }
    } else if (tab === 'volunteer' && volunteers.length > 0) {
      if (!selectedId) {
        setSelectedId(volunteers[0].id);
        setSelectedName(volunteers[0].name);
      } else {
        const v = volunteers.find(v => v.id === selectedId);
        if (v) setSelectedName(v.name);
      }
    }
  }, [tab, selectedId, beneficiaries, volunteers]);

  entityType = tab;
  entityId = selectedId;
  entityName = selectedName;

  // تحميل الصور المحفوظة
  useEffect(() => {
    loadImages();
  }, [entityId, entityType]);

  // تحميل الصور من localStorage
  const loadImages = () => {
    try {
      const savedImages = JSON.parse(localStorage.getItem('gallery_images') || '[]');
      const entityImages = savedImages.filter(img => 
        img.entityId === entityId && img.entityType === entityType
      );
      setImages(entityImages);
    } catch (error) {
      console.error('خطأ في تحميل الصور:', error);
    }
  };

  // حفظ الصور في localStorage
  const saveImages = (updatedImages) => {
    try {
      const allImages = JSON.parse(localStorage.getItem('gallery_images') || '[]');
      const otherImages = allImages.filter(img => 
        !(img.entityId === entityId && img.entityType === entityType)
      );
      const newAllImages = [...otherImages, ...updatedImages];
      localStorage.setItem('gallery_images', JSON.stringify(newAllImages));
    } catch (error) {
      console.error('خطأ في حفظ الصور:', error);
    }
  };

  // معالج رفع الصورة
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setNewImage(prev => ({
          ...prev,
          file: file,
          preview: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // إضافة صورة جديدة
  const handleAddImage = () => {
    if (!newImage.file || !newImage.title) {
      alert('يرجى اختيار صورة وإدخال عنوان');
      return;
    }

    const imageData = {
      id: Date.now().toString(),
      entityId,
      entityType,
      entityName,
      title: newImage.title,
      description: newImage.description,
      category: newImage.category,
      location: newImage.location,
      date: newImage.date,
      tags: newImage.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      imageData: newImage.preview,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: []
    };

    const updatedImages = [...images, imageData];
    setImages(updatedImages);
    saveImages(updatedImages);

    // إعادة تعيين النموذج
    setNewImage({
      title: '',
      description: '',
      category: '',
      location: '',
      date: new Date().toISOString().split('T')[0],
      tags: '',
      file: null,
      preview: null
    });
    setShowAddModal(false);
  };

  // حذف صورة
  const handleDeleteImage = (imageId) => {
    if (confirm('هل أنت متأكد من حذف هذه الصورة؟')) {
      const updatedImages = images.filter(img => img.id !== imageId);
      setImages(updatedImages);
      saveImages(updatedImages);
    }
  };

  // إعجاب بالصورة
  const handleLikeImage = (imageId) => {
    const updatedImages = images.map(img => 
      img.id === imageId 
        ? { ...img, likes: img.likes + 1 }
        : img
    );
    setImages(updatedImages);
    saveImages(updatedImages);
  };

  // فتح الصورة في عارض كبير
  const openImageModal = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  // تصدير الصور
  const handleExportImages = () => {
    const dataStr = JSON.stringify(images, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${entityType}_${entityId}_images.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // دالة فتح نموذج التعديل:
  const openEditModal = (image) => {
    setEditImage({ ...image, tags: image.tags ? image.tags.join(', ') : '' });
    setShowEditModal(true);
  };

  // دالة حفظ التعديلات:
  const handleEditImage = () => {
    if (!editImage.title) {
      alert('يرجى إدخال عنوان الصورة');
      return;
    }
    const updatedImages = images.map(img =>
      img.id === editImage.id
        ? {
            ...img,
            title: editImage.title,
            description: editImage.description,
            category: editImage.category,
            location: editImage.location,
            date: editImage.date,
            tags: editImage.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          }
        : img
    );
    setImages(updatedImages);
    saveImages(updatedImages);
    setShowEditModal(false);
    setEditImage(null);
  };

  const categories = [
    'مساعدات غذائية',
    'مساعدات طبية',
    'تعليم',
    'كسوة',
    'مشاريع',
    'فعاليات',
    'تدريب',
    'أخرى'
  ];

  // دالة الفلترة:
  const filteredImages = images.filter(img => {
    let match = true;
    if (filterCategory && img.category !== filterCategory) match = false;
    if (filterTag && (!img.tags || !img.tags.some(tag => tag.includes(filterTag)))) match = false;
    if (filterDateFrom && img.date < filterDateFrom) match = false;
    if (filterDateTo && img.date > filterDateTo) match = false;
    return match;
  });

  return (
    <motion.div
      className="image-gallery-manager"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="gallery-header">
        <div className="header-info">
          <h2>
            <FaImages />
            معرض صور {entityType === 'beneficiary' ? 'المستفيد' : 'المتطوع'}
          </h2>
          <p>{entityName}</p>
          <span className="images-count">{images.length} صورة</span>
        </div>
        
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus />
            إضافة صورة
          </button>
          
          {images.length > 0 && (
            <button
              className="btn btn-secondary"
              onClick={handleExportImages}
            >
              <FaDownload />
              تصدير
            </button>
          )}
          
          <button
            className="btn btn-danger"
            onClick={onClose}
          >
            <FaTimes />
            إغلاق
          </button>
        </div>
      </div>

      <div className="gallery-entity-selector">
        <div className="tabs">
          <button className={tab === 'beneficiary' ? 'active' : ''} onClick={() => { setTab('beneficiary'); setSelectedId(''); }}>المستفيدون</button>
          <button className={tab === 'volunteer' ? 'active' : ''} onClick={() => { setTab('volunteer'); setSelectedId(''); }}>المتطوعون</button>
        </div>
        <div className="dropdown">
          <select id="entity-selector" name="entity-selector" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
            {tab === 'beneficiary' && beneficiaries.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
            {tab === 'volunteer' && volunteers.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* واجهة الفلترة أعلى المعرض: */}
      <div className="gallery-filters">
        <div className="filter-group">
          <label htmlFor="filter-category">الفئة:</label>
          <select id="filter-category" name="filter-category" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">الكل</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="filter-tag">علامة:</label>
          <input
            type="text"
            id="filter-tag"
            name="filter-tag"
            value={filterTag}
            onChange={e => setFilterTag(e.target.value)}
            placeholder="أدخل جزء من العلامة"
          />
        </div>
        <div className="filter-group">
          <label htmlFor="filter-date-from">من تاريخ:</label>
          <input
            type="date"
            id="filter-date-from"
            name="filter-date-from"
            value={filterDateFrom}
            onChange={e => setFilterDateFrom(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="filter-date-to">إلى تاريخ:</label>
          <input
            type="date"
            id="filter-date-to"
            name="filter-date-to"
            value={filterDateTo}
            onChange={e => setFilterDateTo(e.target.value)}
          />
        </div>
        <button className="btn btn-secondary" onClick={() => {
          setFilterCategory(''); setFilterTag(''); setFilterDateFrom(''); setFilterDateTo('');
        }}>مسح الفلاتر</button>
      </div>

      {/* عرض الصور */}
      <div className="images-grid">
        {filteredImages.length === 0 ? (
          <div className="empty-gallery">
            <FaImages className="empty-icon" />
            <h3>لا توجد صور</h3>
            <p>ابدأ بإضافة صور لهذا {entityType === 'beneficiary' ? 'المستفيد' : 'المتطوع'}</p>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <FaPlus />
              إضافة أول صورة
            </button>
          </div>
        ) : (
          filteredImages.map((image) => (
            <motion.div
              key={image.id}
              className="image-card"
              whileHover={{ scale: 1.02 }}
              layout
            >
              <div className="image-container">
                <img
                  src={image.imageData}
                  alt={image.title}
                  onClick={() => openImageModal(image)}
                />
                
                <div className="image-overlay">
                  <button
                    className="overlay-btn"
                    onClick={() => openImageModal(image)}
                  >
                    <FaEye />
                  </button>
                  <button
                    className="overlay-btn"
                    onClick={() => handleLikeImage(image.id)}
                  >
                    <FaHeart />
                  </button>
                  <button
                    className="overlay-btn delete"
                    onClick={() => handleDeleteImage(image.id)}
                  >
                    <FaTrash />
                  </button>
                  <button
                    className="overlay-btn"
                    onClick={() => openEditModal(image)}
                    aria-label="تعديل الصورة"
                  >
                    <FaEdit />
                  </button>
                </div>
              </div>
              
              <div className="image-info">
                <h4>{image.title}</h4>
                <p>{image.description}</p>
                
                <div className="image-meta">
                  {image.category && (
                    <span className="meta-item">
                      <FaTag />
                      {image.category}
                    </span>
                  )}
                  {image.location && (
                    <span className="meta-item">
                      <FaMapMarkerAlt />
                      {image.location}
                    </span>
                  )}
                  <span className="meta-item">
                    <FaCalendarAlt />
                    {new Date(image.date).toLocaleDateString('ar-EG')}
                  </span>
                </div>
                
                <div className="image-stats">
                  <span className="likes">
                    <FaHeart />
                    {image.likes}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* نموذج إضافة صورة */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              className="modal-content large"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>
                  <FaUpload />
                  إضافة صورة جديدة
                </h3>
                <button
                  className="close-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="image-file">اختر الصورة *</label>
                    <input
                      type="file"
                      id="image-file"
                      name="image-file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="file-input"
                    />
                    {newImage.preview && (
                      <div className="image-preview">
                        <img src={newImage.preview} alt="معاينة" />
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="image-title">عنوان الصورة *</label>
                    <input
                      type="text"
                      id="image-title"
                      name="image-title"
                      value={newImage.title}
                      onChange={(e) => setNewImage(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="أدخل عنوان الصورة"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="image-description">وصف الصورة</label>
                    <textarea
                      id="image-description"
                      name="image-description"
                      value={newImage.description}
                      onChange={(e) => setNewImage(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="أدخل وصف الصورة"
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="image-category">الفئة</label>
                    <select
                      id="image-category"
                      name="image-category"
                      value={newImage.category}
                      onChange={(e) => setNewImage(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="">اختر الفئة</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="image-location">المكان</label>
                    <input
                      type="text"
                      id="image-location"
                      name="image-location"
                      value={newImage.location}
                      onChange={(e) => setNewImage(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="أدخل مكان التقاط الصورة"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="image-date">تاريخ الصورة</label>
                    <input
                      type="date"
                      id="image-date"
                      name="image-date"
                      value={newImage.date}
                      onChange={(e) => setNewImage(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="image-tags">العلامات (مفصولة بفواصل)</label>
                    <input
                      type="text"
                      id="image-tags"
                      name="image-tags"
                      value={newImage.tags}
                      onChange={(e) => setNewImage(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="مثال: مساعدات، طعام، رمضان"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  إلغاء
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleAddImage}
                >
                  <FaUpload />
                  إضافة الصورة
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* عارض الصورة الكبير */}
      <AnimatePresence>
        {showImageModal && selectedImage && (
          <motion.div
            className="image-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              className="image-modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="image-modal-header">
                <h3>{selectedImage.title}</h3>
                <button
                  className="close-btn"
                  onClick={() => setShowImageModal(false)}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="image-modal-body">
                <img src={selectedImage.imageData} alt={selectedImage.title} />
                
                <div className="image-details">
                  <p>{selectedImage.description}</p>
                  
                  <div className="image-meta-full">
                    {selectedImage.category && (
                      <div className="meta-row">
                        <FaTag />
                        <span>الفئة: {selectedImage.category}</span>
                      </div>
                    )}
                    {selectedImage.location && (
                      <div className="meta-row">
                        <FaMapMarkerAlt />
                        <span>المكان: {selectedImage.location}</span>
                      </div>
                    )}
                    <div className="meta-row">
                      <FaCalendarAlt />
                      <span>التاريخ: {new Date(selectedImage.date).toLocaleDateString('ar-EG')}</span>
                    </div>
                    <div className="meta-row">
                      <FaUser />
                      <span>{entityType === 'beneficiary' ? 'المستفيد' : 'المتطوع'}: {selectedImage.entityName}</span>
                    </div>
                  </div>

                  {selectedImage.tags && selectedImage.tags.length > 0 && (
                    <div className="image-tags">
                      {selectedImage.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="image-modal-footer">
                <button
                  className="btn btn-primary"
                  onClick={() => handleLikeImage(selectedImage.id)}
                >
                  <FaHeart />
                  إعجاب ({selectedImage.likes})
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    // مشاركة الصورة
                    if (navigator.share) {
                      navigator.share({
                        title: selectedImage.title,
                        text: selectedImage.description,
                      });
                    }
                  }}
                >
                  <FaShare />
                  مشاركة
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* نموذج تعديل بيانات الصورة */}
      <AnimatePresence>
        {showEditModal && editImage && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              className="modal-content large"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3><FaEdit /> تعديل بيانات الصورة</h3>
                <button className="close-btn" onClick={() => setShowEditModal(false)}><FaTimes /></button>
              </div>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="edit-image-title">عنوان الصورة *</label>
                    <input
                      type="text"
                      id="edit-image-title"
                      name="edit-image-title"
                      value={editImage.title}
                      onChange={e => setEditImage(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="أدخل عنوان الصورة"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-image-description">وصف الصورة</label>
                    <textarea
                      id="edit-image-description"
                      name="edit-image-description"
                      value={editImage.description}
                      onChange={e => setEditImage(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="أدخل وصف الصورة"
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-image-category">الفئة</label>
                    <select
                      id="edit-image-category"
                      name="edit-image-category"
                      value={editImage.category}
                      onChange={e => setEditImage(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="">اختر الفئة</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-image-location">المكان</label>
                    <input
                      type="text"
                      id="edit-image-location"
                      name="edit-image-location"
                      value={editImage.location}
                      onChange={e => setEditImage(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="أدخل مكان التقاط الصورة"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-image-date">تاريخ الصورة</label>
                    <input
                      type="date"
                      id="edit-image-date"
                      name="edit-image-date"
                      value={editImage.date}
                      onChange={e => setEditImage(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label htmlFor="edit-image-tags">العلامات (مفصولة بفواصل)</label>
                    <input
                      type="text"
                      id="edit-image-tags"
                      name="edit-image-tags"
                      value={editImage.tags}
                      onChange={e => setEditImage(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="مثال: مساعدات، طعام، رمضان"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>إلغاء</button>
                <button className="btn btn-primary" onClick={handleEditImage}><FaEdit /> حفظ التعديلات</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ImageGalleryManager;
