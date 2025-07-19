import mongoose from "mongoose";

const ProformaInvoicesSchema = new mongoose.Schema({
  otp: { type: String, default: "" },

  // Client Information
  clientId: { type: String, default: "" },
  clientIdType: { type: String, default: "" },
  clientName: { type: String, default: "" },
  clientMobile: { type: String, default: "" },
  clientEmail: { type: String, default: "" },
  clientAddress: { type: String, default: "" },
  clientState: { type: String, default: "" },
  clientPinCode: { type: String, default: "" },

  // Proposal/Invoice Info
  formType: { type: String, default: "" }, //dpi or cpi
  proposalDate: { type: String, default: "" },
  invoiceNumber: { type: String, default: "" },
  invoiceGeneratedBy: { type: String, default: "" },

  // System Configuration
  systemType: { type: String, default: "" },
  systemConnection: { type: String, default: "" },
  gridType: { type: String, default: "" },
  electricSupply: { type: String, default: "" },

  // Module Details
  brand: { type: String, default: "" },
  type: { type: String, default: "" },
  moduleTechnology: { type: String, default: "" },
  moduleWatt: { type: Number, default: 0 },
  quantity: { type: Number, default: 0 },
  modRequired1: { type: Boolean, default: false },

  // Inverter Details
  inverterBrand: { type: String, default: "" },
  inverterPower: { type: Number, default: 0 },
  inverterQuantity: { type: Number, default: 0 },
  invRequired4: { type: Boolean, default: false },

  // Battery Details
  batteryBrand: { type: String, default: "" },
  batteryType: { type: String, default: "" },
  batteryCapacity: { type: String, default: "" },
  batteryQuantity: { type: Number, default: 0 },
  batteryRequired9: { type: Boolean, default: false },

  // Costing & Charges
  totalProjectValue: { type: Number, default: 0 },
  supplyPercentage: { type: Number, default: 0 },
  applicationCost: { type: Number, default: 0 },
  meterCost: { type: Number, default: 0 },
  caCertificate: { type: Number, default: 0 },
  fitnessCertificate: { type: Number, default: 0 },
  extraHeightTotalCost: { type: Number, default: 0 },
  transportationCost: { type: Number, default: 0 },
  miscellaneousExpenses: { type: Number, default: 0 },
  liaisonCost: { type: Number, default: 0 },
  pricePerWattIncGst: { type: Number, default: 0 },
  TotalInvoiceAmoutCalculated: { type: Number, default: 0 },

  // Discounts
  discount: { type: String, default: "" },
  materialDiscount: { type: Number, default: 0 },
  installationDiscount: { type: Number, default: 0 },
  erectionDiscount: { type: Number, default: 0 },
  netMeteringDiscount: { type: Number, default: 0 },

  // Rating
  PVTotalRatingKW: { type: Number, default: 0 },

  // Freebies / Extra
  freeMaterial: { type: String, default: "" },

  // HSNSAC
  hsnsacCode2: { type: String, default: "" },
  hsnsacCode2Inverter: { type: String, default: "" },
  hsnsacCode2Solar: { type: String, default: "" },

  // Additional Materials
  mat1Required3: { type: Boolean, default: false },
  mat1DCCableMaterial: { type: String, default: "Copper" },
  mat2Required5: { type: Boolean, default: false },
  mat2ACCableMaterial: { type: String, default: "Aluminium" },
  busMcbRequired6: { type: Boolean, default: false },
  fireERequired7: { type: Boolean, default: false },
  autoCleanRequired8: { type: Boolean, default: false },
  
  // Structure Info
  stRoofRequired2: { type: Boolean, default: false },
  stTinRequired2: { type: Boolean, default: false },
  
  status: { type: String, default: "" } // default "", if payment is done then "Active"
}, { timestamps: true });

const ProformaInvoicesModel = mongoose.model("proformainvoices_tables", ProformaInvoicesSchema);

export default ProformaInvoicesModel;