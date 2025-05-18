import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Validates if a field is empty
 * @param {string} value - The value to check
 * @returns {boolean} - True if the field is empty, false otherwise
 */
export const isEmpty = (value) => {
  return value === undefined || value === null || value.trim() === '';
};

/**
 * Formats a date string to a localized format
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Exports data to an Excel file
 * @param {Array} data - Array of objects to export
 * @param {string} fileName - Name of the file to save
 * @param {string} sheetName - Name of the sheet in the Excel file
 */
export const exportToExcel = (data, fileName, sheetName = 'Sheet1') => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Generate Excel file buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  // Create a Blob from the buffer
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  
  // Save the file
  saveAs(blob, `${fileName}.xlsx`);
};

/**
 * Calculates the total amount from an array of items
 * @param {Array} items - Array of objects with amount property
 * @returns {number} - Sum of all amounts
 */
export const calculateTotal = (items) => {
  if (!items || !items.length) return 0;
  return items.reduce((total, item) => total + (Number(item.amount) || 0), 0);
};

/**
 * Calculates priority score based on beneficiary data
 * @param {Object} beneficiary - Beneficiary data
 * @returns {number} - Priority score (1-10)
 */
export const calculatePriority = (beneficiary) => {
  let score = 5; // Default medium priority
  
  // Adjust based on income
  if (beneficiary.monthlyIncome < 1000) {
    score += 3;
  } else if (beneficiary.monthlyIncome < 2000) {
    score += 2;
  } else if (beneficiary.monthlyIncome < 3000) {
    score += 1;
  }
  
  // Adjust based on family size
  if (beneficiary.familyMembers > 5) {
    score += 2;
  } else if (beneficiary.familyMembers > 3) {
    score += 1;
  }
  
  // Cap the score between 1 and 10
  return Math.max(1, Math.min(10, score));
};

export default {
  isEmpty,
  formatDate,
  exportToExcel,
  calculateTotal,
  calculatePriority
};



