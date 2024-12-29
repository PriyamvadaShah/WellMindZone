// routes/patientRoutes.js
import express from 'express';
import { registerPatient, loginPatient, getAllPatients, deletePatient, scheduleAppointment, appointments, deleteAppointment } from '../controllers/DoctorController.js';

const router = express.Router();

// Route for registering a new patient
router.post('/register-doctor', registerPatient);

// Route for logging in a patient
router.post('/login-doctor', loginPatient);

router.get("/get-doctors", getAllPatients);

router.post("/delete-doctor", deletePatient);
router.post("/schedule-appointment", scheduleAppointment);
router.get("/appointments", appointments);
router.post("/delete-appointment", deleteAppointment);
export default router;
