import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.vfs;
import './pdfFonts.js';

export function exportSheetToExcel(sheet, beneficiaries) {
  // تجهيز البيانات
  const data = beneficiaries.map((b, i) => ({
    "م": i + 1,
    "اسم المستفيد": b.name || "غير محدد",
    "الرقم القومي": b.nationalId || "غير محدد",
    "رقم الهاتف": b.phone || "غير محدد",
    "العنوان": b.address || "غير محدد",
    "عدد أفراد الأسرة": b.familyMembers || 1,
    "المبلغ الشهري": (b.monthlyAmount || 0) + " جنيه"
  }));

  // إضافة صف الإجمالي
  data.push({
    "م": "",
    "اسم المستفيد": "",
    "الرقم القومي": "",
    "رقم الهاتف": "",
    "العنوان": "الإجمالي",
    "عدد أفراد الأسرة": beneficiaries.reduce((sum, b) => sum + (b.familyMembers || 1), 0),
    "المبلغ الشهري": (sheet.totalAmount || 0) + " جنيه"
  });

  // إنشاء ورقة العمل
  const ws = XLSX.utils.json_to_sheet(data);

  // إنشاء ملف Excel
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "كشف المستفيدين");

  // حفظ الملف
  const fileName = `كشف_${sheet.name}_${sheet.month}_${sheet.year}.xlsx`;
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), fileName);
}

export function exportSheetToPDF(sheet, beneficiaries) {
  const tableBody = [
    [
      { text: "م", alignment: "right" },
      { text: "اسم المستفيد", alignment: "right" },
      { text: "الرقم القومي", alignment: "right" },
      { text: "رقم الهاتف", alignment: "right" },
      { text: "العنوان", alignment: "right" },
      { text: "عدد أفراد الأسرة", alignment: "right" },
      { text: "المبلغ الشهري", alignment: "right" }
    ],
    ...beneficiaries.map((b, i) => [
      i + 1,
      b.name || "غير محدد",
      b.nationalId || "غير محدد",
      b.phone || "غير محدد",
      b.address || "غير محدد",
      b.familyMembers || 1,
      (b.monthlyAmount || 0) + " جنيه"
    ]),
    [
      "",
      "",
      "",
      "",
      "الإجمالي",
      beneficiaries.reduce((sum, b) => sum + (b.familyMembers || 1), 0),
      (sheet.totalAmount || 0) + " جنيه"
    ]
  ];

  const docDefinition = {
    content: [
      { text: `كشف المستفيدين - ${sheet.name} (${sheet.month}/${sheet.year})`, style: "header", alignment: "right" },
      {
        table: {
          headerRows: 1,
          body: tableBody
        },
        layout: "lightHorizontalLines"
      }
    ],
    defaultStyle: {
      font: "Cairo",
      alignment: "right"
    },
    styles: {
      header: {
        fontSize: 18,
        bold: true
      }
    }
  };

  pdfMake.createPdf(docDefinition).download(`كشف_${sheet.name}_${sheet.month}_${sheet.year}.pdf`);
}

// تصدير تقرير شهري PDF
export function exportMonthlyReportToPDF(data, month, year) {
  const tableBody = [
    Object.keys(data[0] || {}).map(key => ({ text: key, alignment: "right" })),
    ...data.map(row => Object.values(row))
  ];
  const docDefinition = {
    content: [
      { text: `تقرير شهري (${month}/${year})`, style: "header", alignment: "right" },
      { table: { headerRows: 1, body: tableBody }, layout: "lightHorizontalLines" }
    ],
    defaultStyle: { font: "Cairo", alignment: "right" },
    styles: { header: { fontSize: 18, bold: true } }
  };
  pdfMake.createPdf(docDefinition).download(`تقرير_شهري_${month}_${year}.pdf`);
}

// تصدير كشف تفصيلي PDF
export function exportDetailedSheetToPDF(sheet, beneficiaries) {
  const tableBody = [
    [
      { text: "م", alignment: "right" },
      { text: "اسم المستفيد", alignment: "right" },
      { text: "الرقم القومي", alignment: "right" },
      { text: "تفاصيل إضافية", alignment: "right" }
    ],
    ...beneficiaries.map((b, i) => [
      i + 1,
      b.name || "غير محدد",
      b.nationalId || "غير محدد",
      b.details || "-"
    ])
  ];
  const docDefinition = {
    content: [
      { text: `كشف تفصيلي - ${sheet.name}`, style: "header", alignment: "right" },
      { table: { headerRows: 1, body: tableBody }, layout: "lightHorizontalLines" }
    ],
    defaultStyle: { font: "Cairo", alignment: "right" },
    styles: { header: { fontSize: 18, bold: true } }
  };
  pdfMake.createPdf(docDefinition).download(`كشف_تفصيلي_${sheet.name}.pdf`);
}

// تصدير تقرير سنوي PDF
export function exportYearlyReportToPDF(data, year) {
  const tableBody = [
    Object.keys(data[0] || {}).map(key => ({ text: key, alignment: "right" })),
    ...data.map(row => Object.values(row))
  ];
  const docDefinition = {
    content: [
      { text: `تقرير سنوي (${year})`, style: "header", alignment: "right" },
      { table: { headerRows: 1, body: tableBody }, layout: "lightHorizontalLines" }
    ],
    defaultStyle: { font: "Cairo", alignment: "right" },
    styles: { header: { fontSize: 18, bold: true } }
  };
  pdfMake.createPdf(docDefinition).download(`تقرير_سنوي_${year}.pdf`);
} 