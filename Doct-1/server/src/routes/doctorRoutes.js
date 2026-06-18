import express from "express";
import { body } from "express-validator";
import {
  getDoctor,
  getAvailableSlots,
  getMyDoctorProfile,
  listDoctors,
  upsertMyDoctorProfile
} from "../controllers/doctorController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

const doctorProfileValidation = [
  body("specialty").trim().notEmpty().withMessage("Specialty is required"),
  body("qualification").trim().notEmpty().withMessage("Qualification is required"),
  body("experience").optional().isNumeric(),
  body("consultationFee").optional().isNumeric(),
  body("location").trim().notEmpty().withMessage("Location is required"),
  body("availability").optional().isArray()
];

router.get("/", listDoctors);
router.get("/me", protect, authorize("doctor"), getMyDoctorProfile);
router.put("/me", protect, authorize("doctor"), doctorProfileValidation, upsertMyDoctorProfile);
router.get("/:id/slots", getAvailableSlots);
router.get("/:id", getDoctor);

export default router;
