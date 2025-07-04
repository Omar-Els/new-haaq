import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchSheets } from '../features/sheets/sheetsSlice';
import SheetsManager from '../components/SheetsManager';
import './Sheets.css';

/**
 * Sheets Page
 * 
 * صفحة إدارة الكشفات
 */
const Sheets = () => {
  const dispatch = useDispatch();

  // Load sheets on component mount
  useEffect(() => {
    dispatch(fetchSheets());
  }, [dispatch]);

  return (
    <div className="sheets-page">
      <SheetsManager />
    </div>
  );
};

export default Sheets; 