// models/Patient.js
import mongoose from 'mongoose';

const appointmentSchema = mongoose.Schema({
  patientName: {
    type: String,
    required: true,
  },
  doctorName: {
    type: String,
    required: true,
    unique: true,
  },
  dateAndTime: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    // required: true,
  }
}, { collection :"a0_appointments", timestamps: true });

export const Appointment = mongoose.model('Appointment', appointmentSchema);
