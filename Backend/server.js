import express from "express";
import { PORT, mongoDBUrl } from "./config.js";
import cors from "cors";
import mongoose from 'mongoose';
import patientRoutes from './api/routes/PatientRoute.js';
import doctorRoutes from "./api/routes/DoctorRoute.js";
const app = express();

app.use(express.json());
const corsOptions = {
  origin: (origin, callback) => {
    // If no origin is provided (like when accessing from the same domain), allow it
    if (!origin) {
      callback(null, true);
    } else {
      callback(null, origin); // Allow the origin dynamically
    }
  },
  credentials: true, // Allow credentials (cookies, etc.)
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific methods including DELETE
};

app.use(cors(corsOptions));

app.get('/', (req, res) => {
  return res.status(234).send('hello world');
});

app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);

mongoose
  .connect(mongoDBUrl)
  .then(() => {
    console.log('App connected to database');
  })
  .catch((error) => {
    console.log(error);
  });

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`App is listening to port: ${PORT}`);
  });
}

export default app;