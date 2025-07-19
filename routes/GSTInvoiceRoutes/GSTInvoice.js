import express from "express";
import {
  createGSTInvoice,
  getGSTInvoice,
  getAllGSTInvoices,
} from "../../controllers/GSTInvoiceController/GSTInvoice.js";

const router = express.Router();

router.post("/create", createGSTInvoice);
router.get("/getSingle/:id", getGSTInvoice);
router.get("/getAll", getAllGSTInvoices);

export default router;