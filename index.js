import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import commercialPerformaRoutes from "./routes/commercialPerformaRoutes/commercialPerforma.js";
import GSTInvoiceRoutes from "./routes/GSTInvoiceRoutes/GSTInvoice.js";
import proformaInvoiceRoutes from "./routes/proformaInvoicesRoutes/proformaInvoicesRoutes.js";
import paymentReceiptRoutes from "./routes/paymentReceiptRoutes/paymentReceiptRoutes.js";
import { mongoConnection } from "./dbConfig/db.js";


// Try to load .env.local first
dotenv.config({ path: '.env.local' });

// Then load .env (won't override already set variables)
dotenv.config();

console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors("*"));
app.use(express.json());

// mongoConnection();
(async () => {
  await mongoConnection();
})();

// Routes
app.get("/", (req, res) => {
  res.send("<h1>Welcome to the API - Server Running Properly </h1>");
  console.log("welcomes!!");
});

app.use("/api/v1/commercialPerforma", commercialPerformaRoutes);
app.use("/api/v1/gstinvoice", GSTInvoiceRoutes);
app.use("/api/v1/proformainvoice", proformaInvoiceRoutes);
app.use("/api/v1/paymentReceipt", paymentReceiptRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
