import GSTInvoiceModel from "../../models/GSTInvoiceModel/GSTInvoice.js";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer"; // Use puppeteer instead of html-pdf-node
import ejs from "ejs";
import { amountInwords } from "../../shared/shared.js";
import { sendEmailWithPDF } from "../../shared/emailUtil.js";
// ...existing code...

// Load template once at startup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatePath = path.join(__dirname, "gstinvoicetemplate.ejs");


const generateGSTInvoiceNumber = async () => {
  const lastEntry = await GSTInvoiceModel
    .findOne()
    .sort({ createdAt: -1 }) 
    .select("gstInvoiceNumber");

  if (!lastEntry || !lastEntry.gstInvoiceNumber) {
    return "TDGINV01";
  }

  const lastNumber = parseInt(lastEntry.gstInvoiceNumber.replace("TDGINV", "")) || 0;
  const newNumber = lastNumber + 1;

  return `TDGINV${String(newNumber).padStart(2, "0")}`;
};

const createGSTInvoice = async (req, res) => {
  try {
    const { otp, ...formData } = req.body;

    if (!otp || otp !== process.env.OTP) {
      return res.status(401).json({
        message: "You are not authorized to perform this action",
      });
    }

    const gstInvoiceNumber = await generateGSTInvoiceNumber();
    const amountInWords = amountInwords(Number(formData.TotalPaymentDone));
    //TODO : Temporary off to avoid creating duplicate entries in DB
    const newEntry = await GSTInvoiceModel.create({
      ...formData,
      gstInvoiceNumber,
      amountInWords
    });

     // Convert Mongoose document to plain object for EJS rendering
    const entryObj = newEntry.toObject();

    // Render HTML with EJS, passing all formData and items
    const html = await ejs.renderFile(templatePath, entryObj);

    // Generate PDF with puppeteer
    const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4",printBackground: true });
    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${gstInvoiceNumber}.pdf`,
    });
    console.log(entryObj );
    //Email starts
    setTimeout(()=>{
      const mailData ={
        clientEmail:newEntry?.clientEmail ? newEntry?.clientEmail :'contact@tdsolar.in',
        clientName:newEntry?.clientName ? newEntry?.clientName : '',
        clientId:newEntry?.clientId ? newEntry?.clientId : '',
        docNumber:newEntry?.gstInvoiceNumber ? newEntry?.gstInvoiceNumber : '',// invoiceNumber, ReceiptNumber etc
        formType:newEntry?.formType ? newEntry?.formType : '',
        fileName:`gstInvoice_${newEntry?.clientId}_${newEntry?.gstInvoiceNumber}_TD_SOLAR.pdf`,
        mailSubject:`🌞 ${newEntry?.clientName ? newEntry?.clientName : ''} : Your GST Invoice from TD Solar |  GST Invoice Attached  |  GST Invoice No: ${newEntry?.gstInvoiceNumber}`
      }
      sendEmailWithPDF(pdfBuffer,mailData);
    },1000);
    
    return res.status(200).send(pdfBuffer);

  } catch (error) {
    return res.status(500).json({
      message: "Error submitting GST Invoice to database",
      error: error.message,
    });
  }
};

const getGSTInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await GSTInvoiceModel.findById(id);
    if (!invoice) {
      return res.status(404).json({
        message: "GST Invoice not found",
      });
    }
    res.status(200).json({
      data: invoice,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving GST Invoice from database",
      error: error.message,
    });
  }
};

const getAllGSTInvoices = async (req, res) => {
  try {
    const invoices = await GSTInvoiceModel.find();
    res.status(200).json({
      data: invoices,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving all GST Invoices from database",
      error: error.message,
    });
  }
};

export {
  createGSTInvoice,
  getGSTInvoice,
  getAllGSTInvoices,
};