import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addHealthcareService } from './healthcareSlice';

const HealthcarePage = () => {
  const dispatch = useDispatch();
  const services = useSelector(state => state.healthcare.services);
  const beneficiaries = useSelector(state => state.beneficiaries.beneficiaries || []);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newService, setNewService] = useState({ beneficiaryId: '', serviceType: '', description: '', date: '', provider: '', status: 'pending' });

  const filteredServices = services.filter(s =>
    (!search || s.serviceType.includes(search) || s.description.includes(search) || (beneficiaries.find(b => b.id === s.beneficiaryId)?.name || '').includes(search))
  );

  const handleAdd = () => {
    if (!newService.beneficiaryId || !newService.serviceType || !newService.date) return;
    dispatch(addHealthcareService({ ...newService, id: Date.now() }));
    setShowAdd(false);
    setNewService({ beneficiaryId: '', serviceType: '', description: '', date: '', provider: '', status: 'pending' });
  };

  return (
    <div className="healthcare-page">
      <h2>الرعاية الصحية - الخدمات الطبية</h2>
      <div className="healthcare-actions">
        <input type="text" placeholder="بحث عن خدمة أو مستفيد..." value={search} onChange={e => setSearch(e.target.value)} />
        <button onClick={() => setShowAdd(!showAdd)}>{showAdd ? 'إلغاء' : 'إضافة خدمة طبية'}</button>
      </div>
      {showAdd && (
        <div className="add-healthcare-form">
          <select value={newService.beneficiaryId} onChange={e => setNewService({ ...newService, beneficiaryId: e.target.value })}>
            <option value="">اختر مستفيد</option>
            {beneficiaries.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <input type="text" placeholder="نوع الخدمة الطبية" value={newService.serviceType} onChange={e => setNewService({ ...newService, serviceType: e.target.value })} />
          <input type="text" placeholder="وصف مختصر" value={newService.description} onChange={e => setNewService({ ...newService, description: e.target.value })} />
          <input type="date" value={newService.date} onChange={e => setNewService({ ...newService, date: e.target.value })} />
          <input type="text" placeholder="مقدم الخدمة" value={newService.provider} onChange={e => setNewService({ ...newService, provider: e.target.value })} />
          <button onClick={handleAdd}>حفظ الخدمة</button>
        </div>
      )}
      <table className="healthcare-table">
        <thead>
          <tr>
            <th>المستفيد</th>
            <th>نوع الخدمة</th>
            <th>الوصف</th>
            <th>التاريخ</th>
            <th>مقدم الخدمة</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          {filteredServices.length === 0 && (
            <tr><td colSpan="6">لا توجد خدمات طبية مسجلة.</td></tr>
          )}
          {filteredServices.map(service => {
            const beneficiary = beneficiaries.find(b => b.id === service.beneficiaryId);
            return (
              <tr key={service.id}>
                <td>{beneficiary ? beneficiary.name : 'غير معروف'}</td>
                <td>{service.serviceType}</td>
                <td>{service.description}</td>
                <td>{service.date}</td>
                <td>{service.provider}</td>
                <td>{service.status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default HealthcarePage; 