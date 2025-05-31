import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Helper functions for localStorage
const getTransactionsFromStorage = () => {
  try {
    const transactions = localStorage.getItem('transactions');
    if (transactions) {
      return JSON.parse(transactions);
    } else {
      // Initial empty array if no data exists
      return [];
    }
  } catch (error) {
    console.error('Error getting transactions from storage:', error);
    return [];
  }
};

const saveTransactionsToStorage = (transactions) => {
  try {
    const dataString = JSON.stringify(transactions);

    // Check size before saving
    const sizeInMB = (dataString.length / 1024 / 1024).toFixed(2);
    console.log(`💾 حفظ ${transactions.length} معاملة مالية (${sizeInMB} MB)`);

    // If data is too large, keep only recent transactions
    if (dataString.length > 2 * 1024 * 1024) { // 2MB limit for transactions
      console.warn('⚠️ المعاملات المالية كبيرة جداً، سيتم الاحتفاظ بآخر 500 معاملة فقط');
      const recentTransactions = transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 500);

      localStorage.setItem('transactions', JSON.stringify(recentTransactions));

      // Save older transactions to backup
      const olderTransactions = transactions.slice(500);
      if (olderTransactions.length > 0) {
        try {
          localStorage.setItem('transactions_backup', JSON.stringify(olderTransactions));
        } catch (backupError) {
          console.warn('⚠️ لا يمكن حفظ المعاملات القديمة');
        }
      }
    } else {
      localStorage.setItem('transactions', dataString);
    }

    console.log('✅ تم حفظ المعاملات المالية بنجاح');
  } catch (error) {
    console.error('❌ خطأ في حفظ المعاملات المالية:', error);

    if (error.name === 'QuotaExceededError') {
      console.warn('🧹 تنظيف localStorage لتوفير مساحة للمعاملات...');

      // Clear non-essential data
      localStorage.removeItem('transactions_backup');
      localStorage.removeItem('notifications');

      // Try saving with only recent essential transactions
      try {
        const essentialTransactions = transactions
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 200)
          .map(t => ({
            id: t.id,
            type: t.type,
            amount: t.amount,
            category: t.category,
            description: t.description,
            date: t.date
          }));

        localStorage.setItem('transactions', JSON.stringify(essentialTransactions));
        console.log('✅ تم حفظ آخر 200 معاملة أساسية فقط');

        alert('تم حفظ آخر 200 معاملة مالية فقط بسبب امتلاء مساحة التخزين.');
      } catch (finalError) {
        console.error('❌ فشل في حفظ المعاملات نهائياً:', finalError);
        alert('خطأ: لا يمكن حفظ المعاملات المالية. مساحة التخزين ممتلئة.');
      }
    }
  }
};

// Async thunks
export const fetchTransactions = createAsyncThunk(
  'finance/fetchTransactions',
  async (_, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // For now, we'll use localStorage
      const transactions = getTransactionsFromStorage();
      return transactions;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addTransaction = createAsyncThunk(
  'finance/addTransaction',
  async (transaction, { rejectWithValue, getState }) => {
    try {
      // Add ID and timestamp
      const newTransaction = {
        ...transaction,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };

      // Get current transactions and add the new one
      const currentTransactions = getState().finance.transactions;
      const updatedTransactions = [newTransaction, ...currentTransactions];

      // Save to localStorage
      saveTransactionsToStorage(updatedTransactions);

      return newTransaction;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'finance/deleteTransaction',
  async (transactionId, { rejectWithValue, getState }) => {
    try {
      // Get current transactions and filter out the one to delete
      const currentTransactions = getState().finance.transactions;
      const updatedTransactions = currentTransactions.filter(
        transaction => transaction.id !== transactionId
      );

      // Save to localStorage
      saveTransactionsToStorage(updatedTransactions);

      return transactionId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// استرجاع المعاملات من التخزين المحلي عند بدء التطبيق
const savedTransactions = getTransactionsFromStorage();

// حساب الإحصائيات الأولية
const calculateInitialStats = (transactions) => {
  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach(transaction => {
    const amount = parseFloat(transaction.amount);
    if (transaction.type === 'income') {
      totalIncome += amount;
    } else {
      totalExpenses += amount;
    }
  });

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses
  };
};

// Initial state with transactions from localStorage
const initialState = {
  transactions: savedTransactions,
  isLoading: false,
  error: null,
  stats: calculateInitialStats(savedTransactions)
};

// Slice
const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    calculateStats: (state) => {
      // Calculate financial statistics
      let totalIncome = 0;
      let totalExpenses = 0;

      state.transactions.forEach(transaction => {
        const amount = parseFloat(transaction.amount);
        if (transaction.type === 'income') {
          totalIncome += amount;
        } else {
          totalExpenses += amount;
        }
      });

      state.stats = {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Add transaction
      .addCase(addTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = [action.payload, ...state.transactions];
      })
      .addCase(addTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete transaction
      .addCase(deleteTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = state.transactions.filter(
          transaction => transaction.id !== action.payload
        );
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

// Actions
export const { calculateStats } = financeSlice.actions;

// Selectors
export const selectAllTransactions = (state) => state.finance.transactions;
export const selectFinanceStats = (state) => state.finance.stats;
export const selectFinanceLoading = (state) => state.finance.isLoading;
export const selectFinanceError = (state) => state.finance.error;

export default financeSlice.reducer;
