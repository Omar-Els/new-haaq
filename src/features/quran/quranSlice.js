import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { addNotification } from '../notifications/notificationsSlice';
import { mongoService } from '../../services/mongoService';
import { offlineService } from '../../services/offlineService';

// دالة لإنشاء معرف فريد
const generateId = (prefix) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${random}`;
};

// دالة لإنشاء معرف طالب
const generateStudentId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `STU-${timestamp}-${random}`;
};

// دالة لإنشاء معرف معلمة
const generateTeacherId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `TCH-${timestamp}-${random}`;
};

// دالة لإنشاء معرف مسابقة
const generateCompetitionId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `COMP-${timestamp}-${random}`;
};

// حفظ البيانات في التخزين المحلي
const saveToStorage = async (key, data) => {
  try {
    const dataString = JSON.stringify(data);
    const sizeInMB = (dataString.length / 1024 / 1024).toFixed(2);
    console.log(`💾 حفظ ${key} في localStorage (${sizeInMB} MB)`);
    
    if (dataString.length > 4 * 1024 * 1024) { // 4MB limit
      console.warn('⚠️ البيانات كبيرة جداً، سيتم الاحتفاظ بالبيانات الأساسية فقط');
      return false;
    }
    
    localStorage.setItem(key, dataString);
    return true;
  } catch (error) {
    console.error('❌ خطأ في حفظ البيانات:', error);
    return false;
  }
};

// تحميل البيانات من التخزين المحلي
const loadFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    console.log(`📊 تم تحميل ${key} من localStorage`);
    return parsed;
  } catch (error) {
    console.error('❌ خطأ في تحميل البيانات:', error);
    return null;
  }
};

// Async thunks
export const fetchQuranData = createAsyncThunk(
  'quran/fetchQuranData',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      console.log('🔄 تحميل بيانات نظام تحفيظ القرآن...');

      // محاولة تحميل من MongoDB أولاً
      let response;
      try {
        response = await mongoService.getQuranData();
        if (response && response.success) {
          console.log('✅ تم تحميل بيانات القرآن من MongoDB');
          return response.data;
        }
      } catch (mongoError) {
        console.warn('⚠️ فشل الاتصال بـ MongoDB:', mongoError.message);
      }

      // إذا فشل MongoDB، استخدم البيانات المحلية
      console.log('🔄 التبديل إلى البيانات المحلية...');
      
      const localData = {
        students: loadFromStorage('quranStudents') || [],
        teachers: loadFromStorage('quranTeachers') || [],
        competitions: loadFromStorage('quranCompetitions') || [],
        levels: loadFromStorage('quranLevels') || getDefaultLevels(),
        settings: loadFromStorage('quranSettings') || getDefaultSettings(),
        subscriptions: loadFromStorage('quranSubscriptions') || []
      };

      // إشعار المستخدم بالعمل في الوضع المحلي
      dispatch(addNotification({
        type: 'info',
        message: 'يتم العمل في الوضع المحلي. البيانات محفوظة في المتصفح.',
        duration: 4000
      }));

      return localData;
    } catch (error) {
      console.error('❌ خطأ في جلب بيانات القرآن:', error);
      return rejectWithValue(error.message);
    }
  }
);

// دالة للحصول على المستويات الافتراضية
const getDefaultLevels = () => [
  {
    id: 'level-1',
    name: 'المستوى الأول',
    description: 'الحفظ من سورة الفاتحة إلى سورة البقرة',
    surahs: ['الفاتحة', 'البقرة'],
    maxStudents: 20,
    price: 100,
    duration: '3 أشهر'
  },
  {
    id: 'level-2',
    name: 'المستوى الثاني',
    description: 'الحفظ من سورة آل عمران إلى سورة النساء',
    surahs: ['آل عمران', 'النساء'],
    maxStudents: 15,
    price: 150,
    duration: '4 أشهر'
  },
  {
    id: 'level-3',
    name: 'المستوى الثالث',
    description: 'الحفظ من سورة المائدة إلى سورة الأنعام',
    surahs: ['المائدة', 'الأنعام'],
    maxStudents: 12,
    price: 200,
    duration: '5 أشهر'
  },
  {
    id: 'level-4',
    name: 'المستوى الرابع',
    description: 'الحفظ من سورة الأعراف إلى سورة التوبة',
    surahs: ['الأعراف', 'الأنفال', 'التوبة'],
    maxStudents: 10,
    price: 250,
    duration: '6 أشهر'
  },
  {
    id: 'level-5',
    name: 'المستوى الخامس',
    description: 'الحفظ من سورة يونس إلى سورة يوسف',
    surahs: ['يونس', 'هود', 'يوسف'],
    maxStudents: 8,
    price: 300,
    duration: '7 أشهر'
  }
];

// دالة للحصول على الإعدادات الافتراضية
const getDefaultSettings = () => ({
  maxTotalStudents: 100,
  maxStudentsPerLevel: 20,
  maxStudentsPerTeacher: 15,
  competitionEnabled: true,
  subscriptionEnabled: true,
  autoAssignment: true,
  notificationEnabled: true,
  backupEnabled: true
});

export const addStudent = createAsyncThunk(
  'quran/addStudent',
  async (studentData, { rejectWithValue, getState, dispatch }) => {
    try {
      console.log('🔄 إضافة طالب جديد...');

      const state = getState();
      const { students, settings } = state.quran;

      // التحقق من الحد الأقصى للطلاب
      if (students.length >= settings.maxTotalStudents) {
        throw new Error(`تم الوصول للحد الأقصى للطلاب (${settings.maxTotalStudents})`);
      }

      // التحقق من الحد الأقصى للمستوى المحدد
      const levelStudents = students.filter(s => s.levelId === studentData.levelId);
      const level = state.quran.levels.find(l => l.id === studentData.levelId);
      
      if (levelStudents.length >= level.maxStudents) {
        throw new Error(`تم الوصول للحد الأقصى للمستوى ${level.name} (${level.maxStudents} طالب)`);
      }

      const newStudent = {
        ...studentData,
        id: generateStudentId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        progress: 0,
        attendance: [],
        evaluations: [],
        payments: []
      };

      // محاولة حفظ في MongoDB أولاً
      try {
        await mongoService.addQuranStudent(newStudent);
        console.log('✅ تم إضافة الطالب إلى MongoDB');
      } catch (mongoError) {
        console.warn('⚠️ فشل في إضافة الطالب إلى MongoDB، استخدام التخزين المحلي');
        const updatedStudents = [...students, newStudent];
        await saveToStorage('quranStudents', updatedStudents);
      }

      dispatch(addNotification({
        type: 'success',
        message: `تم إضافة الطالب ${newStudent.name} بنجاح`,
        duration: 5000
      }));

      return newStudent;
    } catch (error) {
      console.error('❌ خطأ في إضافة الطالب:', error);
      
      dispatch(addNotification({
        type: 'error',
        message: `فشل في إضافة الطالب: ${error.message}`,
        duration: 5000
      }));

      return rejectWithValue(error.message);
    }
  }
);

export const addTeacher = createAsyncThunk(
  'quran/addTeacher',
  async (teacherData, { rejectWithValue, dispatch }) => {
    try {
      console.log('🔄 إضافة معلمة جديدة...');

      const newTeacher = {
        ...teacherData,
        id: generateTeacherId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        students: [],
        schedule: [],
        qualifications: teacherData.qualifications || [],
        experience: teacherData.experience || 0
      };

      // محاولة حفظ في MongoDB أولاً
      try {
        await mongoService.addQuranTeacher(newTeacher);
        console.log('✅ تم إضافة المعلمة إلى MongoDB');
      } catch (mongoError) {
        console.warn('⚠️ فشل في إضافة المعلمة إلى MongoDB، استخدام التخزين المحلي');
        const currentTeachers = loadFromStorage('quranTeachers') || [];
        const updatedTeachers = [...currentTeachers, newTeacher];
        await saveToStorage('quranTeachers', updatedTeachers);
      }

      dispatch(addNotification({
        type: 'success',
        message: `تم إضافة المعلمة ${newTeacher.name} بنجاح`,
        duration: 5000
      }));

      return newTeacher;
    } catch (error) {
      console.error('❌ خطأ في إضافة المعلمة:', error);
      
      dispatch(addNotification({
        type: 'error',
        message: `فشل في إضافة المعلمة: ${error.message}`,
        duration: 5000
      }));

      return rejectWithValue(error.message);
    }
  }
);

export const createCompetition = createAsyncThunk(
  'quran/createCompetition',
  async (competitionData, { rejectWithValue, dispatch }) => {
    try {
      console.log('🔄 إنشاء مسابقة جديدة...');

      const newCompetition = {
        ...competitionData,
        id: generateCompetitionId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        participants: [],
        results: [],
        prizes: competitionData.prizes || []
      };

      // محاولة حفظ في MongoDB أولاً
      try {
        await mongoService.addQuranCompetition(newCompetition);
        console.log('✅ تم إنشاء المسابقة في MongoDB');
      } catch (mongoError) {
        console.warn('⚠️ فشل في إنشاء المسابقة في MongoDB، استخدام التخزين المحلي');
        const currentCompetitions = loadFromStorage('quranCompetitions') || [];
        const updatedCompetitions = [...currentCompetitions, newCompetition];
        await saveToStorage('quranCompetitions', updatedCompetitions);
      }

      dispatch(addNotification({
        type: 'success',
        message: `تم إنشاء مسابقة ${newCompetition.title} بنجاح`,
        duration: 5000
      }));

      return newCompetition;
    } catch (error) {
      console.error('❌ خطأ في إنشاء المسابقة:', error);
      
      dispatch(addNotification({
        type: 'error',
        message: `فشل في إنشاء المسابقة: ${error.message}`,
        duration: 5000
      }));

      return rejectWithValue(error.message);
    }
  }
);

export const updateQuranSettings = createAsyncThunk(
  'quran/updateQuranSettings',
  async (settings, { rejectWithValue, dispatch }) => {
    try {
      console.log('🔄 تحديث إعدادات نظام القرآن...');

      // محاولة حفظ في MongoDB أولاً
      try {
        await mongoService.updateQuranSettings(settings);
        console.log('✅ تم تحديث الإعدادات في MongoDB');
      } catch (mongoError) {
        console.warn('⚠️ فشل في تحديث الإعدادات في MongoDB، استخدام التخزين المحلي');
        await saveToStorage('quranSettings', settings);
      }

      dispatch(addNotification({
        type: 'success',
        message: 'تم تحديث إعدادات نظام القرآن بنجاح',
        duration: 3000
      }));

      return settings;
    } catch (error) {
      console.error('❌ خطأ في تحديث الإعدادات:', error);
      
      dispatch(addNotification({
        type: 'error',
        message: `فشل في تحديث الإعدادات: ${error.message}`,
        duration: 5000
      }));

      return rejectWithValue(error.message);
    }
  }
);

const quranSlice = createSlice({
  name: 'quran',
  initialState: {
    students: [],
    teachers: [],
    competitions: [],
    levels: getDefaultLevels(),
    settings: getDefaultSettings(),
    subscriptions: [],
    isLoading: false,
    error: null,
    filter: {
      studentName: '',
      teacherName: '',
      levelId: '',
      status: ''
    }
  },
  reducers: {
    setFilter: (state, action) => {
      state.filter = {
        ...state.filter,
        ...action.payload
      };
    },
    clearFilters: (state) => {
      state.filter = {
        studentName: '',
        teacherName: '',
        levelId: '',
        status: ''
      };
    },
    updateStudentProgress: (state, action) => {
      const { studentId, progress, evaluation } = action.payload;
      const student = state.students.find(s => s.id === studentId);
      if (student) {
        student.progress = progress;
        student.updatedAt = new Date().toISOString();
        if (evaluation) {
          student.evaluations.push({
            ...evaluation,
            date: new Date().toISOString()
          });
        }
      }
    },
    addStudentAttendance: (state, action) => {
      const { studentId, date, present } = action.payload;
      const student = state.students.find(s => s.id === studentId);
      if (student) {
        student.attendance.push({
          date,
          present,
          timestamp: new Date().toISOString()
        });
      }
    },
    updateCompetitionResults: (state, action) => {
      const { competitionId, results } = action.payload;
      const competition = state.competitions.find(c => c.id === competitionId);
      if (competition) {
        competition.results = results;
        competition.updatedAt = new Date().toISOString();
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Quran Data
      .addCase(fetchQuranData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuranData.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;
        
        if (data.students) state.students = data.students;
        if (data.teachers) state.teachers = data.teachers;
        if (data.competitions) state.competitions = data.competitions;
        if (data.levels) state.levels = data.levels;
        if (data.settings) state.settings = data.settings;
        if (data.subscriptions) state.subscriptions = data.subscriptions;
        
        console.log(`✅ تم تحميل بيانات القرآن: ${state.students.length} طالب، ${state.teachers.length} معلمة`);
      })
      .addCase(fetchQuranData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add Student
      .addCase(addStudent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addStudent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.students.unshift(action.payload);
      })
      .addCase(addStudent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add Teacher
      .addCase(addTeacher.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addTeacher.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teachers.unshift(action.payload);
      })
      .addCase(addTeacher.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Competition
      .addCase(createCompetition.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCompetition.fulfilled, (state, action) => {
        state.isLoading = false;
        state.competitions.unshift(action.payload);
      })
      .addCase(createCompetition.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Settings
      .addCase(updateQuranSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateQuranSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
      })
      .addCase(updateQuranSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  setFilter, 
  clearFilters, 
  updateStudentProgress, 
  addStudentAttendance, 
  updateCompetitionResults 
} = quranSlice.actions;

// Selectors with safety checks and memoization
export const selectQuranStudents = createSelector(
  [(state) => state.quran?.students],
  (students) => students || []
);

export const selectQuranTeachers = createSelector(
  [(state) => state.quran?.teachers],
  (teachers) => teachers || []
);

export const selectQuranCompetitions = createSelector(
  [(state) => state.quran?.competitions],
  (competitions) => competitions || []
);

export const selectQuranLevels = createSelector(
  [(state) => state.quran?.levels],
  (levels) => levels || []
);

export const selectQuranSettings = createSelector(
  [(state) => state.quran?.settings],
  (settings) => settings || {}
);

export const selectQuranSubscriptions = createSelector(
  [(state) => state.quran?.subscriptions],
  (subscriptions) => subscriptions || []
);

export const selectQuranLoading = createSelector(
  [(state) => state.quran?.isLoading],
  (isLoading) => isLoading || false
);

export const selectQuranError = createSelector(
  [(state) => state.quran?.error],
  (error) => error || null
);

export const selectQuranFilter = createSelector(
  [(state) => state.quran?.filter],
  (filter) => filter || {
    studentName: '',
    teacherName: '',
    levelId: '',
    status: ''
  }
);

// Memoized selectors with safety checks
export const selectFilteredStudents = createSelector(
  [selectQuranStudents, selectQuranFilter],
  (students, filter) => {
    if (!Array.isArray(students)) return [];
    if (!filter) return students;
    
    return students.filter(student => {
      const nameMatch = !filter.studentName || 
        (student.name && student.name.toLowerCase().includes(filter.studentName.toLowerCase()));
      const levelMatch = !filter.levelId || student.levelId === filter.levelId;
      const statusMatch = !filter.status || student.status === filter.status;
      
      return nameMatch && levelMatch && statusMatch;
    });
  }
);

export const selectFilteredTeachers = createSelector(
  [selectQuranTeachers, selectQuranFilter],
  (teachers, filter) => {
    if (!Array.isArray(teachers)) return [];
    if (!filter) return teachers;
    
    return teachers.filter(teacher => {
      const nameMatch = !filter.teacherName || 
        (teacher.name && teacher.name.toLowerCase().includes(filter.teacherName.toLowerCase()));
      const statusMatch = !filter.status || teacher.status === filter.status;
      
      return nameMatch && statusMatch;
    });
  }
);

export const selectStudentsByLevel = createSelector(
  [selectQuranStudents, (state, levelId) => levelId],
  (students, levelId) => {
    if (!Array.isArray(students)) return [];
    if (!levelId) return students;
    return students.filter(student => student.levelId === levelId);
  }
);

export const selectTeacherStudents = createSelector(
  [selectQuranStudents, (state, teacherId) => teacherId],
  (students, teacherId) => {
    if (!Array.isArray(students)) return [];
    if (!teacherId) return students;
    return students.filter(student => student.teacherId === teacherId);
  }
);

export const selectActiveCompetitions = createSelector(
  [selectQuranCompetitions],
  (competitions) => {
    if (!Array.isArray(competitions)) return [];
    return competitions.filter(comp => comp.status === 'active');
  }
);

export const selectLevelById = createSelector(
  [selectQuranLevels, (state, levelId) => levelId],
  (levels, levelId) => {
    if (!Array.isArray(levels)) return null;
    if (!levelId) return null;
    return levels.find(level => level.id === levelId);
  }
);

export default quranSlice.reducer; 