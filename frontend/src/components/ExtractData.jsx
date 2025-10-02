import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.js?url"; 
import mammoth from "mammoth";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;


export async function extractResumeData(file) {
  const fileType = file.name.split(".").pop().toLowerCase();

  if (fileType === "pdf") {
    return extractTextFromPDF(file);
  } else if (fileType === "docx") {
    return extractTextFromDOCX(file);
  } else {
    throw new Error("Unsupported file type. Please upload PDF or DOCX.");
  }
}

async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let textContent = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(" ");
    textContent += pageText + "\n";
  }

  return textContent;
}

async function extractTextFromDOCX(file) {
  const arrayBuffer = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer });
  return value;
}

/**
 * Parse resume text to extract structured data
 * @param {string} text - Extracted resume text
 * @returns {{ name: string, email: string, phone: string }}
 */
export async function parseResume (file) {
  let text=await extractTextFromPDF(file)
  let name = "";
  let email = "";
  let phone = "";
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/);
  if (emailMatch) email = emailMatch[0];

  const phoneMatch = text.match(
    /(\+?\d{1,3}[\s-]?)?(\(?\d{2,5}\)?[\s-]?)?\d{3,5}[\s-]?\d{4,5}/
  );
  if (phoneMatch) {
    phone = phoneMatch[0].replace(/\D/g, ""); // remove non-digits
    if (phone.length >= 10) {
      // Keep only last 10–12 digits
      phone = phone.slice(-12);
    }
  }

  const nameRegex =
    /(Name|Candidate|Full Name)[:\-\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i;
  const nameMatch = text.match(nameRegex);

  if (nameMatch) {
    name = nameMatch[2].trim();
  } else {
    
    const fallback = text.match(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}/);
    if (fallback) name = fallback[0].trim();
  }

  return { name, email, phone };
}
