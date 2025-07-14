import { jsPDF } from "jspdf";

if (typeof window !== "undefined" && jsPDF && jsPDF.API) {
  var font = "Amiri";
  var fontStyle = "normal";
  // Base64 font data (shortened for brevity, replace with full base64 string from ttf2base64)
  jsPDF.API.addFileToVFS("Amiri-Regular.ttf", "AAEAAAALAIAAAwAwT1MvMg8SBJcAAAC8AAAAYGNtYXABdQAA...");
  jsPDF.API.addFont("Amiri-Regular.ttf", font, fontStyle);
} 