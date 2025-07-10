import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectAllBeneficiaries } from '../features/beneficiaries/beneficiariesSlice';
import { selectAllVolunteers } from '../features/volunteers/volunteersSlice';
import { FaPlus, FaEdit, FaTrash, FaImages, FaUser } from 'react-icons/fa';

const GalleryAllManager = () => {
  const beneficiaries = useSelector(selectAllBeneficiaries);
  const volunteers = useSelector(selectAllVolunteers);
  const [images, setImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editImage, setEditImage] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    tags: '',
    file: null,
    preview: null,
    entityType: 'beneficiary',
    entityId: '',
  });

  useEffect(() => {
    const savedImages = JSON.parse(localStorage.getItem('gallery_images') || '[]');
    setImages(savedImages);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm(prev => ({ ...prev, file, preview: ev.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddOrEdit = () => {
    if (!form.title || !form.preview || !form.entityId) {
      alert('يرجى إدخال جميع البيانات المطلوبة واختيار صورة واسم');
      return;
    }
    let updatedImages;
    if (editImage) {
      updatedImages = images.map(img =>
        img.id === editImage.id
          ? {
              ...img,
              ...form,
              tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
              imageData: form.preview,
            }
          : img
      );
    } else {
      updatedImages = [
        ...images,
        {
          id: Date.now().toString(),
          ...form,
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
          imageData: form.preview,
          createdAt: new Date().toISOString(),
          likes: 0,
          comments: [],
        },
      ];
    }
    setImages(updatedImages);
    localStorage.setItem('gallery_images', JSON.stringify(updatedImages));
    setShowModal(false);
    setEditImage(null);
    setForm({
      title: '', description: '', category: '', location: '', date: new Date().toISOString().split('T')[0], tags: '', file: null, preview: null, entityType: 'beneficiary', entityId: '',
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('هل أنت متأكد من حذف الصورة؟')) {
      const updatedImages = images.filter(img => img.id !== id);
      setImages(updatedImages);
      localStorage.setItem('gallery_images', JSON.stringify(updatedImages));
    }
  };

  const openEdit = (img) => {
    setEditImage(img);
    setForm({
      ...img,
      tags: img.tags ? img.tags.join(', ') : '',
      preview: img.imageData,
    });
    setShowModal(true);
  };

  const getEntityName = (img) => {
    if (img.entityType === 'beneficiary') {
      const b = beneficiaries.find(b => b.id === img.entityId);
      return b ? b.name : 'مستفيد غير معروف';
    } else {
      const v = volunteers.find(v => v.id === img.entityId);
      return v ? v.name : 'متطوع غير معروف';
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2><FaImages /> معرض الصور العام</h2>
      <button className="btn btn-primary" onClick={() => { setShowModal(true); setEditImage(null); }}> <FaPlus /> إضافة صورة جديدة </button>
      <div className="images-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '2rem' }}>
        {images.length === 0 ? (
          <div>لا توجد صور بعد.</div>
        ) : (
          images.map(img => (
            <div key={img.id} style={{ background: '#222', color: '#fff', borderRadius: 8, width: 260, padding: 12, position: 'relative' }}>
              {img.imageData && <img src={img.imageData} alt={img.title} style={{ width: '100%', borderRadius: 6, marginBottom: 8 }} />}
              <div style={{ fontWeight: 'bold', fontSize: 18 }}>{img.title}</div>
              <div style={{ fontSize: 14 }}>{img.description}</div>
              <div style={{ fontSize: 13, margin: '4px 0' }}><FaUser /> {getEntityName(img)} ({img.entityType === 'beneficiary' ? 'مستفيد' : 'متطوع'})</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn btn-secondary" onClick={() => openEdit(img)}><FaEdit /></button>
                <button className="btn btn-danger" onClick={() => handleDelete(img.id)}><FaTrash /></button>
              </div>
            </div>
          ))
        )}
      </div>
      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{ background: '#222', color: '#fff', borderRadius: 10, padding: 24, minWidth: 320, minHeight: 320 }} onClick={e => e.stopPropagation()}>
            <h3>{editImage ? 'تعديل صورة' : 'إضافة صورة جديدة'}</h3>
            <div className="form-grid" style={{ display: 'grid', gap: 12 }}>
              <input type="file" id="file" name="file" onChange={handleFileChange} />
              {form.preview && <img src={form.preview} alt="معاينة" style={{ width: 120, borderRadius: 6 }} />}
              <input type="text" id="title" name="title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="عنوان الصورة *" />
              <textarea id="description" name="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="وصف الصورة" rows={2} />
              <input type="text" id="category" name="category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="الفئة" />
              <input type="text" id="location" name="location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="المكان" />
              <input type="date" id="date" name="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              <input type="text" id="tags" name="tags" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="العلامات (مفصولة بفواصل)" />
              <select id="entityType" name="entityType" value={form.entityType} onChange={e => setForm(f => ({ ...f, entityType: e.target.value, entityId: '' }))}>
                <option value="beneficiary">مستفيد</option>
                <option value="volunteer">متطوع</option>
              </select>
              <select id="entityId" name="entityId" value={form.entityId} onChange={e => setForm(f => ({ ...f, entityId: e.target.value }))}>
                <option value="">اختر الاسم *</option>
                {form.entityType === 'beneficiary' && beneficiaries.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
                {form.entityType === 'volunteer' && volunteers.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>إلغاء</button>
              <button className="btn btn-primary" onClick={handleAddOrEdit}>{editImage ? 'حفظ التعديلات' : 'إضافة الصورة'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryAllManager; 