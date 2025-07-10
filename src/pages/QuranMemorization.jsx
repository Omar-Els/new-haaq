import React, { useState } from 'react';
import './QuranMemorization.css';

const TABS = [
  { key: 'students', label: 'الطلاب' },
  { key: 'teachers', label: 'المعلمات' },
  { key: 'workers', label: 'العاملة' },
  { key: 'admin', label: 'المشرف/المدير' },
  { key: 'competitions', label: 'المسابقات' },
  { key: 'levels', label: 'المستويات' },
];

// مستويات افتراضية مع السن المناسب
const LEVELS = [
  { id: 1, name: 'المستوى الأول', minAge: 6, maxAge: 8 },
  { id: 2, name: 'المستوى الثاني', minAge: 9, maxAge: 11 },
  { id: 3, name: 'المستوى الثالث', minAge: 12, maxAge: 15 },
];

const QuranMemorization = () => {
  const [activeTab, setActiveTab] = useState('students');

  // إدارة الطلاب
  const [students, setStudents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', age: '', levelId: '', teacherId: '' });

  // إدارة المعلمات
  const [teachers, setTeachers] = useState([]);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: '', phone: '', qualification: '', experience: '' });

  // إدارة العاملات
  const [workers, setWorkers] = useState([]);
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [newWorker, setNewWorker] = useState({ name: '', phone: '' });
  const handleAddWorker = (e) => {
    e.preventDefault();
    if (!newWorker.name) return;
    setWorkers([...workers, { id: Date.now(), ...newWorker }]);
    setShowAddWorkerModal(false);
    setNewWorker({ name: '', phone: '' });
  };
  const handleDeleteWorker = (id) => {
    setWorkers(workers.filter(w => w.id !== id));
  };

  // إدارة المشرفين/المديرين
  const [admins, setAdmins] = useState([]);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', username: '', phone: '' });
  const handleAddAdmin = (e) => {
    e.preventDefault();
    if (!newAdmin.name || !newAdmin.username) return;
    setAdmins([...admins, { id: Date.now(), ...newAdmin }]);
    setShowAddAdminModal(false);
    setNewAdmin({ name: '', username: '', phone: '' });
  };
  const handleDeleteAdmin = (id) => {
    setAdmins(admins.filter(a => a.id !== id));
  };

  // إدارة المسابقات
  const [competitions, setCompetitions] = useState([]);
  const [showAddCompetitionModal, setShowAddCompetitionModal] = useState(false);
  const [newCompetition, setNewCompetition] = useState({ title: '', levelId: '', minAge: '', maxAge: '' });
  const handleAddCompetition = (e) => {
    e.preventDefault();
    if (!newCompetition.title || !newCompetition.levelId) return;
    setCompetitions([...competitions, { id: Date.now(), ...newCompetition }]);
    setShowAddCompetitionModal(false);
    setNewCompetition({ title: '', levelId: '', minAge: '', maxAge: '' });
  };
  const handleDeleteCompetition = (id) => {
    setCompetitions(competitions.filter(c => c.id !== id));
  };

  // إدارة المستويات
  const [levels, setLevels] = useState([...LEVELS]);
  const [showAddLevelModal, setShowAddLevelModal] = useState(false);
  const [newLevel, setNewLevel] = useState({ name: '', minAge: '', maxAge: '' });
  const handleAddLevel = (e) => {
    e.preventDefault();
    if (!newLevel.name || !newLevel.minAge || !newLevel.maxAge) return;
    setLevels([...levels, { id: Date.now(), ...newLevel }]);
    setShowAddLevelModal(false);
    setNewLevel({ name: '', minAge: '', maxAge: '' });
  };
  const handleDeleteLevel = (id) => {
    setLevels(levels.filter(l => l.id !== id));
  };

  // فلترة المستويات حسب العمر
  const availableLevels = newStudent.age
    ? LEVELS.filter(lvl => newStudent.age >= lvl.minAge && newStudent.age <= lvl.maxAge)
    : LEVELS;

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.age || !newStudent.levelId) return;
    setStudents([
      ...students,
      { id: Date.now(), ...newStudent }
    ]);
    setShowAddModal(false);
    setNewStudent({ name: '', age: '', levelId: '', teacherId: '' });
  };

  const handleDeleteStudent = (id) => {
    setStudents(students.filter(s => s.id !== id));
  };

  const handleAddTeacher = (e) => {
    e.preventDefault();
    if (!newTeacher.name || !newTeacher.phone) return;
    setTeachers([
      ...teachers,
      { id: Date.now(), ...newTeacher }
    ]);
    setShowAddTeacherModal(false);
    setNewTeacher({ name: '', phone: '', qualification: '', experience: '' });
  };

  const handleDeleteTeacher = (id) => {
    setTeachers(teachers.filter(t => t.id !== id));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'students':
        return (
          <div className="quran-section">
            <h2>إدارة الطلاب</h2>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>إضافة طالب جديد</button>
            <table className="quran-table" style={{marginTop: 24}}>
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>العمر</th>
                  <th>المستوى</th>
                  <th>المعلمة</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 && (
                  <tr><td colSpan={5} style={{textAlign: 'center'}}>لا يوجد طلاب بعد</td></tr>
                )}
                {students.map(student => {
                  const level = LEVELS.find(lvl => lvl.id === Number(student.levelId));
                  const teacher = teachers.find(t => t.id === Number(student.teacherId));
                  return (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td>{student.age}</td>
                      <td>{level ? level.name : '-'}</td>
                      <td>{teacher ? teacher.name : '-'}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteStudent(student.id)}>حذف</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Modal لإضافة طالب */}
            {showAddModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h3>إضافة طالب جديد</h3>
                  <form onSubmit={handleAddStudent}>
                    <div className="form-group">
                      <label htmlFor="student-name">اسم الطالب</label>
                      <input id="student-name" name="name" type="text" autoComplete="name" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} required className="form-control" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="student-age">العمر</label>
                      <input id="student-age" name="age" type="number" autoComplete="bday" value={newStudent.age} onChange={e => setNewStudent({...newStudent, age: e.target.value})} required className="form-control" min="5" max="18" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="student-level">المستوى</label>
                      <select id="student-level" name="levelId" value={newStudent.levelId} onChange={e => setNewStudent({...newStudent, levelId: e.target.value})} required className="form-control">
                        <option value="">اختر المستوى المناسب</option>
                        {availableLevels.map(level => (
                          <option key={level.id} value={level.id}>{level.name} (من {level.minAge} إلى {level.maxAge} سنة)</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="student-teacher">المعلمة</label>
                      <select id="student-teacher" name="teacherId" autoComplete="off" value={newStudent.teacherId} onChange={e => setNewStudent({...newStudent, teacherId: e.target.value})} className="form-control">
                        <option value="">اختر المعلمة</option>
                        {teachers.map(teacher => (
                          <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{marginTop: 16}}>
                      <button type="submit" className="btn btn-primary">إضافة</button>
                      <button type="button" className="btn btn-secondary" style={{marginRight: 8}} onClick={() => setShowAddModal(false)}>إلغاء</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      case 'teachers':
        return (
          <div className="quran-section">
            <h2>إدارة المعلمات</h2>
            <button className="btn btn-primary" onClick={() => setShowAddTeacherModal(true)}>إضافة معلمة جديدة</button>
            <table className="quran-table" style={{marginTop: 24}}>
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>رقم الهاتف</th>
                  <th>المؤهل</th>
                  <th>سنوات الخبرة</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {teachers.length === 0 && (
                  <tr><td colSpan={5} style={{textAlign: 'center'}}>لا يوجد معلمات بعد</td></tr>
                )}
                {teachers.map(teacher => (
                  <tr key={teacher.id}>
                    <td>{teacher.name}</td>
                    <td>{teacher.phone}</td>
                    <td>{teacher.qualification}</td>
                    <td>{teacher.experience}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTeacher(teacher.id)}>حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Modal لإضافة معلمة */}
            {showAddTeacherModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h3>إضافة معلمة جديدة</h3>
                  <form onSubmit={handleAddTeacher}>
                    <div className="form-group">
                      <label htmlFor="teacher-name">اسم المعلمة</label>
                      <input id="teacher-name" name="name" type="text" autoComplete="name" value={newTeacher.name} onChange={e => setNewTeacher({...newTeacher, name: e.target.value})} required className="form-control" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="teacher-phone">رقم الهاتف</label>
                      <input id="teacher-phone" name="phone" type="text" autoComplete="tel" value={newTeacher.phone} onChange={e => setNewTeacher({...newTeacher, phone: e.target.value})} required className="form-control" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="teacher-qualification">المؤهل</label>
                      <input id="teacher-qualification" name="qualification" type="text" autoComplete="off" value={newTeacher.qualification} onChange={e => setNewTeacher({...newTeacher, qualification: e.target.value})} className="form-control" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="teacher-experience">سنوات الخبرة</label>
                      <input id="teacher-experience" name="experience" type="number" autoComplete="off" value={newTeacher.experience} onChange={e => setNewTeacher({...newTeacher, experience: e.target.value})} className="form-control" min="0" max="50" />
                    </div>
                    <div style={{marginTop: 16}}>
                      <button type="submit" className="btn btn-primary">إضافة</button>
                      <button type="button" className="btn btn-secondary" style={{marginRight: 8}} onClick={() => setShowAddTeacherModal(false)}>إلغاء</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      case 'workers':
        return (
          <div className="quran-section">
            <h2>إدارة العاملات</h2>
            <button className="btn btn-primary" onClick={() => setShowAddWorkerModal(true)}>إضافة عاملة جديدة</button>
            <table className="quran-table" style={{marginTop: 24}}>
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>رقم الهاتف</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {workers.length === 0 && (
                  <tr><td colSpan={3} style={{textAlign: 'center'}}>لا يوجد عاملات بعد</td></tr>
                )}
                {workers.map(worker => (
                  <tr key={worker.id}>
                    <td>{worker.name}</td>
                    <td>{worker.phone}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteWorker(worker.id)}>حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {showAddWorkerModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h3>إضافة عاملة جديدة</h3>
                  <form onSubmit={handleAddWorker}>
                    <div className="form-group">
                      <label htmlFor="worker-name">اسم العاملة</label>
                      <input id="worker-name" name="name" type="text" autoComplete="name" value={newWorker.name} onChange={e => setNewWorker({...newWorker, name: e.target.value})} required className="form-control" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="worker-phone">رقم الهاتف</label>
                      <input id="worker-phone" name="phone" type="text" autoComplete="tel" value={newWorker.phone} onChange={e => setNewWorker({...newWorker, phone: e.target.value})} className="form-control" />
                    </div>
                    <div style={{marginTop: 16}}>
                      <button type="submit" className="btn btn-primary">إضافة</button>
                      <button type="button" className="btn btn-secondary" style={{marginRight: 8}} onClick={() => setShowAddWorkerModal(false)}>إلغاء</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      case 'admin':
        return (
          <div className="quran-section">
            <h2>إدارة المشرف/المدير</h2>
            <button className="btn btn-primary" onClick={() => setShowAddAdminModal(true)}>إضافة مشرف/مدير جديد</button>
            <table className="quran-table" style={{marginTop: 24}}>
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>اسم المستخدم</th>
                  <th>رقم الهاتف</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 && (
                  <tr><td colSpan={4} style={{textAlign: 'center'}}>لا يوجد مشرفين بعد</td></tr>
                )}
                {admins.map(admin => (
                  <tr key={admin.id}>
                    <td>{admin.name}</td>
                    <td>{admin.username}</td>
                    <td>{admin.phone}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteAdmin(admin.id)}>حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {showAddAdminModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h3>إضافة مشرف/مدير جديد</h3>
                  <form onSubmit={handleAddAdmin}>
                    <div className="form-group">
                      <label htmlFor="admin-name">اسم المشرف/المدير</label>
                      <input id="admin-name" name="name" type="text" autoComplete="name" value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} required className="form-control" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="admin-username">اسم المستخدم</label>
                      <input id="admin-username" name="username" type="text" autoComplete="username" value={newAdmin.username} onChange={e => setNewAdmin({...newAdmin, username: e.target.value})} required className="form-control" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="admin-phone">رقم الهاتف</label>
                      <input id="admin-phone" name="phone" type="text" autoComplete="tel" value={newAdmin.phone} onChange={e => setNewAdmin({...newAdmin, phone: e.target.value})} className="form-control" />
                    </div>
                    <div style={{marginTop: 16}}>
                      <button type="submit" className="btn btn-primary">إضافة</button>
                      <button type="button" className="btn btn-secondary" style={{marginRight: 8}} onClick={() => setShowAddAdminModal(false)}>إلغاء</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      case 'competitions':
        return (
          <div className="quran-section">
            <h2>إدارة المسابقات</h2>
            <button className="btn btn-primary" onClick={() => setShowAddCompetitionModal(true)}>إضافة مسابقة جديدة</button>
            <table className="quran-table" style={{marginTop: 24}}>
              <thead>
                <tr>
                  <th>العنوان</th>
                  <th>المستوى</th>
                  <th>الحد الأدنى للعمر</th>
                  <th>الحد الأقصى للعمر</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {competitions.length === 0 && (
                  <tr><td colSpan={5} style={{textAlign: 'center'}}>لا يوجد مسابقات بعد</td></tr>
                )}
                {competitions.map(comp => {
                  const level = levels.find(lvl => lvl.id === Number(comp.levelId));
                  return (
                    <tr key={comp.id}>
                      <td>{comp.title}</td>
                      <td>{level ? level.name : '-'}</td>
                      <td>{comp.minAge}</td>
                      <td>{comp.maxAge}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCompetition(comp.id)}>حذف</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {showAddCompetitionModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h3>إضافة مسابقة جديدة</h3>
                  <form onSubmit={handleAddCompetition}>
                    <div className="form-group">
                      <label htmlFor="competition-title">عنوان المسابقة</label>
                      <input id="competition-title" name="title" type="text" autoComplete="off" value={newCompetition.title} onChange={e => setNewCompetition({...newCompetition, title: e.target.value})} required className="form-control" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="competition-level">المستوى</label>
                      <select id="competition-level" name="levelId" value={newCompetition.levelId} onChange={e => setNewCompetition({...newCompetition, levelId: e.target.value})} required className="form-control">
                        <option value="">اختر المستوى</option>
                        {levels.map(level => (
                          <option key={level.id} value={level.id}>{level.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="competition-min-age">الحد الأدنى للعمر</label>
                      <input id="competition-min-age" name="minAge" type="number" autoComplete="off" value={newCompetition.minAge} onChange={e => setNewCompetition({...newCompetition, minAge: e.target.value})} className="form-control" min="5" max="18" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="competition-max-age">الحد الأقصى للعمر</label>
                      <input id="competition-max-age" name="maxAge" type="number" autoComplete="off" value={newCompetition.maxAge} onChange={e => setNewCompetition({...newCompetition, maxAge: e.target.value})} className="form-control" min="5" max="18" />
                    </div>
                    <div style={{marginTop: 16}}>
                      <button type="submit" className="btn btn-primary">إضافة</button>
                      <button type="button" className="btn btn-secondary" style={{marginRight: 8}} onClick={() => setShowAddCompetitionModal(false)}>إلغاء</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      case 'levels':
        return (
          <div className="quran-section">
            <h2>إدارة المستويات</h2>
            <button className="btn btn-primary" onClick={() => setShowAddLevelModal(true)}>إضافة مستوى جديد</button>
            <table className="quran-table" style={{marginTop: 24}}>
              <thead>
                <tr>
                  <th>اسم المستوى</th>
                  <th>الحد الأدنى للعمر</th>
                  <th>الحد الأقصى للعمر</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {levels.length === 0 && (
                  <tr><td colSpan={4} style={{textAlign: 'center'}}>لا يوجد مستويات بعد</td></tr>
                )}
                {levels.map(level => (
                  <tr key={level.id}>
                    <td>{level.name}</td>
                    <td>{level.minAge}</td>
                    <td>{level.maxAge}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteLevel(level.id)}>حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {showAddLevelModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h3>إضافة مستوى جديد</h3>
                  <form onSubmit={handleAddLevel}>
                    <div className="form-group">
                      <label htmlFor="level-name">اسم المستوى</label>
                      <input id="level-name" name="name" type="text" autoComplete="off" value={newLevel.name} onChange={e => setNewLevel({...newLevel, name: e.target.value})} required className="form-control" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="level-min-age">الحد الأدنى للعمر</label>
                      <input id="level-min-age" name="minAge" type="number" autoComplete="off" value={newLevel.minAge} onChange={e => setNewLevel({...newLevel, minAge: e.target.value})} required className="form-control" min="5" max="18" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="level-max-age">الحد الأقصى للعمر</label>
                      <input id="level-max-age" name="maxAge" type="number" autoComplete="off" value={newLevel.maxAge} onChange={e => setNewLevel({...newLevel, maxAge: e.target.value})} required className="form-control" min="5" max="18" />
                    </div>
                    <div style={{marginTop: 16}}>
                      <button type="submit" className="btn btn-primary">إضافة</button>
                      <button type="button" className="btn btn-secondary" style={{marginRight: 8}} onClick={() => setShowAddLevelModal(false)}>إلغاء</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="quran-memorization">
      <div className="quran-header-main">
        <h1 className="adaptive-text">نظام تحفيظ القرآن الكريم</h1>
        <p className="adaptive-text">إدارة الطلاب والمعلمات والعاملات والمشرفين والمسابقات والمستويات</p>
      </div>
      <div className="quran-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="quran-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default QuranMemorization; 