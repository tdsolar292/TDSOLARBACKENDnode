import CommercialPerforma from "../../models/commercialPerformaModel/commercialPerforma.js";

// const generateProformaInvoiceNumber = async () => {
//   const lastEntry = await CommercialPerforma.findOne()
//     .sort({ createdAt: -1 }) // Get the most recent entry
//     .select("TDPIC");

//   if (!lastEntry || !lastEntry.TDPIC) {
//     return "TDPIC01";
//   }

//   const lastNumber = parseInt(lastEntry.TDPIC.replace("TDPIC", "")) || 0;
//   const newNumber = lastNumber + 1;

//   // Pad with leading zeroes to keep two digits (01, 02, ..., 10, etc.)
//   return `TDPIC${String(newNumber).padStart(2, "0")}`;
// };

// const createCommercialPerforma = async (req, res) => {
//   try {
//     const { otp, ...formData } = req.body;

//     // Validate OTP
//     if (!otp || otp !== process.env.OTP) {
//       return res.status(401).json({
//         message: "You are not authorized to perform this action",
//       });
//     }

//     // Generate new TDPIC
//     const TDPIC = await generateProformaInvoiceNumber();

//     // Add it to form data
//     const newEntry = await CommercialPerforma.create({
//       ...formData,
//       TDPIC,
//     });
//     return res.status(201).json({
//       message: "Commercial Performa submitted successfully",
//       data: newEntry,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Error submitting Commercial Performa to database",
//       error: error.message,
//     });
//   }
// };


import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";
import ejs from "ejs";

// Load template once at startup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatePath = path.join(__dirname, "commercialProformaInvoiceTemplatePDF.ejs");

const generateProformaInvoiceNumber = async () => {
  const lastEntry = await CommercialPerforma.findOne()
    .sort({ createdAt: -1 })
    .select("invoiceNumber");

  if (!lastEntry || !lastEntry.invoiceNumber) {
    return "TDPIC01";
  }

  const lastNumber = parseInt(lastEntry.invoiceNumber.replace("TDPIC", "")) || 0;
  const newNumber = lastNumber + 1;

  return `TDPIC${String(newNumber).padStart(2, "0")}`;
};

const createCommercialPerforma = async (req, res) => {
  //ProposalDate today date
    req.body['proposalDate'] = req.body['proposalDate'] || new Date().toISOString().split('T')[0];
  try {
    const { otp, ...formData } = req.body;

    // Validate OTP
    if (!otp || otp !== process.env.OTP) {
      return res.status(401).json({
        message: "You are not authorized to perform this action",
      });
    }

    // Generate new TDPIC
    const invoiceNumber = await generateProformaInvoiceNumber();

    // Save to MongoDB
    const newEntry = await CommercialPerforma.create({
      ...formData,
      invoiceNumber,
    });

    // Convert Mongoose document to plain object for EJS rendering
    // const entryObj = newEntry.toObject();

    // Render HTML with EJS, using static data for now
    const html = await ejs.renderFile(templatePath, newEntry);

    // Generate PDF with puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${invoiceNumber}.pdf`,
    });
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    return res.status(500).json({
      message: "Error submitting Commercial Performa to database",
      error: error.message,
    });
  }
};



const getCommercialPerforma = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving CommercialPerforma from database",
      error: error.message,
    });
  }
};

const getAllCommercialPerformas = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving all AllCommercialPerformas from database",
      error: error.message,
    });
  }
};

export {
  createCommercialPerforma,
  getCommercialPerforma,
  getAllCommercialPerformas,
};
