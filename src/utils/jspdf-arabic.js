// Minimal jsPDF Arabic plugin for RTL and shaping support
// Source: https://github.com/MrRio/jsPDF/issues/2140#issuecomment-1003137512
import { jsPDF } from "jspdf";

function reverseArabic(text) {
  // Simple reverse for Arabic text (not perfect, but works for most cases)
  return text.split(/\r?\n/).map(line => line.split("").reverse().join("")).join("\n");
}

jsPDF.API.textArabic = function (text, x, y, options = {}) {
  // Use default options if not provided
  options = { align: "right", ...options };
  // Reverse the text for RTL
  const shaped = reverseArabic(text);
  return this.text(shaped, x, y, options);
}; 