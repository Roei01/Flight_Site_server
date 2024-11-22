import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB Schemas
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
});

const FlightSchema = new mongoose.Schema({
  flightNumber: { type: String, required: true, unique: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  date: { type: String, required: true },
  price: { type: Number, required: true },
  seatsAvailable: { type: Number, required: true },
});

const BookingSchema = new mongoose.Schema({
  flightNumber: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seatsBooked: { type: Number, required: true },
});

const User = mongoose.model('User', UserSchema);
const Flight = mongoose.model('Flight', FlightSchema);
const Booking = mongoose.model('Booking', BookingSchema);

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).send('Access denied');
  }

  try {
    const decoded = jwt.verify(token, 'secretKey');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send('Invalid token');
  }
}

// Routes
// User registration
app.post('/register', async (req, res) => {
  const { username, firstName, lastName, email, password, dateOfBirth } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      dateOfBirth,
    });
    await newUser.save();
    res.status(201).send({ message: 'User registered' });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).send('Username or email already exists');
    } else {
      res.status(500).send('Error registering user');
    }
  }
});

// User login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).send('User not found');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).send('Invalid credentials');

  const token = jwt.sign(
    { id: user._id, username: user.username, firstName: user.firstName, lastName: user.lastName },
    'secretKey',
    { expiresIn: '1h' }
  );
  res.json({ token });
});

// Fetch all flights
app.get('/flights', async (req, res) => {
  try {
    const { origin, destination, date } = req.query;

    // בניית מסנן דינמי
    const searchCriteria = {};
    if (origin) searchCriteria.origin = origin;
    if (destination) searchCriteria.destination = destination;
    if (date) searchCriteria.date = date;

    // חיפוש טיסות בהתבסס על המסנן
    const flights = await Flight.find(searchCriteria);
    res.json(flights);
  } catch (error) {
    console.error('Error searching flights:', error.message);
    res.status(500).send('Error searching flights');
  }
});

// Fetch user bookings
app.get('/bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error.message);
    res.status(500).send('Error fetching bookings');
  }
});
app.post('/bookings', authenticateToken, async (req, res) => {
  const { flightNumber, seats } = req.body;

  if (!flightNumber || !seats) {
    return res.status(400).send('Missing flight number or seats');
  }

  try {
    const flight = await Flight.findOne({ flightNumber });

    if (!flight) {
      return res.status(404).send('Flight not found');
    }

    // Check if the user already has a booking
    const existingBooking = await Booking.findOne({ flightNumber, userId: req.user.id });

    if (existingBooking) {
      // Cancel the existing booking
      flight.seatsAvailable += existingBooking.seatsBooked; // Return seats to the flight
      await flight.save();

      await Booking.deleteOne({ _id: existingBooking._id }); // Delete the booking
      return res.json({ message: 'Booking canceled successfully', flight });
    }

    // Create a new booking if not booked already
    if (flight.seatsAvailable < seats) {
      return res.status(400).send('Not enough seats available');
    }

    flight.seatsAvailable -= seats;
    await flight.save();

    const newBooking = new Booking({
      flightNumber,
      userId: req.user.id,
      seatsBooked: seats,
    });
    await newBooking.save();

    res.json({ message: 'Booking successful', flight });
  } catch (error) {
    console.error('Error processing booking:', error.message);
    res.status(500).send('Error processing booking');
  }
});

app.get('/search-flights', async (req, res) => {
  const { origin, destination, date } = req.query;

  try {
    // בניית קריטריונים דינמיים על בסיס הפרמטרים שהתקבלו
    const searchCriteria = {};
    if (origin) searchCriteria.origin = { $regex: new RegExp(origin, 'i') }; // חיפוש גמיש
    if (destination) searchCriteria.destination = { $regex: new RegExp(destination, 'i') }; // חיפוש גמיש
    if (date) searchCriteria.date = date; // חיפוש מדויק לפי תאריך

    const flights = await Flight.find(searchCriteria); // חיפוש בבסיס הנתונים
    res.json(flights);
  } catch (error) {
    console.error('Error searching flights:', error.message);
    res.status(500).send('Error searching flights');
  }
});





// MongoDB connection
mongoose
  .connect('mongodb://localhost:27017/Flight_Site')
  .then(async () => {
    console.log('MongoDB connected');

    // Initialize sample flights
    const existingFlights = await Flight.find();
    if (existingFlights.length === 0) {
      await Flight.insertMany([
        { flightNumber: 'FL123', origin: 'TLV', destination: 'JFK', date: '2024-12-01', price: 500, seatsAvailable: 20 },
        { flightNumber: 'FL456', origin: 'TLV', destination: 'LAX', date: '2024-12-02', price: 600, seatsAvailable: 15 },
        { flightNumber: 'FL789', origin: 'JFK', destination: 'TLV', date: '2024-12-03', price: 550, seatsAvailable: 25 },
        { flightNumber: 'FL101', origin: 'LAX', destination: 'TLV', date: '2024-12-04', price: 650, seatsAvailable: 10 },
      ]);
      console.log('Sample flights initialized');
    }
  })
  .catch(err => console.error(err));

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
