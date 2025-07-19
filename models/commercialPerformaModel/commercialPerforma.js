import mongoose from "mongoose";

const CommercialPerformaSchema = new mongoose.Schema(
  {
    // Basic Info
    otp: String,
    TDPIC: String,
    ClientId: String,
    ClientMobile: String,
    ClientName: String,
    ClientIdType: String,
    ClientEmail: String,
    ClientAddress: String,
    ClientState: String,
    ClientPinCode: String,
    proposalDate: {
      type: Date,
      default: Date.now,
    },
    systemType: String,
    systemConnection: String,
    gridType: String,
    electricSupply: String,
    invoiceGeneratedBy: String,
    finalPrice: Number,
    supplyPercentage: Number,
    pricePerWattIncGst: Number,
    totalKW: Number,
    formType: String,
    hsnsacCode2: String,
    hsnsacCode2Inverter: String,
    hsnsacCode2Solar: String,

    // === Group 1: Modules ===
    modRequired1: Boolean,
    modQUnit1: String,
    modBrand1: String,
    modType1: String, 
    modTech1: String,
    modRating1: Number,
    modQuantity1: Number,

    // === Group 2: HSNSAC + Structure ===
    stRoofRequired2: Boolean,
    stRoofQuantity2: String,
    stRoofQUnit2: String,
    stTinRequired2: Boolean,
    stTinQuantity2: String,
    stTinQUnit2: String,

    // === Group 3: Material 1 ===
    mat1Required3: Boolean,
    mat1Quantity3: String,//NN
    mat1QUnit3: String,//NN

    // === Group 4: Inverter ===
    invRequired4: Boolean,//ADDED
    invBrand4: String,
    invRating4: Number,
    invQuantity4: String,
    invQUnit4: String,

    // === Group 5: Material 2 ===
    mat2Required5: Boolean,
    mat2Quantity5: String,//NN
    mat2QUnit5: String,//NN

    // === Group 6: Bus MCB ===
    busMcbRequired6: Boolean,
    busMcbQuantity6: String,//NN
    busMcbQUnit6: String,//NN

    // === Group 7: Fire Extinguisher ===
    fireERequired7: Boolean,
    fireEQuantity7: String,//NN
    fireEQUnit7: String,//NN

    // === Group 8: Auto Cleaning ===
    autoCleanRequired8: Boolean,
    autoCleanQuantity8: String,//NN
    autoCleanQUnit8: String,//NN

    // === Batteries === //NOT ADDED IN PDF
    batteryRequired: Boolean,//ADDED
    batteryBrand: String,
    batteryType: String,
    batteryCapacity: String,
    batteryQuantity: String
  },
  {
    timestamps: true,
  }
);

const CommercialPerforma = mongoose.model(
  "CommercialPerforma",
  CommercialPerformaSchema
);

export default CommercialPerforma;
