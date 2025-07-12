import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addDevelopmentProject, deleteDevelopmentProject } from '../features/developmentProjects/developmentProjectsSlice';

const DevelopmentProjectsManager = () => {
  const dispatch = useDispatch();
  const projects = useSelector(state => state.developmentProjects.items || []);
  const beneficiaries = useSelector(state => state.beneficiaries.items || []);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    beneficiaries: [],
    type: 'small',
    budget: '',
  });
  const [showDetails, setShowDetails] = useState(null);

  // فلترة المشاريع حسب البحث والنوع
  const filteredProjects = projects.filter(project => {
    const matchesSearch =
      !search ||
      project.name.includes(search) ||
      project.description.includes(search) ||
      (Array.isArray(project.beneficiaries) && project.beneficiaries.some(id => (beneficiaries.find(b => b.id === id)?.name || '').includes(search)));
    const matchesType = !typeFilter || project.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleAdd = () => {
    if (!formData.name || !formData.type || !formData.budget) return;
    dispatch(addDevelopmentProject({ ...formData, id: Date.now().toString() }));
    setShowAdd(false);
    setFormData({ name: '', description: '', beneficiaries: [], type: 'small', budget: '' });
  };

  const handleDelete = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
      dispatch(deleteDevelopmentProject(id));
    }
  };

  return (
    <div className="development-projects-page" style={{ padding: '2rem' }}>
      <h2>المشاريع التنموية</h2>
      <div className="projects-actions" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="بحث عن مشروع أو مستفيد..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc' }}
        />
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc' }}
        >
          <option value="">كل الأنواع</option>
          <option value="small">مشروع صغير</option>
          <option value="medium">مشروع متوسط</option>
        </select>
        <button onClick={() => setShowAdd(!showAdd)} style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 1.5rem' }}>
          {showAdd ? 'إلغاء' : 'إضافة مشروع جديد'}
        </button>
      </div>
      {showAdd && (
        <div className="add-project-form" style={{ background: 'var(--card-bg)', padding: '1rem', borderRadius: 8, marginBottom: '1.5rem', boxShadow: '0 2px 8px var(--shadow-color)' }}>
          <label htmlFor="project-name">اسم المشروع</label>
          <input
            id="project-name"
            name="name"
            type="text"
            placeholder="اسم المشروع"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            style={{ width: '100%', marginBottom: 8, padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc' }}
          />
          <label htmlFor="project-description">وصف المشروع</label>
          <textarea
            id="project-description"
            name="description"
            placeholder="وصف المشروع"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            style={{ width: '100%', marginBottom: 8, padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc' }}
          />
          <label htmlFor="project-type">نوع المشروع</label>
          <select
            id="project-type"
            name="type"
            value={formData.type}
            onChange={e => setFormData({ ...formData, type: e.target.value })}
            style={{ width: '100%', marginBottom: 8, padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc' }}
          >
            <option value="small">مشروع صغير</option>
            <option value="medium">مشروع متوسط</option>
          </select>
          <label htmlFor="project-budget">الميزانية (جنيه)</label>
          <input
            id="project-budget"
            name="budget"
            type="number"
            placeholder="الميزانية (جنيه)"
            value={formData.budget}
            onChange={e => setFormData({ ...formData, budget: e.target.value })}
            style={{ width: '100%', marginBottom: 8, padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc' }}
          />
          <label htmlFor="project-beneficiaries">ربط المستفيدين</label>
          <select
            id="project-beneficiaries"
            name="beneficiaries"
            multiple
            value={formData.beneficiaries}
            onChange={e => setFormData({ ...formData, beneficiaries: Array.from(e.target.selectedOptions, option => option.value) })}
            style={{ width: '100%', marginBottom: 8, padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc' }}
          >
            <option value="">ربط مستفيدين...</option>
            {beneficiaries.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <button onClick={handleAdd} style={{ background: 'var(--success-color, #27ae60)', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 1.5rem' }}>
            حفظ المشروع
          </button>
        </div>
      )}
      {/* عرض المشاريع ككروت */}
      <div className="projects-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {filteredProjects.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-secondary-color)' }}>لا توجد مشاريع مطابقة.</div>
        )}
        {filteredProjects.map(project => (
          <div key={project.id} className="project-card" style={{ background: 'var(--card-bg)', borderRadius: 12, boxShadow: '0 2px 8px var(--shadow-color)', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 200 }}>
            <div>
              <h3 style={{ color: 'var(--primary-color)', marginBottom: 8 }}>{project.name}</h3>
              <div style={{ marginBottom: 6, color: 'var(--text-secondary-color)' }}>{project.type === 'small' ? 'مشروع صغير' : 'مشروع متوسط'}</div>
              <div style={{ marginBottom: 6 }}><b>الميزانية:</b> {project.budget} جنيه</div>
              <div style={{ marginBottom: 6 }}>
                <b>المستفيدون:</b> {Array.isArray(project.beneficiaries) && project.beneficiaries.length > 0 ? project.beneficiaries.slice(0, 3).map(id => (beneficiaries.find(b => b.id === id)?.name || 'غير معروف')).join(', ') : 'لا يوجد'}
                {Array.isArray(project.beneficiaries) && project.beneficiaries.length > 3 && <span style={{ color: 'var(--primary-color)' }}> ...والمزيد</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button onClick={() => setShowDetails(project)} style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 500 }}>تفاصيل</button>
              <button onClick={() => alert('تعديل المشروع قادم قريبًا!')} style={{ background: 'var(--warning-color, #f39c12)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 500 }}>تعديل</button>
              <button onClick={() => handleDelete(project.id)} style={{ background: 'var(--error-color, #e74c3c)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 500 }}>حذف</button>
            </div>
          </div>
        ))}
      </div>
      {/* نافذة التفاصيل */}
      {showDetails && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.25)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowDetails(null)}>
          <div className="modal-content" style={{ background: 'var(--card-bg)', borderRadius: 12, boxShadow: '0 2px 16px var(--shadow-color)', padding: '2rem', minWidth: 320, maxWidth: 420, width: '100%', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowDetails(null)} style={{ position: 'absolute', top: 12, left: 12, background: 'none', border: 'none', fontSize: 22, color: 'var(--error-color, #e74c3c)', cursor: 'pointer' }}>×</button>
            <h3 style={{ color: 'var(--primary-color)', marginBottom: 12 }}>{showDetails.name}</h3>
            <div style={{ marginBottom: 8 }}><b>الوصف:</b> {showDetails.description || 'لا يوجد'}</div>
            <div style={{ marginBottom: 8 }}><b>النوع:</b> {showDetails.type === 'small' ? 'مشروع صغير' : 'مشروع متوسط'}</div>
            <div style={{ marginBottom: 8 }}><b>الميزانية:</b> {showDetails.budget} جنيه</div>
            <div style={{ marginBottom: 8 }}><b>المستفيدون:</b> {Array.isArray(showDetails.beneficiaries) && showDetails.beneficiaries.length > 0 ? showDetails.beneficiaries.map(id => (beneficiaries.find(b => b.id === id)?.name || 'غير معروف')).join(', ') : 'لا يوجد'}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevelopmentProjectsManager; 