import mongoose from "mongoose";

const PaymentReceiptSchema = new mongoose.Schema({
  formType: String,
  clientId: String,
  paymentDate: String,
  clientName: String,
  clientAddress: String,
  clientState: String,
  clientPinCode: String,
  clientMobile: Number,
  receiptNo: String,
  paymentDetails: String,
  amount: Number,
  paymentMode: String,
  transactionDetails:String,
  clientEmail: String,
  invoiceNumber: String,
  receiptGeneratedBy: String
}, { timestamps: true });

const PaymentReceiptModel = mongoose.model("paymentreceipts", PaymentReceiptSchema);

export default PaymentReceiptModel;