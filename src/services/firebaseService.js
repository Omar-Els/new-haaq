import { ref, set } from "firebase/database";
import { db } from "../utils/firebase";

/**
 * حفظ كشف أو جدول في الريل تايم داتابيز
 * @param {string} sheetId - معرف الكشف (مثلاً: "sheet_2024_06")
 * @param {object} sheetData - بيانات الكشف (جدول أو تقرير)
 */
export function saveSheetToRealtime(sheetId, sheetData) {
  return set(ref(db, 'sheets/' + sheetId), sheetData);
} 