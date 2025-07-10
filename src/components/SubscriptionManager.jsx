import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification } from '../features/notifications/notificationsSlice';
import { 
  selectQuranStudents, 
  selectQuranLevels, 
  selectQuranSettings,
  selectQuranTeachers,
  selectQuranLoading,
  selectQuranError,
  fetchQuranData 
} from '../features/quran/quranSlice';
import './SubscriptionManager.css';

const SubscriptionManager = ({ onClose }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const students = useSelector(selectQuranStudents);
  const levels = useSelector(selectQuranLevels);
  const settings = useSelector(selectQuranSettings);
  const teachers = useSelector(selectQuranTeachers);
  const isLoading = useSelector(selectQuranLoading);
  const error = useSelector(selectQuranError);

  // تحميل بيانات القرآن عند تحميل المكون
  useEffect(() => {
    // تحميل البيانات إذا لم تكن موجودة
    if ((!students || students.length === 0) && (!levels || levels.length === 0)) {
      console.log('🔄 تحميل بيانات القرآن في SubscriptionManager...');
      dispatch(fetchQuranData());
    }
  }, [dispatch, students, levels]);

  const [subscriptionForm, setSubscriptionForm] = useState({
    studentId: '',
    levelId: '',
    startDate: '',
    endDate: '',
    amount: '',
    paymentMethod: '',
    status: 'active',
    notes: ''
  });

  const [teacherSalaryForm, setTeacherSalaryForm] = useState({
    teacherId: '',
    month: '',
    year: '',
    baseSalary: '',
    bonuses: '',
    deductions: '',
    notes: ''
  });

  const [showTeacherSalaryForm, setShowTeacherSalaryForm] = useState(false);

  // حساب إحصائيات الاشتراكات
  const subscriptionStats = (levels || []).map(level => {
    if (!level || !level.id) return null;
    
    const levelStudents = (students || []).filter(student => student && student.levelId === level.id);
    const activeStudents = levelStudents.filter(student => student && student.status === 'active');
    const availableSlots = Math.max(0, (level.maxStudents || 0) - activeStudents.length);
    const occupancyRate = level.maxStudents > 0 ? (activeStudents.length / level.maxStudents) * 100 : 0;

    return {
      level,
      totalStudents: levelStudents.length,
      activeStudents: activeStudents.length,
      availableSlots,
      occupancyRate,
      revenue: activeStudents.length * (level.price || 0)
    };
  }).filter(Boolean); // إزالة القيم الفارغة

  // إجمالي الإحصائيات
  const totalStats = {
    totalStudents: (students || []).length,
    activeStudents: (students || []).filter(s => s && s.status === 'active').length,
    totalRevenue: subscriptionStats.reduce((sum, stat) => sum + (stat?.revenue || 0), 0),
    averageOccupancy: subscriptionStats.length > 0 
      ? subscriptionStats.reduce((sum, stat) => sum + (stat?.occupancyRate || 0), 0) / subscriptionStats.length 
      : 0
  };

  const handleAddSubscription = async (e) => {
    e.preventDefault();
    
    if (!subscriptionForm.studentId || !subscriptionForm.levelId || !subscriptionForm.amount) {
      dispatch(addNotification({
        type: 'error',
        message: 'يرجى ملء جميع الحقول المطلوبة',
        duration: 3000
      }));
      return;
    }

    // التحقق من الحد الأقصى للمستوى
    const level = (levels || []).find(l => l.id === subscriptionForm.levelId);
    if (!level) {
      dispatch(addNotification({
        type: 'error',
        message: 'المستوى المحدد غير موجود',
        duration: 3000
      }));
      return;
    }
    
    const levelStudents = (students || []).filter(s => s.levelId === subscriptionForm.levelId && s.status === 'active');
    
    if (levelStudents.length >= (level.maxStudents || 0)) {
      dispatch(addNotification({
        type: 'error',
        message: `المستوى ${level.name} ممتلئ. الحد الأقصى: ${level.maxStudents} طالب`,
        duration: 5000
      }));
      return;
    }

    try {
      // هنا يمكن إضافة منطق حفظ الاشتراك
      dispatch(addNotification({
        type: 'success',
        message: 'تم إضافة الاشتراك بنجاح',
        duration: 3000
      }));
      
      setSubscriptionForm({
        studentId: '',
        levelId: '',
        startDate: '',
        endDate: '',
        amount: '',
        paymentMethod: '',
        status: 'active',
        notes: ''
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('فشل في إضافة الاشتراك:', error);
    }
  };

  const handleAddTeacherSalary = async (e) => {
    e.preventDefault();
    
    if (!teacherSalaryForm.teacherId || !teacherSalaryForm.baseSalary) {
      dispatch(addNotification({
        type: 'error',
        message: 'يرجى ملء جميع الحقول المطلوبة',
        duration: 3000
      }));
      return;
    }

    try {
      // هنا يمكن إضافة منطق حفظ راتب المعلمة
      dispatch(addNotification({
        type: 'success',
        message: 'تم إضافة راتب المعلمة بنجاح',
        duration: 3000
      }));
      
      setTeacherSalaryForm({
        teacherId: '',
        month: '',
        year: '',
        baseSalary: '',
        bonuses: '',
        deductions: '',
        notes: ''
      });
      setShowTeacherSalaryForm(false);
    } catch (error) {
      console.error('فشل في إضافة راتب المعلمة:', error);
    }
  };

  const getStudentName = (studentId) => {
    const student = (students || []).find(s => s.id === studentId);
    return student ? student.name : 'غير معروف';
  };

  const getLevelName = (levelId) => {
    const level = (levels || []).find(l => l.id === levelId);
    return level ? level.name : 'غير محدد';
  };

  const renderOverview = () => (
    <div className="subscription-overview">
      <h3>نظرة عامة على الاشتراكات</h3>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h4>إجمالي الطلاب</h4>
            <span className="stat-value">{totalStats.totalStudents}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h4>الطلاب النشطون</h4>
            <span className="stat-value">{totalStats.activeStudents}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👩‍🏫</div>
          <div className="stat-content">
            <h4>المعلمات</h4>
            <span className="stat-value">{(teachers || []).length}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h4>إجمالي الإيرادات</h4>
            <span className="stat-value">{totalStats.totalRevenue} ريال</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h4>متوسط الإشغال</h4>
            <span className="stat-value">{totalStats.averageOccupancy.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="overview-actions">
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          إضافة اشتراك جديد
        </button>
        <button 
          className="btn btn-success"
          onClick={() => setShowTeacherSalaryForm(true)}
        >
          إضافة راتب معلمة
        </button>
      </div>

      <div className="levels-overview">
        <h4>تفاصيل المستويات</h4>
        <div className="levels-grid">
          {subscriptionStats.map(stat => (
            <div key={stat.level.id} className="level-stat-card">
              <div className="level-header">
                <h5>{stat.level.name}</h5>
                <span className="level-price">{stat.level.price} ريال</span>
              </div>
              
              <div className="level-stats">
                <div className="stat-row">
                  <span>الطلاب النشطون:</span>
                  <span className="stat-value">{stat.activeStudents}/{stat.level.maxStudents}</span>
                </div>
                
                <div className="stat-row">
                  <span>المقاعد المتاحة:</span>
                  <span className={`stat-value ${stat.availableSlots === 0 ? 'full' : ''}`}>
                    {stat.availableSlots}
                  </span>
                </div>
                
                <div className="stat-row">
                  <span>نسبة الإشغال:</span>
                  <span className="stat-value">{stat.occupancyRate.toFixed(1)}%</span>
                </div>
                
                <div className="stat-row">
                  <span>الإيرادات:</span>
                  <span className="stat-value">{stat.revenue} ريال</span>
                </div>
              </div>
              
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${stat.occupancyRate}%` }}
                ></div>
              </div>
              
              <div className="level-actions">
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    setSelectedLevel(stat.level);
                    setActiveTab('details');
                  }}
                >
                  التفاصيل
                </button>
                <button 
                  className="btn btn-sm btn-success"
                  onClick={() => {
                    setSelectedLevel(stat.level);
                    setShowAddForm(true);
                  }}
                  disabled={stat.availableSlots === 0}
                >
                  إضافة طالب
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLevelDetails = () => {
    if (!selectedLevel || !selectedLevel.id) return null;

    const levelStudents = (students || []).filter(student => student && student.levelId === selectedLevel.id);
    const activeStudents = levelStudents.filter(student => student && student.status === 'active');
    const inactiveStudents = levelStudents.filter(student => student && student.status !== 'active');

    return (
      <div className="level-details">
        <div className="level-header">
          <h3>{selectedLevel.name}</h3>
          <button 
            className="btn btn-secondary"
            onClick={() => setActiveTab('overview')}
          >
            العودة للنظرة العامة
          </button>
        </div>

        <div className="level-info">
          <p><strong>الوصف:</strong> {selectedLevel.description}</p>
          <p><strong>السور:</strong> {selectedLevel.surahs.join('، ')}</p>
          <p><strong>المدة:</strong> {selectedLevel.duration}</p>
          <p><strong>السعر:</strong> {selectedLevel.price} ريال</p>
        </div>

        <div className="students-sections">
          <div className="active-students">
            <h4>الطلاب النشطون ({activeStudents.length})</h4>
            <div className="students-table">
              <table>
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>رقم الهاتف</th>
                    <th>تاريخ التسجيل</th>
                    <th>التقدم</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {activeStudents.map(student => (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td>{student.phone}</td>
                      <td>{new Date(student.createdAt).toLocaleDateString('ar-EG')}</td>
                      <td>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${student.progress || 0}%` }}
                          ></div>
                          <span>{student.progress || 0}%</span>
                        </div>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-secondary">تعديل</button>
                        <button className="btn btn-sm btn-danger">إلغاء الاشتراك</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {inactiveStudents.length > 0 && (
            <div className="inactive-students">
              <h4>الطلاب غير النشطين ({inactiveStudents.length})</h4>
              <div className="students-table">
                <table>
                  <thead>
                    <tr>
                      <th>الاسم</th>
                      <th>رقم الهاتف</th>
                      <th>تاريخ التسجيل</th>
                      <th>الحالة</th>
                      <th>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inactiveStudents.map(student => (
                      <tr key={student.id}>
                        <td>{student.name}</td>
                        <td>{student.phone}</td>
                        <td>{new Date(student.createdAt).toLocaleDateString('ar-EG')}</td>
                        <td>
                          <span className={`status-badge ${student.status}`}>
                            {student.status === 'inactive' ? 'غير نشط' : student.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-success">إعادة تفعيل</button>
                          <button className="btn btn-sm btn-danger">حذف</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAddForm = () => (
    <div className="add-subscription-form">
      <h3>إضافة اشتراك جديد</h3>
      <form onSubmit={handleAddSubscription}>
        <div className="form-group">
          <label htmlFor="student-select">الطالب *</label>
          <select
            id="student-select"
            name="studentId"
            value={subscriptionForm.studentId}
            onChange={(e) => setSubscriptionForm({
              ...subscriptionForm,
              studentId: e.target.value
            })}
            className="form-control"
            required
          >
            <option value="">اختر الطالب</option>
            {(students || [])
              .filter(student => student && (!student.levelId || student.status !== 'active'))
              .map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} - {student.phone}
                </option>
              ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="level-select">المستوى *</label>
          <select
            id="level-select"
            name="levelId"
            value={subscriptionForm.levelId}
            onChange={(e) => setSubscriptionForm({
              ...subscriptionForm,
              levelId: e.target.value
            })}
            className="form-control"
            required
          >
            <option value="">اختر المستوى</option>
            {(levels || []).map(level => {
              if (!level || !level.id) return null;
              const levelStudents = (students || []).filter(s => s && s.levelId === level.id && s.status === 'active');
              const availableSlots = Math.max(0, (level.maxStudents || 0) - levelStudents.length);
              
              return (
                <option key={level.id} value={level.id} disabled={availableSlots === 0}>
                  {level.name} - {level.price} ريال ({availableSlots} مقعد متاح)
                </option>
              );
            })}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="start-date">تاريخ البداية</label>
            <input
              id="start-date"
              name="startDate"
              type="date"
              value={subscriptionForm.startDate}
              onChange={(e) => setSubscriptionForm({
                ...subscriptionForm,
                startDate: e.target.value
              })}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label htmlFor="end-date">تاريخ الانتهاء</label>
            <input
              id="end-date"
              name="endDate"
              type="date"
              value={subscriptionForm.endDate}
              onChange={(e) => setSubscriptionForm({
                ...subscriptionForm,
                endDate: e.target.value
              })}
              className="form-control"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="amount">المبلغ المدفوع *</label>
          <input
            id="amount"
            name="amount"
            type="number"
            value={subscriptionForm.amount}
            onChange={(e) => setSubscriptionForm({
              ...subscriptionForm,
              amount: e.target.value
            })}
            className="form-control"
            required
            placeholder="المبلغ بالريال"
          />
        </div>

        <div className="form-group">
          <label htmlFor="payment-method">طريقة الدفع</label>
          <select
            id="payment-method"
            name="paymentMethod"
            value={subscriptionForm.paymentMethod}
            onChange={(e) => setSubscriptionForm({
              ...subscriptionForm,
              paymentMethod: e.target.value
            })}
            className="form-control"
          >
            <option value="">اختر طريقة الدفع</option>
            <option value="cash">نقداً</option>
            <option value="bank">تحويل بنكي</option>
            <option value="card">بطاقة ائتمان</option>
            <option value="online">دفع إلكتروني</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="notes">ملاحظات</label>
          <textarea
            id="notes"
            name="notes"
            value={subscriptionForm.notes}
            onChange={(e) => setSubscriptionForm({
              ...subscriptionForm,
              notes: e.target.value
            })}
            className="form-control"
            rows="3"
            placeholder="أي ملاحظات إضافية"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            إضافة الاشتراك
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => setShowAddForm(false)}
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );

  const renderTeacherSalaryForm = () => (
    <div className="add-subscription-form">
      <h3>إضافة راتب معلمة</h3>
      <form onSubmit={handleAddTeacherSalary}>
        <div className="form-group">
          <label htmlFor="teacher-select">المعلمة *</label>
          <select
            id="teacher-select"
            name="teacherId"
            value={teacherSalaryForm.teacherId}
            onChange={(e) => setTeacherSalaryForm({
              ...teacherSalaryForm,
              teacherId: e.target.value
            })}
            className="form-control"
            required
          >
            <option value="">اختر المعلمة</option>
            {(teachers || [])
              .filter(teacher => teacher && teacher.status === 'active')
              .map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} - {teacher.phone}
                </option>
              ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="salary-month">الشهر</label>
            <select
              id="salary-month"
              name="month"
              value={teacherSalaryForm.month}
              onChange={(e) => setTeacherSalaryForm({
                ...teacherSalaryForm,
                month: e.target.value
              })}
              className="form-control"
            >
              <option value="">اختر الشهر</option>
              <option value="1">يناير</option>
              <option value="2">فبراير</option>
              <option value="3">مارس</option>
              <option value="4">أبريل</option>
              <option value="5">مايو</option>
              <option value="6">يونيو</option>
              <option value="7">يوليو</option>
              <option value="8">أغسطس</option>
              <option value="9">سبتمبر</option>
              <option value="10">أكتوبر</option>
              <option value="11">نوفمبر</option>
              <option value="12">ديسمبر</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="salary-year">السنة</label>
            <input
              id="salary-year"
              name="year"
              type="number"
              value={teacherSalaryForm.year}
              onChange={(e) => setTeacherSalaryForm({
                ...teacherSalaryForm,
                year: e.target.value
              })}
              className="form-control"
              placeholder="2024"
              min="2020"
              max="2030"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="base-salary">الراتب الأساسي *</label>
            <input
              id="base-salary"
              name="baseSalary"
              type="number"
              value={teacherSalaryForm.baseSalary}
              onChange={(e) => setTeacherSalaryForm({
                ...teacherSalaryForm,
                baseSalary: e.target.value
              })}
              className="form-control"
              required
              placeholder="الراتب الأساسي بالريال"
            />
          </div>
          <div className="form-group">
            <label htmlFor="bonuses">البدلات والمكافآت</label>
            <input
              id="bonuses"
              name="bonuses"
              type="number"
              value={teacherSalaryForm.bonuses}
              onChange={(e) => setTeacherSalaryForm({
                ...teacherSalaryForm,
                bonuses: e.target.value
              })}
              className="form-control"
              placeholder="البدلات والمكافآت بالريال"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="deductions">الخصومات</label>
          <input
            id="deductions"
            name="deductions"
            type="number"
            value={teacherSalaryForm.deductions}
            onChange={(e) => setTeacherSalaryForm({
              ...teacherSalaryForm,
              deductions: e.target.value
            })}
            className="form-control"
            placeholder="الخصومات بالريال"
          />
        </div>

        <div className="form-group">
          <label htmlFor="salary-notes">ملاحظات</label>
          <textarea
            id="salary-notes"
            name="notes"
            value={teacherSalaryForm.notes}
            onChange={(e) => setTeacherSalaryForm({
              ...teacherSalaryForm,
              notes: e.target.value
            })}
            className="form-control"
            rows="3"
            placeholder="أي ملاحظات إضافية"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            إضافة الراتب
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => setShowTeacherSalaryForm(false)}
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="subscription-manager-title">
      <div className="subscription-manager" onClick={(e) => e.stopPropagation()}>
        <div className="manager-header">
          <h2 id="subscription-manager-title">إدارة الاشتراكات</h2>
          <button className="close-btn" onClick={onClose} aria-label="إغلاق نافذة إدارة الاشتراكات">×</button>
        </div>

      {isLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>جاري تحميل بيانات الاشتراكات...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>خطأ في تحميل البيانات: {error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => dispatch(fetchQuranData())}
          >
            إعادة المحاولة
          </button>
        </div>
      ) : showAddForm ? (
        renderAddForm()
      ) : showTeacherSalaryForm ? (
        renderTeacherSalaryForm()
      ) : (
        <>
          <div className="manager-tabs">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              النظرة العامة
            </button>
            {selectedLevel && (
              <button 
                className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                تفاصيل {selectedLevel.name}
              </button>
            )}
          </div>

          <div className="manager-content">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'details' && renderLevelDetails()}
          </div>
        </>
      )}
      </div>
    </div>
  );
};

export default SubscriptionManager; 