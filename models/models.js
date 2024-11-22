import mongoose from 'mongoose';

// User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
});
const User = mongoose.model('User', UserSchema);

// Flight Schema
const FlightSchema = new mongoose.Schema({
  flightNumber: { type: String, required: true, unique: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  date: { type: String, required: true },
  price: { type: Number, required: true },
  seatsAvailable: { type: Number, required: true },
});
const Flight = mongoose.model('Flight', FlightSchema);

// Booking Schema
const BookingSchema = new mongoose.Schema({
  flightNumber: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seatsBooked: { type: Number, required: true },
});
const Booking = mongoose.model('Booking', BookingSchema);

export { User, Flight, Booking };
