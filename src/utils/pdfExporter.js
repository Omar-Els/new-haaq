import jsPDF from 'jspdf';
import 'jspdf-autotable';

// دالة لتصدير كشف شهري إلى PDF
export const exportSheetToPDF = (sheet, beneficiaries) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // إعداد الخط العربي
  doc.addFont('https://fonts.gstatic.com/s/amiri/v12/J7aRnpd8CGxBHpUrtLMA7w.ttf', 'Amiri', 'normal');
  doc.setFont('Amiri');
  
  // العنوان الرئيسي
  doc.setFontSize(20);
  doc.text('كشف المستفيدين الشهري', 105, 20, { align: 'center' });
  
  // معلومات الكشف
  doc.setFontSize(12);
  doc.text(`اسم الكشف: ${sheet.name}`, 20, 35);
  doc.text(`الشهر: ${getMonthName(sheet.month)} ${sheet.year}`, 20, 45);
  doc.text(`تاريخ الإنشاء: ${new Date(sheet.createdAt).toLocaleDateString('ar-EG')}`, 20, 55);
  doc.text(`عدد المستفيدين: ${sheet.beneficiaryCount}`, 20, 65);
  
  // إجمالي الكشف
  doc.setFontSize(14);
  doc.setFont('Amiri', 'bold');
  doc.text(`إجمالي الكشف: ${sheet.totalAmount.toLocaleString('ar-EG')} جنيه مصري`, 20, 80);
  
  // جدول المستفيدين
  const tableData = beneficiaries.map((beneficiary, index) => [
    index + 1,
    beneficiary.name || 'غير محدد',
    beneficiary.nationalId || 'غير محدد',
    beneficiary.phone || 'غير محدد',
    beneficiary.address || 'غير محدد',
    beneficiary.familyMembers || 1,
    `${(beneficiary.monthlyAmount || 0).toLocaleString('ar-EG')} جنيه`
  ]);
  
  // إضافة صف الإجمالي
  tableData.push([
    '',
    '',
    '',
    '',
    'الإجمالي',
    beneficiaries.reduce((sum, b) => sum + (b.familyMembers || 1), 0),
    `${sheet.totalAmount.toLocaleString('ar-EG')} جنيه`
  ]);
  
  doc.autoTable({
    head: [['م', 'اسم المستفيد', 'الرقم القومي', 'رقم الهاتف', 'العنوان', 'عدد أفراد الأسرة', 'المبلغ الشهري']],
    body: tableData,
    startY: 90,
    styles: {
      font: 'Amiri',
      fontSize: 10,
      textColor: [0, 0, 0],
      halign: 'center'
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { top: 10, right: 20, bottom: 20, left: 20 },
    columnStyles: {
      0: { cellWidth: 10 }, // رقم
      1: { cellWidth: 35 }, // الاسم
      2: { cellWidth: 30 }, // الرقم القومي
      3: { cellWidth: 25 }, // الهاتف
      4: { cellWidth: 35 }, // العنوان
      5: { cellWidth: 20 }, // عدد أفراد الأسرة
      6: { cellWidth: 25 }  // المبلغ
    }
  });
  
  // إضافة ملاحظات
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text('ملاحظات:', 20, finalY);
  doc.setFontSize(8);
  doc.text('• هذا الكشف صادر من نظام إدارة المستفيدين', 20, finalY + 8);
  doc.text('• تم إنشاؤه تلقائياً بتاريخ ' + new Date().toLocaleDateString('ar-EG'), 20, finalY + 16);
  doc.text('• يرجى التأكد من صحة البيانات قبل التوقيع', 20, finalY + 24);
  
  // حفظ الملف
  const fileName = `كشف_${getMonthName(sheet.month)}_${sheet.year}_${sheet.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(fileName);
};

// دالة لتصدير تقرير شهري شامل
export const exportMonthlyReportToPDF = (sheets, month, year) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // إعداد الخط العربي
  doc.addFont('https://fonts.gstatic.com/s/amiri/v12/J7aRnpd8CGxBHpUrtLMA7w.ttf', 'Amiri', 'normal');
  doc.setFont('Amiri');
  
  // العنوان الرئيسي
  doc.setFontSize(20);
  doc.text('التقرير الشهري للمستفيدين', 105, 20, { align: 'center' });
  
  // معلومات التقرير
  doc.setFontSize(12);
  doc.text(`الشهر: ${getMonthName(month)} ${year}`, 20, 35);
  doc.text(`تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}`, 20, 45);
  
  // إحصائيات عامة
  const totalBeneficiaries = sheets.reduce((sum, sheet) => sum + sheet.beneficiaryCount, 0);
  const totalAmount = sheets.reduce((sum, sheet) => sum + sheet.totalAmount, 0);
  
  doc.text(`إجمالي المستفيدين: ${totalBeneficiaries}`, 20, 55);
  doc.text(`إجمالي المبالغ: ${totalAmount.toLocaleString('ar-EG')} جنيه مصري`, 20, 65);
  doc.text(`عدد الكشفات: ${sheets.length}`, 20, 75);
  
  // جدول الكشفات
  const tableData = sheets.map((sheet, index) => [
    index + 1,
    sheet.name,
    sheet.beneficiaryCount,
    `${sheet.totalAmount.toLocaleString('ar-EG')} جنيه`,
    new Date(sheet.createdAt).toLocaleDateString('ar-EG')
  ]);
  
  doc.autoTable({
    head: [['م', 'اسم الكشف', 'عدد المستفيدين', 'إجمالي المبلغ', 'تاريخ الإنشاء']],
    body: tableData,
    startY: 90,
    styles: {
      font: 'Amiri',
      fontSize: 10,
      textColor: [0, 0, 0],
      halign: 'center'
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { top: 10, right: 20, bottom: 20, left: 20 }
  });
  
  // إضافة ملاحظات
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text('ملاحظات:', 20, finalY);
  doc.setFontSize(8);
  doc.text('• هذا التقرير شامل لجميع الكشفات الشهرية', 20, finalY + 8);
  doc.text('• تم إنشاؤه تلقائياً من نظام إدارة المستفيدين', 20, finalY + 16);
  doc.text('• يرجى الاحتفاظ بنسخة من هذا التقرير', 20, finalY + 24);
  
  // حفظ الملف
  const fileName = `تقرير_شهري_${getMonthName(month)}_${year}.pdf`;
  doc.save(fileName);
};

// دالة لتصدير كشف مفصل مع صور المستفيدين
export const exportDetailedSheetToPDF = (sheet, beneficiaries) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // إعداد الخط العربي
  doc.addFont('https://fonts.gstatic.com/s/amiri/v12/J7aRnpd8CGxBHpUrtLMA7w.ttf', 'Amiri', 'normal');
  doc.setFont('Amiri');
  
  // العنوان الرئيسي
  doc.setFontSize(20);
  doc.text('كشف المستفيدين المفصل', 105, 20, { align: 'center' });
  
  // معلومات الكشف
  doc.setFontSize(12);
  doc.text(`اسم الكشف: ${sheet.name}`, 20, 35);
  doc.text(`الشهر: ${getMonthName(sheet.month)} ${sheet.year}`, 20, 45);
  doc.text(`تاريخ الإنشاء: ${new Date(sheet.createdAt).toLocaleDateString('ar-EG')}`, 20, 55);
  
  // إجمالي الكشف
  doc.setFontSize(14);
  doc.setFont('Amiri', 'bold');
  doc.text(`إجمالي الكشف: ${sheet.totalAmount.toLocaleString('ar-EG')} جنيه مصري`, 20, 70);
  
  // جدول مفصل
  const tableData = beneficiaries.map((beneficiary, index) => [
    index + 1,
    beneficiary.name || 'غير محدد',
    beneficiary.nationalId || 'غير محدد',
    beneficiary.beneficiaryId || 'غير محدد',
    beneficiary.phone || 'غير محدد',
    beneficiary.address || 'غير محدد',
    beneficiary.familyMembers || 1,
    beneficiary.maritalStatus || 'غير محدد',
    `${(beneficiary.monthlyAmount || 0).toLocaleString('ar-EG')} جنيه`
  ]);
  
  doc.autoTable({
    head: [['م', 'الاسم', 'الرقم القومي', 'رقم المستفيد', 'الهاتف', 'العنوان', 'أفراد الأسرة', 'الحالة الاجتماعية', 'المبلغ']],
    body: tableData,
    startY: 80,
    styles: {
      font: 'Amiri',
      fontSize: 8,
      textColor: [0, 0, 0],
      halign: 'center'
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { top: 10, right: 10, bottom: 20, left: 10 },
    columnStyles: {
      0: { cellWidth: 8 },  // رقم
      1: { cellWidth: 25 }, // الاسم
      2: { cellWidth: 20 }, // الرقم القومي
      3: { cellWidth: 20 }, // رقم المستفيد
      4: { cellWidth: 18 }, // الهاتف
      5: { cellWidth: 25 }, // العنوان
      6: { cellWidth: 12 }, // أفراد الأسرة
      7: { cellWidth: 15 }, // الحالة الاجتماعية
      8: { cellWidth: 15 }  // المبلغ
    }
  });
  
  // إضافة ملاحظات
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text('ملاحظات:', 20, finalY);
  doc.setFontSize(8);
  doc.text('• هذا الكشف مفصل ويحتوي على جميع بيانات المستفيدين', 20, finalY + 8);
  doc.text('• تم إنشاؤه تلقائياً بتاريخ ' + new Date().toLocaleDateString('ar-EG'), 20, finalY + 16);
  doc.text('• يرجى التأكد من صحة البيانات قبل التوقيع', 20, finalY + 24);
  
  // حفظ الملف
  const fileName = `كشف_مفصل_${getMonthName(sheet.month)}_${sheet.year}_${sheet.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(fileName);
};

// دالة مساعدة لتحويل رقم الشهر إلى اسم
const getMonthName = (month) => {
  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  return months[month - 1] || 'غير محدد';
};

// دالة لتصدير تقرير سنوي
export const exportYearlyReportToPDF = (sheets, year) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // إعداد الخط العربي
  doc.addFont('https://fonts.gstatic.com/s/amiri/v12/J7aRnpd8CGxBHpUrtLMA7w.ttf', 'Amiri', 'normal');
  doc.setFont('Amiri');
  
  // العنوان الرئيسي
  doc.setFontSize(20);
  doc.text('التقرير السنوي للمستفيدين', 105, 20, { align: 'center' });
  
  // معلومات التقرير
  doc.setFontSize(12);
  doc.text(`السنة: ${year}`, 20, 35);
  doc.text(`تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}`, 20, 45);
  
  // إحصائيات سنوية
  const yearlySheets = sheets.filter(sheet => sheet.year === year);
  const totalBeneficiaries = yearlySheets.reduce((sum, sheet) => sum + sheet.beneficiaryCount, 0);
  const totalAmount = yearlySheets.reduce((sum, sheet) => sum + sheet.totalAmount, 0);
  
  doc.text(`إجمالي المستفيدين: ${totalBeneficiaries}`, 20, 55);
  doc.text(`إجمالي المبالغ: ${totalAmount.toLocaleString('ar-EG')} جنيه مصري`, 20, 65);
  doc.text(`عدد الكشفات: ${yearlySheets.length}`, 20, 75);
  
  // جدول شهري
  const monthlyData = [];
  for (let month = 1; month <= 12; month++) {
    const monthSheets = yearlySheets.filter(sheet => sheet.month === month);
    const monthBeneficiaries = monthSheets.reduce((sum, sheet) => sum + sheet.beneficiaryCount, 0);
    const monthAmount = monthSheets.reduce((sum, sheet) => sum + sheet.totalAmount, 0);
    
    monthlyData.push([
      getMonthName(month),
      monthBeneficiaries,
      `${monthAmount.toLocaleString('ar-EG')} جنيه`,
      monthSheets.length
    ]);
  }
  
  doc.autoTable({
    head: [['الشهر', 'عدد المستفيدين', 'إجمالي المبالغ', 'عدد الكشفات']],
    body: monthlyData,
    startY: 90,
    styles: {
      font: 'Amiri',
      fontSize: 10,
      textColor: [0, 0, 0],
      halign: 'center'
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { top: 10, right: 20, bottom: 20, left: 20 }
  });
  
  // إضافة ملاحظات
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text('ملاحظات:', 20, finalY);
  doc.setFontSize(8);
  doc.text('• هذا التقرير شامل لجميع الكشفات السنوية', 20, finalY + 8);
  doc.text('• تم إنشاؤه تلقائياً من نظام إدارة المستفيدين', 20, finalY + 16);
  doc.text('• يرجى الاحتفاظ بنسخة من هذا التقرير', 20, finalY + 24);
  
  // حفظ الملف
  const fileName = `تقرير_سنوي_${year}.pdf`;
  doc.save(fileName);
}; 