import express from "express";

// Import the controller functions
import {
  createCommercialPerforma,
  getCommercialPerforma,
  getAllCommercialPerformas,
} from "../../controllers/commercialPerformaControllers/commercialPerforma.js";
 
const router = express.Router();

// Route to create a new Commercial Performa
router.post("/create",  createCommercialPerforma);
// Route to get a specific Commercial Performa by ID
router.get("/getSingle/:id",   getCommercialPerforma);
// Route to get all Commercial Performas
router.get("/getAll",   getAllCommercialPerformas);

// Export the router
export default router;
