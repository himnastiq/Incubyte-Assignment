import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import * as vehicleController from "../controllers/vehicleController";

const router = Router();

// All vehicle routes require authentication
router.use(authenticate);

// Search must come BEFORE :id routes to prevent Express from matching "search" as an :id
router.get("/search", vehicleController.searchVehicles);

// Public (any authenticated user) routes
router.get("/", vehicleController.getVehicles);
router.post("/:id/purchase", vehicleController.purchaseVehicle);

// Admin-only routes
router.post("/", authorize("admin"), vehicleController.createVehicle);
router.put("/:id", authorize("admin"), vehicleController.updateVehicle);
router.delete("/:id", authorize("admin"), vehicleController.deleteVehicle);
router.post("/:id/restock", authorize("admin"), vehicleController.restockVehicle);

export default router;
