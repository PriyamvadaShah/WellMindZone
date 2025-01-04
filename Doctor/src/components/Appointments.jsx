import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarPlus,
  FaSearch,
  FaTrash,
  FaVideo
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {LoginContext} from "../context/LoginContext";

const Appointments = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(LoginContext);
  const [appointments, setAppointments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newAppointment, setNewAppointment] = useState({
    patientName: "",
    doctorName: "",
    dateAndTime: "",
    notes: "",
  });

  const fetchAppointments = async () => {
    try {
      const response = await fetch("http://localhost:6005/api/doctor/appointments");
      if (response.ok) {
        const result = await response.json();  // Get the full response object
        console.log("Appointments data:", result);

        // Check if result.data is an array and update appointments
        if (Array.isArray(result.data)) {
          setAppointments(result.data);
        } else {
          console.error("Expected an array but got:", result.data);
        }
      } else {
        console.error("Failed to fetch appointments:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  useEffect(() => {
  
    if (isLoggedIn) {
      fetchAppointments();
    }
  }, [isLoggedIn]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAppointment(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setNewAppointment(prev => ({ ...prev, dateAndTime: date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const appointmentData = {
        ...newAppointment,
      };
      console.log("jj", appointmentData);
      const response = await fetch("http://localhost:6005/api/doctor/schedule-appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(appointmentData),
      });
  
      if (response.ok) {
        await fetchAppointments(); // Fetch updated list after adding an appointment
        setShowForm(false);
        setNewAppointment({
          patientName: "",
          doctorName: "",
          dateAndTime: "",
          notes: "",
        });
      } else {
        const errorText = await response.text();
        console.error("Failed to schedule appointment:", errorText);
        alert("Failed to schedule appointment. Please try again.");
      }
    } catch (error) {
      console.error("Error scheduling appointment:", error);
      alert("Error scheduling appointment. Please check your connection and try again.");
    }
  };  

  const deleteAppointment = async (id) => {
    try {
      const response = await fetch('http://localhost:6005/api/doctor/delete-appointment', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appointmentId: id }),
      });
  
      if (response.ok) {
        await fetchAppointments(); 
      } else {
        console.error('Error deleting appointment:', response.statusText);
        alert('Failed to delete appointment. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error deleting appointment. Please check your connection and try again.');
    }
  };
    

  const filteredAppointments = appointments.filter(appointment => 
    (appointment.patientName && appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (appointment.doctorName && appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  // console.log("ll", filteredAppointments);
  return (
    <>
      {isLoggedIn ? (
        <div className="bg-light min-h-screen p-4 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-6 sm:mb-8">
            Appointment Management
          </h1>

          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-accent text-primary px-6 py-2 rounded-full font-bold flex items-center"
              onClick={() => setShowForm(!showForm)}
            >
              <FaCalendarPlus className="mr-2" />
              {showForm ? "Cancel" : "New Appointment"}
            </motion.button>
            <div className="relative w-full sm:w-auto">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search appointments..."
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-accent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {showForm && (
            <motion.form
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-lg shadow-lg mb-8"
              onSubmit={handleSubmit}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="patientName"
                  placeholder="Patient Name"
                  className="p-2 border border-gray-300 rounded"
                  value={newAppointment.patientName}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  name="doctorName"
                  placeholder="Doctor Name"
                  className="p-2 border border-gray-300 rounded"
                  value={newAppointment.doctorName}
                  onChange={handleInputChange}
                  required
                />
                <DatePicker
                  selected={newAppointment.dateAndTime}
                  onChange={handleDateChange}
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="p-2 border border-gray-300 rounded w-full"
                />
                <textarea
                  name="notes"
                  placeholder="Notes"
                  className="p-2 border border-gray-300 rounded"
                  value={newAppointment.notes}
                  onChange={handleInputChange}
                />
              </div>
              <button
                  type="submit"
                  onClick={(e) => {
                      console.log("BUTTON CLICKED");
                      handleSubmit(e);
                  }}
                  className="mt-4 bg-accent text-primary px-6 py-2 rounded-full font-bold"
              >
                  Schedule Appointment
              </button>
            </motion.form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAppointments.map((appointment) => (
              <motion.div
                key={appointment.id}
                className="bg-white p-6 rounded-lg shadow-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-semibold mb-2">
                  {appointment.patientName}
                </h3>
                <p className="text-gray-600 mb-2">
                  Doctor: {appointment.doctorName}
                </p>
                <p className="text-gray-600 mb-2">
                  Date: {appointment.dateAndTime}
                </p>
                <p className="text-gray-600 mb-4">Notes: {appointment.notes}</p>
                <div className="flex justify-between items-center">
                  <span className="px-2 py-1 rounded-full text-xs bg-yellow-200 text-yellow-800">
                    Scheduled
                  </span>
                  <div>
                    <button
                      className="text-red-500 mr-5"
                      onClick={() => deleteAppointment(appointment._id)}
                      title="Delete"
                    >
                      <FaTrash size={24} />
                    </button>
                    <button
                      className="text-red-500 mr-5"
                      onClick={() => navigate('/lobby')  
                      }
                      title="Video Call"
                    >
                      <FaVideo size={24} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <p>Please log in to view appointments.</p>
      )}
    </>
  );
};

export default Appointments;
