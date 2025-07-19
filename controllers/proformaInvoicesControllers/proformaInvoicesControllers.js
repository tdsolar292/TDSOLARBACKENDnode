
import ProformaInvoicesModel from "../../models/proformaInvoicesModel/proformaInvoicesModel.js"
import PaymentReceiptModel from "../../models/paymentReceiptModel/paymentReceiptModel.js"
import GSTInvoiceModel from "../../models/GSTInvoiceModel/GSTInvoice.js"

import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";
import { sendEmailWithPDF } from "../../shared/emailUtil.js";
import ejs from "ejs";


// Load template once at startup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dpi_templatePath = path.join(__dirname, "proformaInvoiceTemplatePDF.ejs");
const cpi_templatePath = path.join(__dirname, "commercialProformaInvoiceTemplatePDF.ejs");

const generateProformaInvoiceNumber = async () => {
  const lastEntry = await ProformaInvoicesModel.findOne()
    .sort({ _id: -1 }) // Get the last entry based on _id (newest first)
    .select("invoiceNumber");

  if (!lastEntry || !lastEntry.invoiceNumber) {
    return "TDPI01";
  }

  const lastNumber = parseInt(lastEntry.invoiceNumber.replace("TDPI", "")) || 0;
  const newNumber = lastNumber + 1;

  return `TDPI${String(newNumber)}`;
};

// Total Invoice Amout Calculation
const calculateTotalInvoiceAmount = (reqData) => {
  // Helper to safely convert to number
  const num = (val) => Number(val) || 0;

  if (reqData.formType === "dpi") {
    const supplyCost = (((num(reqData.totalProjectValue) * (num(reqData.supplyPercentage)*0.01) * (100 / 112)) - num(reqData.materialDiscount)) * 1.12);
    const installationCost = (((num(reqData.totalProjectValue) * ((100 - num(reqData.supplyPercentage))*0.01) * (100 / 118)) - num(reqData.installationDiscount)) * 1.18);

    const totalSupplyAndInstallationCost = supplyCost + installationCost;

    const erectionAmount = ((num(reqData.extraHeightTotalCost) + num(reqData.transportationCost) + num(reqData.miscellaneousExpenses) + num(reqData.liaisonCost) - num(reqData.erectionDiscount)) * 1.18); // 18% GST Extra
    const netMeteringAmount = (num(reqData.applicationCost) + num(reqData.meterCost) + num(reqData.caCertificate) + num(reqData.fitnessCertificate) - num(reqData.netMeteringDiscount)); // GST included

    return parseInt(totalSupplyAndInstallationCost + erectionAmount + netMeteringAmount);
  } else if (reqData.formType === "cpi") {
    const comercialPICost =(num(reqData.moduleWatt) * num(reqData.quantity) * num(reqData.pricePerWattIncGst));
    return comercialPICost;
  }
  return num(reqData.totalProjectValue);
}

const createProformaInvoices = async (req, res) => {
   //ProposalDate today date
    req.body['proposalDate'] = req.body['proposalDate'] || new Date().toISOString().split('T')[0];
  try {
    const { otp,formType, ...formData } = req.body;

    // Validate OTP
    if (!otp || otp !== process.env.OTP) {
      return res.status(401).json({
        message: "You are not authorized to perform this action",
      });
    }

    // Generate new invoiceNumber
    const invoiceNumber = await generateProformaInvoiceNumber();

    // Total Invoice Amout Calculation
    const TotalInvoiceAmoutCalculated = await calculateTotalInvoiceAmount(req.body);


    // Save to MongoDB
    const newEntry = await ProformaInvoicesModel.create({
      ...formData,
      formType,
      invoiceNumber,
      TotalInvoiceAmoutCalculated
    });
    
    const html = await ejs.renderFile(formType==='dpi' ? dpi_templatePath : (formType==='cpi') ? cpi_templatePath :'', newEntry);
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

    setTimeout(()=>{
      const mailData ={
        clientEmail:newEntry?.clientEmail ? newEntry?.clientEmail :'contact@tdsolar.in',
        clientName:newEntry?.clientName ? newEntry?.clientName : '',
        clientId:newEntry?.clientId ? newEntry?.clientId : '',
        docNumber:newEntry?.invoiceNumber ? newEntry?.invoiceNumber : '',// invoiceNumber, ReceiptNumber etc
        formType:newEntry?.formType ? newEntry?.formType : '',
        fileName:`${newEntry?.formType ? newEntry?.formType : ''}_${newEntry?.clientId}_${newEntry?.invoiceNumber}_TD_SOLAR.pdf`,
        mailSubject:`🌞 ${newEntry?.clientName ? newEntry?.clientName : ''} : Your Solar PV Installation Proforma Invoice from TD Solar  |  Attached  |  Invoice No: ${newEntry?.invoiceNumber}`
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



const searchProformaInvoices = async (req, res) => {
  try {
    const { id, clientName, clientMobile, clientEmail, clientId, invoiceNumber, page = 1, pageSize = 10 } = req.query;

    // Build dynamic query object
    const query = {};
    if (id) query._id = id;
    if (clientName) query.clientName = clientName;
    if (clientMobile) query.clientMobile = clientMobile;
    if (clientEmail) query.clientEmail = clientEmail;
    if (clientId) query.clientId = clientId;
    if (invoiceNumber) query.invoiceNumber = invoiceNumber;

    if (Object.keys(query).length === 0) {
      return res.status(400).json({ message: "At least one search parameter is required." });
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const pageSizeNum = parseInt(pageSize) || 10;
    const skip = (pageNum - 1) * pageSizeNum;

    // Total matching documents
    const total = await ProformaInvoicesModel.countDocuments(query);
    const totalPages = Math.ceil(total / pageSizeNum);

    // Get paginated data
    const data = await ProformaInvoicesModel.find(query)
      .sort({ _id: -1 }) // descending order by _id (newest first)
      .skip(skip)
      .limit(pageSizeNum)
      .lean();

    // Count active clients (status === "active") in the filtered set
    const activeClient = await ProformaInvoicesModel.countDocuments({ ...query, status: "active" });

    res.status(200).json({
      total,
      page: pageNum,
      pageSize: pageSizeNum,
      totalPages,
      activeClient,
      data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving Proforma Invoice from database",
      error: error.message,
    });
  }
};

const getAllProformaInvoices = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;
    const statusFilter = req.query.status; // New optional status filter

    // Build query (add status filter if provided)
    const query = {};
    if (statusFilter) {
      query.status = statusFilter;
    }

    // Total count (with status filter if applied)
    const total = await ProformaInvoicesModel.countDocuments(query);

    // Total count (with status filter if applied)
    const totalProformaRecords = await ProformaInvoicesModel.countDocuments({});
    const totalPaymentReceiptRecords = await PaymentReceiptModel.countDocuments({});
    const totalGSTInvoiceRecords = await GSTInvoiceModel.countDocuments({});

    // Total pages calculation
    const totalPages = Math.ceil(total / pageSize);

    // Get paginated data
    const data = await ProformaInvoicesModel.find(query)
      .sort({ _id: -1 }) // descending order by _id (newest first)
      .skip(skip)
      .limit(pageSize)
      .lean();

    // Count active clients (status === "active")
    const activeClient = await ProformaInvoicesModel.countDocuments({ status: "active" });
    const completedClientRecords = await ProformaInvoicesModel.countDocuments({ status: "completed" });

    res.status(200).json({
      total,
      totalProformaRecords,
      totalGSTInvoiceRecords,
      totalPaymentReceiptRecords,
      completedClientRecords,
      page,
      pageSize,
      totalPages,
      activeClient,
      data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving Proforma Invoices from database",
      error: error.message,
    });
  }
};

const updateProformaInvoiceStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id || !status) {
      return res.status(400).json({ message: "Both 'id' and 'status' are required." });
    }

    const updated = await ProformaInvoicesModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: "Proforma Invoice not found." });
    }

    res.status(200).json({
      message: "Proforma Invoice status updated successfully.",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating Proforma Invoice status.",
      error: error.message,
    });
  }
};

//Route download Duplicate Proforma Invoice PDF
/** * API: http://localhost:5000/api/v1/proformainvoice/downloadDuplicateProformaInvoicePDF
 * Example request body:{
    "id":"686e9950eb7d1c864c4ab2b5"
} */
const downloadDuplicateProformaInvoicePDF = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: "ID is required." });
    }

    // Find the document by ID
    const invoiceData = await ProformaInvoicesModel.findById(id).lean();
    //Update invoiceData with formType if not present
    if (!invoiceData.formType) {
      invoiceData.formType = 'dpi'; // Default to 'dpi' if not set
    }
    //Update invoiceData with proposalDate if not present use createdAt
    if (!invoiceData?.proposalDate) {
      invoiceData.proposalDate = invoiceData.createdAt ? (invoiceData.createdAt.toISOString().split('T')[0]) : (new Date().toISOString().split('T')[0]);
    }
    //Update mat1DCCableMaterial, mat2ACCableMaterial with default values if not present
    if (!invoiceData.mat1DCCableMaterial) {
      invoiceData.mat1DCCableMaterial = "Copper"; // Default value
    }
    if (!invoiceData.mat2ACCableMaterial) {
      invoiceData.mat2ACCableMaterial = "Aluminum"; // Default value
    }
    if (!invoiceData.inverterQuantity) {
      invoiceData.inverterQuantity = 1; // Default value 1
    }
    if (!invoiceData.formType) {
      invoiceData.formType = 'dpi'; // Default to 'dpi' if not set
    }
    if (!invoiceData) {
      return res.status(404).json({ message: "Proforma Invoice not found." });
    }

    // Determine which template to use based on formType
    const templatePath = invoiceData.formType === 'dpi' 
      ? dpi_templatePath 
      : invoiceData.formType === 'cpi' 
        ? cpi_templatePath 
        : null;

    if (!templatePath) {
      return res.status(400).json({ message: "Invalid form type in document." });
    }

    // Render the PDF
    const html = await ejs.renderFile(templatePath, invoiceData);
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    // Add additional PDF options for watermark
    const pdfBuffer = await page.pdf({ 
      format: "A4", 
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `
        <style>
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px;
            color: rgba(169, 169, 169, 0.35);
            pointer-events: none;
            z-index: 1000;
          }
        </style>
        <div class="watermark">DUPLICATE</div>
      `,
      footerTemplate: '',
      margin: {
        top: '0px',
        bottom: '0px'
      }
    });
    await browser.close();

    // Send the PDF
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${invoiceData.invoiceNumber}_duplicate.pdf`,
    });
    //Email Send Function
    setTimeout(()=>{
      const mailData ={
        clientEmail:'admin@tdsolar.in,tdsolar9@gmail.com',
        clientName:'TD Solar Admin',// Duplicate only for Admin
        clientId:invoiceData?.clientId ? invoiceData?.clientId : '',
        docNumber:invoiceData?.invoiceNumber ? invoiceData?.invoiceNumber : '',// invoiceNumber, ReceiptNumber etc
        formType:invoiceData?.formType ? invoiceData?.formType : '',
        fileName:`Duplicate_${invoiceData?.formType ? invoiceData?.formType : ''}_${invoiceData?.clientId}_${invoiceData?.invoiceNumber}_TD_SOLAR.pdf`,
        mailSubject:`🌞 TD Solar Admin : DUPLICATE Proforma Invoice from TD Solar  |  Attached  |  Invoice No: ${invoiceData?.invoiceNumber}`
      }
      sendEmailWithPDF(pdfBuffer,mailData);
    },1000);
    return res.status(200).send(pdfBuffer);

  } catch (error) {
    return res.status(500).json({
      message: "Error generating duplicate Proforma Invoice",
      error: error.message,
    });
  }
};

export {
  createProformaInvoices,
  searchProformaInvoices,
  getAllProformaInvoices,
  updateProformaInvoiceStatus,
  downloadDuplicateProformaInvoicePDF
};
