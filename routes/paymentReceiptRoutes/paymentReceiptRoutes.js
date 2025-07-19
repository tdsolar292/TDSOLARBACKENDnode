import express from "express";
import {
  createPaymentReceipt,
  getAllPaymentReceipts,
  getAllPaymentReceiptByInvoiceNumber,
} from "../../controllers/paymentReceiptControllers/paymentReceiptControllers.js";

const router = express.Router();

router.post("/create", createPaymentReceipt);
router.get("/getAll", getAllPaymentReceipts);
router.get("/getAllByInvoiceNumber", getAllPaymentReceiptByInvoiceNumber);

export default router;