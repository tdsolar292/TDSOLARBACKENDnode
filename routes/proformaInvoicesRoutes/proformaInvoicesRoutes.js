import express from "express";

// Import the controller functions
import {
  createProformaInvoices,
  searchProformaInvoices,
  getAllProformaInvoices,
  updateProformaInvoiceStatus,
  downloadDuplicateProformaInvoicePDF
} from "../../controllers/proformaInvoicesControllers/proformaInvoicesControllers.js";
 
const router = express.Router();

// Route to create a new Commercial Performa
router.post("/create",  createProformaInvoices);


// Route to get a specific Commercial Performa by ID
/**
 * API: http://localhost:5000/api/v1/proformainvoice/search?clientMobile=9999966666
 * Example query parameters:
 * - clientMobile: 9999966666
 * - id: 60c123abc...
 * - clientName: John
 * - clientEmail:
 *  
 * clientId: 12345
 * - invoiceNumber: INV-001 */

router.get("/search", searchProformaInvoices);


// Route to get all Commercial Performas
router.get("/getAll",   getAllProformaInvoices);


// Route to update a specific Performa Invoice status by ID
/**
 * API: http://localhost:5000/api/v1/proformainvoice/updateInvoiceStatus
 * Example request body:{
    "id":"686e9950eb7d1c864c4ab2b5",
    "status":"active"
}
*/
router.post("/updateInvoiceStatus/", updateProformaInvoiceStatus);

//Route download Duplicate Proforma Invoice PDF
/**
 * API: http://localhost:5000/api/v1/proformainvoice/downloadDuplicateProformaInvoicePDF
 * Example request body:{
    "id":"686e9950eb7d1c864c4ab2b5"
}*/
router.post("/downloadDuplicateProformaInvoicePDF", downloadDuplicateProformaInvoicePDF);

// Export the router
export default router;
