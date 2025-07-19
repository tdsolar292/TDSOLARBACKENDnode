import PaymentReceiptModel from "../../models/paymentReceiptModel/paymentReceiptModel.js";
import {amountInwords} from "../../shared/shared.js";
import { sendEmailWithPDF } from "../../shared/emailUtil.js";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";
import ejs from "ejs";


// Load template once at startup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatePath = path.join(__dirname, "paymentReceiptPDF.ejs");

const generatePaymentReceiptNumber = async () => {
  const lastEntry = await PaymentReceiptModel.findOne()
    .sort({ _id: -1 }) // Get the last entry based on _id (newest first)
    .select("receiptNo");

  if (!lastEntry || !lastEntry.receiptNo) {
    return "REC1000001";
  }

  const lastNumber = parseInt(lastEntry.receiptNo.replace("REC", "")) || 0;
  const newNumber = lastNumber + 1;

  return `REC${String(newNumber)}`;
};

const createPaymentReceipt = async (req, res) => {
  req.body['paymentDate'] = req.body['paymentDate'] || new Date().toISOString().split('T')[0];
  try {
    
    const { otp, ...formData } = req.body;

    // Validate OTP
    if (!otp || otp !== process.env.OTP) {
      return res.status(401).json({
        message: "You are not authorized to perform this action",
      });
    }

  // Generate new receiptNo
    const receiptNo = await generatePaymentReceiptNumber();

  //Amount in word
    const amtinword = formData.amount ? amountInwords(formData.amount) : '';

    // Save to MongoDB
    const newEntry = await PaymentReceiptModel.create({
      ...formData,
      receiptNo: receiptNo
    });
    newEntry['amtinword'] = amtinword;

    const html = await ejs.renderFile(templatePath, newEntry);
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
        "Content-Disposition": `attachment; filename=${newEntry['clientId']+'_'+receiptNo}.pdf`,
      });
      //Email starts
      setTimeout(()=>{
      const mailData ={
        clientEmail:newEntry?.clientEmail ? newEntry?.clientEmail :'contact@tdsolar.in',
        clientName:newEntry?.clientName ? newEntry?.clientName : '',
        clientId:newEntry?.clientId ? newEntry?.clientId : '',
        docNumber:newEntry?.receiptNo ? newEntry?.receiptNo : '',// invoiceNumber, ReceiptNumber etc
        formType:newEntry?.formType ? newEntry?.formType : '',
        fileName:`paymentReceipt_${newEntry?.amount}_${newEntry?.clientId}_${newEntry?.receiptNo}_TD_SOLAR.pdf`,
        mailSubject:`🌞 ${newEntry?.clientName ? newEntry?.clientName : ''} : ${newEntry?.amount ? ('Payment Amount : '+newEntry?.amount+'/- has neen  received by TD Solar') :''} |  Receipt Attached  |  Receipt No: ${newEntry?.receiptNo}`
      }
      sendEmailWithPDF(pdfBuffer,mailData);
    },1000);
      return res.status(200).send(pdfBuffer);
      
      // return res.status(200).json({
      //    message: "Proforma Invoice submitted successfully",
      //    data: newEntry,
      // });
      } catch (error) {
        return res.status(500).json({
          message: "Error submitting Invoice to database",
          error: error.message,
        });
      }
};

const getAllPaymentReceipts = async (req, res) => {
  try {
    const receipts = await PaymentReceiptModel.find().lean();
    return res.status(200).json({
      message: "All payment receipts fetched successfully",
      data: receipts,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching payment receipts",
      error: error.message,
    });
  }
};

const getAllPaymentReceiptByInvoiceNumber = async (req, res) => {
  try {
    const { invoiceNumber } = req.query;
    if (!invoiceNumber) {
      return res.status(400).json({ message: "invoiceNumber is required as a query parameter." });
    }
    
    const receipts = await PaymentReceiptModel.find({ invoiceNumber }).lean();
    
    // Calculate total amount by summing all receipt amounts
    const totalAmount = receipts.reduce((sum, receipt) => {
      return sum + (receipt.amount || 0); // Handle cases where amount might be missing
    }, 0);
    
    return res.status(200).json({
      message: "Payment receipts fetched successfully",
      totalAmount: totalAmount,
      data: receipts
      
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching payment receipts",
      error: error.message,
    });
  }
};

export {
  createPaymentReceipt,
  getAllPaymentReceipts,
  getAllPaymentReceiptByInvoiceNumber,
};