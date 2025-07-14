import pdfMake from "pdfmake/build/pdfmake";

pdfMake.fonts = {
  Cairo: {
    normal: 'Cairo-Regular.ttf',
    bold: 'Cairo-Bold.ttf',
    italics: 'Cairo-Regular.ttf',
    bolditalics: 'Cairo-Bold.ttf'
  }
};

pdfMake.vfs = {
  'Cairo-Regular.ttf': 'AAEAAAALAIAAAwAwT1MvMg8SBJcAAAC8AAAAYGNtYXABdQAA...', // ضع هنا بيانات base64 الحقيقية
  'Cairo-Bold.ttf': 'AAEAAAALAIAAAwAwT1MvMg8SBJcAAAC8AAAAYGNtYXABdQAA...'
}; 