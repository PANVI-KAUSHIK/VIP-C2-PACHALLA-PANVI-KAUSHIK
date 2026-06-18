import express from "express";
import { body } from "express-validator";
import {
  dashboardStats,
  listDoctorApplications,
  setDoctorApproval
} from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/stats", dashboardStats);
router.get("/doctors", listDoctorApplications);
router.patch("/doctors/:id/approval", body("isApproved").isBoolean(), setDoctorApproval);

export default router;
