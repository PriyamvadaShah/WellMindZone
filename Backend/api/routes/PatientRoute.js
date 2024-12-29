// routes/patientRoutes.js
import express from 'express';
import { registerPatient, loginPatient, getAllPatients, deletePatient, scheduleAppointment, appointments, deleteAppointment } from '../controllers/PatientController.js';

const router = express.Router();

// Route for registering a new patient
router.post('/register-patient', registerPatient);

// Route for logging in a patient
router.post('/login-patient', loginPatient);

router.get("/get-patients", getAllPatients);

router.post("/delete-patient", deletePatient);
router.post("/schedule-appointment", scheduleAppointment);
router.get("/appointments", appointments);
router.post("/delete-appointment", deleteAppointment);
export default router;
