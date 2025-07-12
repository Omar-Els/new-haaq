import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addDevelopmentProject, deleteDevelopmentProject } from '../features/developmentProjects/developmentProjectsSlice';
// سيتم لاحقًا ربطه بالـ slice الخاص بالمشاريع التنموية

const DevelopmentProjectsManager = () => {
  // حالة مبدئية للمشاريع
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    beneficiaries: [],
    type: 'small',
    budget: '',
  });

  // جلب المستفيدين من الستور
  const beneficiaries = useSelector(state => state.beneficiaries.items || []);

  const dispatch = useDispatch();
  // جلب المشاريع من الستور
  const projects = useSelector(state => state.developmentProjects.items || []);

  // دالة إضافة مشروع (مؤقتة)
  const handleAddProject = (e) => {
    e.preventDefault();
    dispatch(addDevelopmentProject(formData));
    setShowForm(false);
    setFormData({ name: '', description: '', beneficiaries: [], type: 'small', budget: '' });
  };

  // حذف مشروع
  const handleDelete = (id) => {
    dispatch(deleteDevelopmentProject(id));
  };

  return (
    <div className="development-projects-manager">
      <h2>المشاريع التنموية</h2>
      <button onClick={() => setShowForm(true)}>إضافة مشروع جديد</button>
      {showForm && (
        <form onSubmit={handleAddProject}>
          <input
            type="text"
            placeholder="اسم المشروع"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <textarea
            placeholder="وصف المشروع"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
          <select
            value={formData.type}
            onChange={e => setFormData({ ...formData, type: e.target.value })}
          >
            <option value="small">مشروع صغير</option>
            <option value="medium">مشروع متوسط</option>
          </select>
          <input
            type="number"
            placeholder="الميزانية (جنيه)"
            value={formData.budget}
            onChange={e => setFormData({ ...formData, budget: e.target.value })}
          />
          <label>ربط المستفيدين:</label>
          <select
            multiple
            value={formData.beneficiaries}
            onChange={e => setFormData({ ...formData, beneficiaries: Array.from(e.target.selectedOptions, option => option.value) })}
          >
            {beneficiaries.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <button type="submit">حفظ المشروع</button>
          <button type="button" onClick={() => setShowForm(false)}>إلغاء</button>
        </form>
      )}
      <div className="projects-list">
        {projects.length === 0 ? <p>لا توجد مشاريع بعد.</p> : (
          <ul>
            {projects.map(project => (
              <li key={project.id}>
                {project.name} - {project.type} - {project.budget} جنيه
                <button onClick={() => handleDelete(project.id)}>حذف</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DevelopmentProjectsManager; 