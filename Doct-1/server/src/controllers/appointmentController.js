import { validationResult } from "express-validator";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import {
  createDemoAppointment,
  demoDoctor,
  getDemoAppointments,
  updateDemoAppointmentStatus
} from "../utils/demoStore.js";

const uploadsDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../uploads");
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const appointmentPopulation = [
  { path: "patient", select: "name email phone" },
  { path: "doctor", populate: { path: "user", select: "name email phone" } }
];

const canAccessAppointment = async (appointment, user) => {
  if (user.role === "admin" || appointment.patient.toString() === user._id.toString()) return true;
  if (user.role !== "doctor") return false;

  const doctor = await Doctor.findOne({ user: user._id }).select("_id");
  return doctor?._id.toString() === appointment.doctor.toString();
};

export const createAppointment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const doctor = mongoose.connection.readyState === 1
      ? await Doctor.findOne({ _id: req.body.doctor, isApproved: true })
      : req.body.doctor === demoDoctor._id ? demoDoctor : null;
    if (!doctor) return res.status(404).json({ message: "Approved doctor not found" });

    const appointmentDate = new Date(`${req.body.appointmentDate}T00:00:00.000Z`);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (appointmentDate < today) {
      return res.status(422).json({ message: "Appointment date cannot be in the past" });
    }

    const [slotHours, slotMinutes] = req.body.timeSlot.split(":").map(Number);
    const selectedMinutes = slotHours * 60 + slotMinutes;
    const isAvailable = doctor.availability.some((entry) => {
      const [startHours, startMinutes] = entry.startTime.split(":").map(Number);
      const [endHours, endMinutes] = entry.endTime.split(":").map(Number);
      const start = startHours * 60 + startMinutes;
      const end = endHours * 60 + endMinutes;

      return entry.day === dayNames[appointmentDate.getUTCDay()]
        && selectedMinutes >= start
        && selectedMinutes + 30 <= end
        && (selectedMinutes - start) % 30 === 0;
    });
    if (!isAvailable) {
      return res.status(422).json({ message: "Selected time is outside the doctor's availability" });
    }

    if (mongoose.connection.readyState !== 1) {
      const appointment = createDemoAppointment({
        patient: req.user,
        appointmentDate: appointmentDate.toISOString(),
        timeSlot: req.body.timeSlot,
        reason: req.body.reason
      });
      return res.status(201).json(appointment);
    }

    const conflict = await Appointment.exists({
      doctor: doctor._id,
      appointmentDate,
      timeSlot: req.body.timeSlot,
      status: { $ne: "cancelled" }
    });
    if (conflict) return res.status(409).json({ message: "This time slot has just been booked" });

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctor._id,
      appointmentDate,
      timeSlot: req.body.timeSlot,
      reason: req.body.reason
    });

    res.status(201).json(await appointment.populate(appointmentPopulation));
  } catch (error) {
    next(error);
  }
};

export const listMyAppointments = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(getDemoAppointments(req.user));
    }

    let query = {};

    if (req.user.role === "patient") {
      query.patient = req.user._id;
    } else if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ user: req.user._id });
      query.doctor = doctor?._id;
    }

    const appointments = await Appointment.find(query)
      .populate(appointmentPopulation)
      .sort({ appointmentDate: 1, timeSlot: 1 });

    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { status } = req.body;

    if (mongoose.connection.readyState !== 1) {
      return res.json(updateDemoAppointmentStatus(req.params.id, status, req.user));
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
        return res.status(403).json({ message: "Cannot update another doctor's appointment" });
      }

      const allowed = {
        pending: ["confirmed", "cancelled"],
        confirmed: ["completed", "cancelled"],
        completed: [],
        cancelled: []
      };
      if (!allowed[appointment.status].includes(status)) {
        return res.status(422).json({ message: `Cannot change ${appointment.status} appointment to ${status}` });
      }
    }

    if (req.user.role === "patient") {
      if (appointment.patient.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Cannot update another patient's appointment" });
      }
      if (status !== "cancelled" || !["pending", "confirmed"].includes(appointment.status)) {
        return res.status(422).json({ message: "Patients can only cancel pending or confirmed appointments" });
      }
    }

    appointment.status = status;
    await appointment.save();
    res.json(await appointment.populate(appointmentPopulation));
  } catch (error) {
    next(error);
  }
};

export const uploadDocument = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (!req.file) return res.status(422).json({ message: "Document is required" });

    const isPatient = appointment.patient.toString() === req.user._id.toString();
    if (!isPatient && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only the patient or admin can upload documents" });
    }

    appointment.documents.push({
      originalName: req.file.originalname,
      fileName: req.file.filename,
      path: req.file.path,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user._id
    });

    await appointment.save();
    res.status(201).json(appointment.documents.at(-1));
  } catch (error) {
    next(error);
  }
};

export const downloadDocument = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (!(await canAccessAppointment(appointment, req.user))) {
      return res.status(403).json({ message: "You cannot access this appointment's documents" });
    }

    const document = appointment.documents.id(req.params.documentId);
    if (!document) return res.status(404).json({ message: "Document not found" });

    const filePath = path.resolve(uploadsDirectory, document.fileName);
    if (!filePath.startsWith(`${uploadsDirectory}${path.sep}`)) {
      return res.status(400).json({ message: "Invalid document path" });
    }

    res.download(filePath, document.originalName);
  } catch (error) {
    next(error);
  }
};
