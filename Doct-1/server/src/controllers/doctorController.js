import { validationResult } from "express-validator";
import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import {
  demoDoctor,
  getDemoDoctorForUser,
  listDemoDoctors,
  updateDemoDoctor
} from "../utils/demoStore.js";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const toMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const toTime = (minutes) => (
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`
);

export const listDoctors = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(listDemoDoctors());
    }

    const { specialty, location, q } = req.query;
    const query = { isApproved: true };

    if (specialty) query.specialty = new RegExp(specialty, "i");
    if (location) query.location = new RegExp(location, "i");
    if (q) query.$text = { $search: q };

    const doctors = await Doctor.find(query).populate("user", "name email phone").sort({ createdAt: -1 });
    res.json(doctors);
  } catch (error) {
    next(error);
  }
};

export const getDoctor = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1 && req.params.id === demoDoctor._id) {
      return res.json(demoDoctor);
    }

    const doctor = await Doctor.findOne({ _id: req.params.id, isApproved: true }).populate("user", "name email phone");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.json(doctor);
  } catch (error) {
    next(error);
  }
};

export const getAvailableSlots = async (req, res, next) => {
  try {
    const date = new Date(`${req.query.date}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) return res.status(422).json({ message: "Valid date is required" });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (date < today) return res.status(422).json({ message: "Appointment date cannot be in the past" });

    const doctor = mongoose.connection.readyState === 1
      ? await Doctor.findOne({ _id: req.params.id, isApproved: true })
      : req.params.id === demoDoctor._id ? demoDoctor : null;
    if (!doctor) return res.status(404).json({ message: "Approved doctor not found" });

    const availability = doctor.availability.filter((entry) => entry.day === dayNames[date.getUTCDay()]);
    const slots = availability.flatMap((entry) => {
      const result = [];
      for (let cursor = toMinutes(entry.startTime); cursor + 30 <= toMinutes(entry.endTime); cursor += 30) {
        result.push(toTime(cursor));
      }
      return result;
    });

    const nextDate = new Date(date);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);
    const appointments = mongoose.connection.readyState === 1
      ? await Appointment.find({
        doctor: doctor._id,
        appointmentDate: { $gte: date, $lt: nextDate },
        status: { $ne: "cancelled" }
      }).select("timeSlot")
      : [];
    const booked = new Set(appointments.map((appointment) => appointment.timeSlot));

    res.json([...new Set(slots)].filter((slot) => !booked.has(slot)));
  } catch (error) {
    next(error);
  }
};

export const upsertMyDoctorProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const payload = {
      user: req.user._id,
      specialty: req.body.specialty,
      qualification: req.body.qualification,
      experience: req.body.experience,
      consultationFee: req.body.consultationFee,
      location: req.body.location,
      bio: req.body.bio,
      availability: req.body.availability || []
    };

    if (mongoose.connection.readyState !== 1) {
      return res.json(updateDemoDoctor(req.user, payload));
    }

    const doctor = await Doctor.findOneAndUpdate({ user: req.user._id }, payload, {
      new: true,
      upsert: true,
      runValidators: true
    }).populate("user", "name email phone");

    res.json(doctor);
  } catch (error) {
    next(error);
  }
};

export const getMyDoctorProfile = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const doctor = getDemoDoctorForUser(req.user._id);
      if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });
      return res.json(doctor);
    }

    const doctor = await Doctor.findOne({ user: req.user._id }).populate("user", "name email phone");
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

    res.json(doctor);
  } catch (error) {
    next(error);
  }
};
