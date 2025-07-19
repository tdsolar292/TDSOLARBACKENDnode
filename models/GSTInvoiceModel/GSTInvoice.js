import mongoose from "mongoose";

const GSTInvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: String, // PONoGST Invoice Number (e.g., TDPI331)
    gstInvoiceNumber: String, // TDGIV GST Invoice Number (e.g., TDPI331)
    clientId: String,
    InvoiceDate: String, // Date of the invoice
    clientName: String,
    clientAddress: String,
    clientMobile: String,
    clientGST: String,
    clientPAN: String,
    clientState: String,
    clientStateCode: String,
    TotalProjectValue: String,
    clientEmail: String,
    PVModules_SL: [String],
    Inverters_SL: [String],
    Batteries_SL: [String],
    Extra_SL: [String],
    discount: String,
    lessOnNetMetering: String,
    refundedAmount: String,
    refundDate: String,
    refundDescription: String,
    PVModules_ModelName: String,
    Inverters_ModelName: String,
    Batteries_ModelName: String,
    Extra_ModelName: String,
    TotalPaymentDone: String,
    supplyPercentage: Number,
    invoiceGeneratedBy:String,
    materialDetails: String,
    inverterDetails:String,
    batteryDetails:String,
    amountInWords: String,
    PVTotalRatingKW:Number,
    formType:String //gsti 
  },
  {
    timestamps: true,
  }
);

const GSTInvoiceModel = mongoose.model("GSTInvoiceModel", GSTInvoiceSchema);

export default GSTInvoiceModel;