import express from "express";
import { body } from "express-validator";
import {
  createAppointment,
  downloadDocument,
  listMyAppointments,
  updateAppointmentStatus,
  uploadDocument
} from "../controllers/appointmentController.js";
import { authorize, protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(listMyAppointments)
  .post(
    authorize("patient"),
    [
      body("doctor").isMongoId().withMessage("Doctor is required"),
      body("appointmentDate").isISO8601().withMessage("Valid appointment date is required"),
      body("timeSlot").matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage("Valid time slot is required"),
      body("reason").trim().notEmpty().withMessage("Reason is required")
    ],
    createAppointment
  );

router.patch(
  "/:id/status",
  authorize("patient", "doctor", "admin"),
  body("status").isIn(["pending", "confirmed", "completed", "cancelled"]),
  updateAppointmentStatus
);

router.post("/:id/documents", authorize("patient", "admin"), upload.single("document"), uploadDocument);
router.get("/:id/documents/:documentId", downloadDocument);

export default router;
