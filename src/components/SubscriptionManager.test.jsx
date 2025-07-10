import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import SubscriptionManager from './SubscriptionManager';
import quranReducer from '../features/quran/quranSlice';

// Create a mock store for testing
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      quran: quranReducer
    },
    preloadedState: {
      quran: {
        students: [],
        levels: [],
        teachers: [],
        settings: {},
        isLoading: false,
        error: null,
        ...initialState
      }
    }
  });
};

// Mock the notification slice
jest.mock('../features/notifications/notificationsSlice', () => ({
  addNotification: jest.fn()
}));

describe('SubscriptionManager', () => {
  it('renders loading state when data is being fetched', () => {
    const store = createTestStore({ isLoading: true });
    
    render(
      <Provider store={store}>
        <SubscriptionManager onClose={() => {}} />
      </Provider>
    );
    
    expect(screen.getByText('جاري تحميل بيانات الاشتراكات...')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders error state when there is an error', () => {
    const store = createTestStore({ 
      error: 'خطأ في الاتصال بالخادم',
      isLoading: false 
    });
    
    render(
      <Provider store={store}>
        <SubscriptionManager onClose={() => {}} />
      </Provider>
    );
    
    expect(screen.getByText(/خطأ في تحميل البيانات/)).toBeInTheDocument();
    expect(screen.getByText('إعادة المحاولة')).toBeInTheDocument();
  });

  it('renders overview when data is loaded', () => {
    const store = createTestStore({
      students: [
        { id: '1', name: 'أحمد محمد', levelId: 'level-1', status: 'active' }
      ],
      levels: [
        { id: 'level-1', name: 'المستوى الأول', maxStudents: 20, price: 100 }
      ],
      teachers: [
        { id: '1', name: 'فاطمة أحمد', status: 'active' }
      ],
      isLoading: false,
      error: null
    });
    
    render(
      <Provider store={store}>
        <SubscriptionManager onClose={() => {}} />
      </Provider>
    );
    
    expect(screen.getByText('النظرة العامة')).toBeInTheDocument();
    expect(screen.getByText('إجمالي الطلاب')).toBeInTheDocument();
    expect(screen.getByText('المعلمات')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    const store = createTestStore({
      students: [],
      levels: [],
      teachers: [],
      isLoading: false,
      error: null
    });
    
    render(
      <Provider store={store}>
        <SubscriptionManager onClose={() => {}} />
      </Provider>
    );
    
    expect(screen.getByText('النظرة العامة')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // Total students should be 0
  });

  it('handles undefined data gracefully', () => {
    const store = createTestStore({
      students: undefined,
      levels: undefined,
      teachers: undefined,
      isLoading: false,
      error: null
    });
    
    render(
      <Provider store={store}>
        <SubscriptionManager onClose={() => {}} />
      </Provider>
    );
    
    expect(screen.getByText('النظرة العامة')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // Total students should be 0
  });

  it('has proper form field attributes in subscription form', () => {
    const store = createTestStore({
      students: [{ id: '1', name: 'أحمد محمد', status: 'active' }],
      levels: [{ id: 'level-1', name: 'المستوى الأول', maxStudents: 20, price: 100 }],
      isLoading: false,
      error: null
    });
    
    render(
      <Provider store={store}>
        <SubscriptionManager onClose={() => {}} />
      </Provider>
    );
    
    // Click on add subscription button to show the form
    const addButton = screen.getByText('إضافة اشتراك جديد');
    addButton.click();
    
    // Check that form fields have proper id and name attributes
    expect(screen.getByLabelText('الطالب *')).toHaveAttribute('id', 'student-select');
    expect(screen.getByLabelText('الطالب *')).toHaveAttribute('name', 'studentId');
    
    expect(screen.getByLabelText('المستوى *')).toHaveAttribute('id', 'level-select');
    expect(screen.getByLabelText('المستوى *')).toHaveAttribute('name', 'levelId');
    
    expect(screen.getByLabelText('تاريخ البداية')).toHaveAttribute('id', 'start-date');
    expect(screen.getByLabelText('تاريخ البداية')).toHaveAttribute('name', 'startDate');
    
    expect(screen.getByLabelText('تاريخ الانتهاء')).toHaveAttribute('id', 'end-date');
    expect(screen.getByLabelText('تاريخ الانتهاء')).toHaveAttribute('name', 'endDate');
    
    expect(screen.getByLabelText('المبلغ المدفوع *')).toHaveAttribute('id', 'amount');
    expect(screen.getByLabelText('المبلغ المدفوع *')).toHaveAttribute('name', 'amount');
    
    expect(screen.getByLabelText('طريقة الدفع')).toHaveAttribute('id', 'payment-method');
    expect(screen.getByLabelText('طريقة الدفع')).toHaveAttribute('name', 'paymentMethod');
    
    expect(screen.getByLabelText('ملاحظات')).toHaveAttribute('id', 'notes');
    expect(screen.getByLabelText('ملاحظات')).toHaveAttribute('name', 'notes');
  });

  it('has proper form field attributes in teacher salary form', () => {
    const store = createTestStore({
      students: [],
      levels: [],
      teachers: [{ id: '1', name: 'فاطمة أحمد', status: 'active' }],
      isLoading: false,
      error: null
    });
    
    render(
      <Provider store={store}>
        <SubscriptionManager onClose={() => {}} />
      </Provider>
    );
    
    // Click on add teacher salary button to show the form
    const addSalaryButton = screen.getByText('إضافة راتب معلمة');
    addSalaryButton.click();
    
    // Check that form fields have proper id and name attributes
    expect(screen.getByLabelText('المعلمة *')).toHaveAttribute('id', 'teacher-select');
    expect(screen.getByLabelText('المعلمة *')).toHaveAttribute('name', 'teacherId');
    
    expect(screen.getByLabelText('الشهر')).toHaveAttribute('id', 'salary-month');
    expect(screen.getByLabelText('الشهر')).toHaveAttribute('name', 'month');
    
    expect(screen.getByLabelText('السنة')).toHaveAttribute('id', 'salary-year');
    expect(screen.getByLabelText('السنة')).toHaveAttribute('name', 'year');
    
    expect(screen.getByLabelText('الراتب الأساسي *')).toHaveAttribute('id', 'base-salary');
    expect(screen.getByLabelText('الراتب الأساسي *')).toHaveAttribute('name', 'baseSalary');
    
    expect(screen.getByLabelText('البدلات والمكافآت')).toHaveAttribute('id', 'bonuses');
    expect(screen.getByLabelText('البدلات والمكافآت')).toHaveAttribute('name', 'bonuses');
    
    expect(screen.getByLabelText('الخصومات')).toHaveAttribute('id', 'deductions');
    expect(screen.getByLabelText('الخصومات')).toHaveAttribute('name', 'deductions');
    
    expect(screen.getByLabelText('ملاحظات')).toHaveAttribute('id', 'salary-notes');
    expect(screen.getByLabelText('ملاحظات')).toHaveAttribute('name', 'notes');
  });
}); 