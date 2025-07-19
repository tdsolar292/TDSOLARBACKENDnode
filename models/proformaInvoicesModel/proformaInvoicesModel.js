import mongoose from "mongoose";

const ProformaInvoicesSchema = new mongoose.Schema({
  otp: String,

  // Client Information
  clientId: String,
  clientIdType: String,
  clientName: String,
  clientMobile: String,
  clientEmail: String,
  clientAddress: String,
  clientState: String,
  clientPinCode: String,

  // Proposal/Invoice Info
  formType: String, //dpi or cpi
  proposalDate: String,
  invoiceNumber: String,
  invoiceGeneratedBy: String,

  // System Configuration
  systemType: String,
  systemConnection: String,
  gridType: String,
  electricSupply: String,

  // Module Details
  brand: String,
  type: String,
  moduleTechnology: String,
  moduleWatt: Number,
  quantity: Number,
  modRequired1: Boolean,

  // Inverter Details
  inverterBrand: String,
  inverterPower: Number,
  inverterQuantity: Number,
  invRequired4: Boolean,

  // Battery Details
  batteryBrand: String,
  batteryType: String,
  batteryCapacity: String,
  batteryQuantity: Number,
  batteryRequired9: Boolean,

  // Costing & Charges
  totalProjectValue: Number,
  supplyPercentage: Number,
  applicationCost: Number,
  meterCost: Number,
  caCertificate: Number,
  fitnessCertificate: Number,
  extraHeightTotalCost: Number,
  transportationCost: Number,
  miscellaneousExpenses: Number,
  liaisonCost: Number,
  pricePerWattIncGst: Number,
  TotalInvoiceAmoutCalculated:Number,

  // Discounts
  discount: String,
  materialDiscount: Number,
  installationDiscount: Number,
  erectionDiscount: Number,
  netMeteringDiscount: Number,

  // Rating
  PVTotalRatingKW: Number,

  // Freebies / Extra
  freeMaterial: String,

  // HSNSAC
  hsnsacCode2: String,
  hsnsacCode2Inverter: String,
  hsnsacCode2Solar: String,

  // Additional Materials
  mat1Required3: Boolean,
  mat1DCCableMaterial:String,  // Default: "Copper",
  mat2Required5: Boolean,
  mat2ACCableMaterial: String, // Default: "Aluminium",
  busMcbRequired6: Boolean,
  fireERequired7: Boolean,
  autoCleanRequired8: Boolean,
  // Structure Info
  stRoofRequired2: Boolean,
  stTinRequired2: Boolean,
  status:String, // default "", if payment is done then "Active"
}, { timestamps: true });

const ProformaInvoicesModel = mongoose.model("proformainvoices_tables",ProformaInvoicesSchema);

export default ProformaInvoicesModel;
