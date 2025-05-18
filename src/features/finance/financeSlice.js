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
    localStorage.setItem('transactions', JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transactions to storage:', error);
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
