import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCompetition, updateCompetitionResults } from '../features/quran/quranSlice';
import { addNotification } from '../features/notifications/notificationsSlice';
import './CompetitionManager.css';

const CompetitionManager = ({ onClose }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('create');
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [showTopStudents, setShowTopStudents] = useState(false);
  
  const competitions = useSelector(state => state.quran.competitions);
  const students = useSelector(state => state.quran.students);
  const levels = useSelector(state => state.quran.levels);

  const [competitionForm, setCompetitionForm] = useState({
    title: '',
    levelId: '',
    description: '',
    startDate: '',
    endDate: '',
    maxParticipants: '',
    prizes: '',
    criteria: '',
    judges: ''
  });

  const [resultsForm, setResultsForm] = useState({
    participants: [],
    scores: {},
    winners: []
  });

  const handleCreateCompetition = async (e) => {
    e.preventDefault();
    
    if (!competitionForm.title || !competitionForm.levelId) {
      dispatch(addNotification({
        type: 'error',
        message: 'يرجى ملء جميع الحقول المطلوبة',
        duration: 3000
      }));
      return;
    }

    try {
      await dispatch(createCompetition(competitionForm)).unwrap();
      setCompetitionForm({
        title: '',
        levelId: '',
        description: '',
        startDate: '',
        endDate: '',
        maxParticipants: '',
        prizes: '',
        criteria: '',
        judges: ''
      });
      
      dispatch(addNotification({
        type: 'success',
        message: 'تم إنشاء المسابقة بنجاح',
        duration: 3000
      }));
    } catch (error) {
      console.error('فشل في إنشاء المسابقة:', error);
    }
  };

  const handleAddParticipant = (studentId) => {
    if (!resultsForm.participants.includes(studentId)) {
      setResultsForm({
        ...resultsForm,
        participants: [...resultsForm.participants, studentId],
        scores: {
          ...resultsForm.scores,
          [studentId]: { memorization: 0, tajweed: 0, presentation: 0 }
        }
      });
    }
  };

  const handleUpdateScore = (studentId, category, score) => {
    setResultsForm({
      ...resultsForm,
      scores: {
        ...resultsForm.scores,
        [studentId]: {
          ...resultsForm.scores[studentId],
          [category]: parseInt(score) || 0
        }
      }
    });
  };

  const handleSaveResults = async () => {
    if (!selectedCompetition) return;

    try {
      const results = Object.entries(resultsForm.scores).map(([studentId, scores]) => {
        const student = students.find(s => s.id === studentId);
        const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
        return {
          studentId,
          studentName: student?.name || 'غير معروف',
          scores,
          totalScore,
          rank: 0
        };
      }).sort((a, b) => b.totalScore - a.totalScore);

      // إضافة الترتيب
      results.forEach((result, index) => {
        result.rank = index + 1;
      });

      await dispatch(updateCompetitionResults({
        competitionId: selectedCompetition.id,
        results
      })).unwrap();

      dispatch(addNotification({
        type: 'success',
        message: 'تم حفظ نتائج المسابقة بنجاح',
        duration: 3000
      }));
    } catch (error) {
      console.error('فشل في حفظ النتائج:', error);
    }
  };

  const getLevelName = (levelId) => {
    const level = levels.find(l => l.id === levelId);
    return level ? level.name : 'غير محدد';
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'غير معروف';
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'غير محدد';
  };

  // دالة لحساب الأوائل من كل مستوى
  const getTopStudentsByLevel = () => {
    const topStudents = {};
    
    levels.forEach(level => {
      const levelStudents = students.filter(student => student.levelId === level.id);
      
      // ترتيب الطلاب حسب التقدم (النسبة المئوية)
      const sortedStudents = levelStudents
        .sort((a, b) => (b.progress || 0) - (a.progress || 0))
        .slice(0, 5); // أفضل 5 طلاب
      
      topStudents[level.id] = {
        level,
        students: sortedStudents
      };
    });
    
    return topStudents;
  };

  // دالة لحساب الأوائل الإجماليين
  const getOverallTopStudents = () => {
    return students
      .sort((a, b) => (b.progress || 0) - (a.progress || 0))
      .slice(0, 10); // أفضل 10 طلاب إجمالي
  };

  const renderCreateCompetition = () => (
    <div className="competition-form">
      <h3>إنشاء مسابقة جديدة</h3>
      <form onSubmit={handleCreateCompetition}>
        <div className="form-group">
          <label>عنوان المسابقة *</label>
          <input
            type="text"
            value={competitionForm.title}
            onChange={(e) => setCompetitionForm({
              ...competitionForm,
              title: e.target.value
            })}
            className="form-control"
            required
            placeholder="مثال: مسابقة الحفظ للمستوى الأول"
          />
        </div>

        <div className="form-group">
          <label>المستوى المستهدف *</label>
          <select
            value={competitionForm.levelId}
            onChange={(e) => setCompetitionForm({
              ...competitionForm,
              levelId: e.target.value
            })}
            className="form-control"
            required
          >
            <option value="">اختر المستوى</option>
            {levels.map(level => (
              <option key={level.id} value={level.id}>
                {level.name} - {level.description}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>وصف المسابقة</label>
          <textarea
            value={competitionForm.description}
            onChange={(e) => setCompetitionForm({
              ...competitionForm,
              description: e.target.value
            })}
            className="form-control"
            rows="3"
            placeholder="وصف تفصيلي للمسابقة وأهدافها"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>تاريخ البداية</label>
            <input
              type="date"
              value={competitionForm.startDate}
              onChange={(e) => setCompetitionForm({
                ...competitionForm,
                startDate: e.target.value
              })}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>تاريخ النهاية</label>
            <input
              type="date"
              value={competitionForm.endDate}
              onChange={(e) => setCompetitionForm({
                ...competitionForm,
                endDate: e.target.value
              })}
              className="form-control"
            />
          </div>
        </div>

        <div className="form-group">
          <label>الحد الأقصى للمشاركين</label>
          <input
            type="number"
            value={competitionForm.maxParticipants}
            onChange={(e) => setCompetitionForm({
              ...competitionForm,
              maxParticipants: e.target.value
            })}
            className="form-control"
            placeholder="عدد المشاركين المسموح"
          />
        </div>

        <div className="form-group">
          <label>الجوائز</label>
          <textarea
            value={competitionForm.prizes}
            onChange={(e) => setCompetitionForm({
              ...competitionForm,
              prizes: e.target.value
            })}
            className="form-control"
            rows="3"
            placeholder="وصف الجوائز المقدمة للمراكز الأولى"
          />
        </div>

        <div className="form-group">
          <label>معايير التقييم</label>
          <textarea
            value={competitionForm.criteria}
            onChange={(e) => setCompetitionForm({
              ...competitionForm,
              criteria: e.target.value
            })}
            className="form-control"
            rows="3"
            placeholder="معايير تقييم المشاركين (الحفظ، التجويد، العرض)"
          />
        </div>

        <div className="form-group">
          <label>اللجنة التحكيمية</label>
          <textarea
            value={competitionForm.judges}
            onChange={(e) => setCompetitionForm({
              ...competitionForm,
              judges: e.target.value
            })}
            className="form-control"
            rows="2"
            placeholder="أسماء أعضاء لجنة التحكيم"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            إنشاء المسابقة
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );

  const renderManageResults = () => (
    <div className="results-manager">
      <h3>إدارة نتائج المسابقات</h3>
      
      <div className="competition-selector">
        <label>اختر المسابقة:</label>
        <select
          value={selectedCompetition?.id || ''}
          onChange={(e) => {
            const competition = competitions.find(c => c.id === e.target.value);
            setSelectedCompetition(competition);
            if (competition) {
              setResultsForm({
                participants: competition.participants || [],
                scores: competition.results?.reduce((acc, result) => {
                  acc[result.studentId] = result.scores;
                  return acc;
                }, {}) || {},
                winners: competition.results?.filter(r => r.rank <= 3) || []
              });
            }
          }}
          className="form-control"
        >
          <option value="">اختر مسابقة</option>
          {competitions.map(competition => (
            <option key={competition.id} value={competition.id}>
              {competition.title} - {getLevelName(competition.levelId)}
            </option>
          ))}
        </select>
      </div>

      {selectedCompetition && (
        <div className="competition-details">
          <h4>{selectedCompetition.title}</h4>
          <p><strong>المستوى:</strong> {getLevelName(selectedCompetition.levelId)}</p>
          <p><strong>الوصف:</strong> {selectedCompetition.description}</p>
          
          <div className="participants-section">
            <h5>إضافة المشاركين</h5>
            <div className="students-list">
              {students
                .filter(student => student.levelId === selectedCompetition.levelId)
                .map(student => (
                  <div key={student.id} className="student-item">
                    <span>{student.name}</span>
                    <button
                      type="button"
                      className={`btn btn-sm ${resultsForm.participants.includes(student.id) ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => handleAddParticipant(student.id)}
                      disabled={resultsForm.participants.includes(student.id)}
                    >
                      {resultsForm.participants.includes(student.id) ? 'مضاف' : 'إضافة'}
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {resultsForm.participants.length > 0 && (
            <div className="scoring-section">
              <h5>تقييم المشاركين</h5>
              <div className="scoring-table">
                <table>
                  <thead>
                    <tr>
                      <th>الطالب</th>
                      <th>الحفظ (25)</th>
                      <th>التجويد (25)</th>
                      <th>العرض (25)</th>
                      <th>المجموع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultsForm.participants.map(studentId => {
                      const scores = resultsForm.scores[studentId] || { memorization: 0, tajweed: 0, presentation: 0 };
                      const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
                      
                      return (
                        <tr key={studentId}>
                          <td>{getStudentName(studentId)}</td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max="25"
                              value={scores.memorization}
                              onChange={(e) => handleUpdateScore(studentId, 'memorization', e.target.value)}
                              className="score-input"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max="25"
                              value={scores.tajweed}
                              onChange={(e) => handleUpdateScore(studentId, 'tajweed', e.target.value)}
                              className="score-input"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max="25"
                              value={scores.presentation}
                              onChange={(e) => handleUpdateScore(studentId, 'presentation', e.target.value)}
                              className="score-input"
                            />
                          </td>
                          <td className="total-score">{total}/75</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-success" onClick={handleSaveResults}>
                  حفظ النتائج
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderViewResults = () => (
    <div className="results-viewer">
      <h3>عرض نتائج المسابقات</h3>
      
      <div className="competitions-results">
        {competitions.map(competition => (
          <div key={competition.id} className="competition-result-card">
            <div className="competition-header">
              <h4>{competition.title}</h4>
              <span className={`status-badge ${competition.status}`}>
                {competition.status === 'active' ? 'نشطة' : 'منتهية'}
              </span>
            </div>
            
            <div className="competition-info">
              <p><strong>المستوى:</strong> {getLevelName(competition.levelId)}</p>
              <p><strong>عدد المشاركين:</strong> {competition.participants?.length || 0}</p>
            </div>

            {competition.results && competition.results.length > 0 && (
              <div className="results-table">
                <h5>النتائج النهائية</h5>
                <table>
                  <thead>
                    <tr>
                      <th>الترتيب</th>
                      <th>اسم الطالب</th>
                      <th>المجموع</th>
                      <th>الجائزة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {competition.results
                      .sort((a, b) => a.rank - b.rank)
                      .slice(0, 5)
                      .map((result, index) => (
                        <tr key={result.studentId} className={index < 3 ? 'winner-row' : ''}>
                          <td className="rank">{result.rank}</td>
                          <td>{result.studentName}</td>
                          <td>{result.totalScore}/75</td>
                          <td>
                            {index === 0 && '🥇 المركز الأول'}
                            {index === 1 && '🥈 المركز الثاني'}
                            {index === 2 && '🥉 المركز الثالث'}
                            {index > 2 && 'شهادة مشاركة'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderTopStudents = () => {
    const topStudentsByLevel = getTopStudentsByLevel();
    const overallTopStudents = getOverallTopStudents();

    return (
      <div className="top-students-viewer">
        <h3>الأوائل من كل مستوى</h3>
        
        {/* الأوائل الإجماليين */}
        <div className="overall-top-section">
          <h4>🏆 الأوائل الإجماليين (أفضل 10 طلاب)</h4>
          <div className="top-students-table">
            <table>
              <thead>
                <tr>
                  <th>الترتيب</th>
                  <th>اسم الطالب</th>
                  <th>المستوى</th>
                  <th>نسبة التقدم</th>
                  <th>المعلمة</th>
                </tr>
              </thead>
              <tbody>
                {overallTopStudents.map((student, index) => (
                  <tr key={student.id} className={index < 3 ? 'top-three' : ''}>
                    <td className="rank">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index + 1}
                    </td>
                    <td>{student.name}</td>
                    <td>{getLevelName(student.levelId)}</td>
                    <td>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${student.progress || 0}%` }}
                        ></div>
                        <span>{student.progress || 0}%</span>
                      </div>
                    </td>
                    <td>{getTeacherName(student.teacherId)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* الأوائل من كل مستوى */}
        <div className="level-top-sections">
          <h4>📊 الأوائل من كل مستوى</h4>
          <div className="levels-top-grid">
            {Object.entries(topStudentsByLevel).map(([levelId, data]) => (
              <div key={levelId} className="level-top-card">
                <div className="level-top-header">
                  <h5>{data.level.name}</h5>
                  <span className="level-student-count">
                    {data.students.length} طالب
                  </span>
                </div>
                
                <div className="level-top-students">
                  {data.students.length > 0 ? (
                    data.students.map((student, index) => (
                      <div key={student.id} className="top-student-item">
                        <div className="student-rank">
                          {index === 0 && '🥇'}
                          {index === 1 && '🥈'}
                          {index === 2 && '🥉'}
                          {index + 1}
                        </div>
                        <div className="student-info">
                          <div className="student-name">{student.name}</div>
                          <div className="student-progress">
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{ width: `${student.progress || 0}%` }}
                              ></div>
                              <span>{student.progress || 0}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-students">
                      لا يوجد طلاب في هذا المستوى
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* إحصائيات إضافية */}
        <div className="top-stats-section">
          <h4>📈 إحصائيات الأوائل</h4>
          <div className="top-stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👑</div>
              <div className="stat-content">
                <h5>أفضل طالب</h5>
                <span className="stat-value">
                  {overallTopStudents[0]?.name || 'لا يوجد'}
                </span>
                <span className="stat-subtitle">
                  {overallTopStudents[0]?.progress || 0}% تقدم
                </span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h5>متوسط التقدم</h5>
                <span className="stat-value">
                  {students.length > 0 
                    ? Math.round(students.reduce((sum, s) => sum + (s.progress || 0), 0) / students.length)
                    : 0}%
                </span>
                <span className="stat-subtitle">
                  من إجمالي {students.length} طالب
                </span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <h5>الطلاب المتفوقون</h5>
                <span className="stat-value">
                  {students.filter(s => (s.progress || 0) >= 80).length}
                </span>
                <span className="stat-subtitle">
                  تقدم 80% أو أكثر
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="competition-manager">
      <div className="manager-header">
        <h2>إدارة المسابقات</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="manager-tabs">
        <button 
          className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          إنشاء مسابقة
        </button>
        <button 
          className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          إدارة النتائج
        </button>
        <button 
          className={`tab-btn ${activeTab === 'view' ? 'active' : ''}`}
          onClick={() => setActiveTab('view')}
        >
          عرض النتائج
        </button>
        <button 
          className={`tab-btn ${activeTab === 'top' ? 'active' : ''}`}
          onClick={() => setActiveTab('top')}
        >
          الأوائل من كل مستوى
        </button>
      </div>

      <div className="manager-content">
        {activeTab === 'create' && renderCreateCompetition()}
        {activeTab === 'manage' && renderManageResults()}
        {activeTab === 'view' && renderViewResults()}
        {activeTab === 'top' && renderTopStudents()}
      </div>
    </div>
  );
};

export default CompetitionManager; 