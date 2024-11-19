import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const AMADEUS_API_KEY = 'YOUR_AMADEUS_API_KEY'; // Replace with Amadeus API key
const AMADEUS_API_SECRET = 'YOUR_AMADEUS_API_SECRET'; // Replace with Amadeus API secret
const AMADEUS_TOKEN_URL = 'https://test.api.amadeus.com/v1/security/oauth2/token';
const AMADEUS_FLIGHTS_URL = 'https://test.api.amadeus.com/v2/shopping/flight-offers';

const corsOptions = {
  origin: 'https://flight-site-client.onrender.com', // Match your Angular app URL
  optionsSuccessStatus: 200,
};

// Middleware
app.use(bodyParser.json());
app.use(cors(corsOptions));

// MongoDB Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
});

const User = mongoose.model('User', UserSchema);

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

// Helper function to fetch Amadeus access token
async function getAmadeusToken() {
  try {
    const response = await axios.post(AMADEUS_TOKEN_URL, null, {
      params: {
        grant_type: 'client_credentials',
        client_id: AMADEUS_API_KEY,
        client_secret: AMADEUS_API_SECRET,
      },
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching Amadeus access token:', error.response?.data || error.message);
    throw new Error('Failed to fetch Amadeus access token');
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

// Fetch flights
app.get('/flights', async (req, res) => {
  const { origin, destination, date } = req.query;

  if (!origin || !destination || !date) {
    return res.status(400).json({ error: 'Missing required parameters: origin, destination, or date.' });
  }

  try {
    const token = await getAmadeusToken();

    const response = await axios.get(AMADEUS_FLIGHTS_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate: date,
        adults: 1,
      },
    });

    const flights = response.data.data.map(flight => ({
      flightNumber: flight.itineraries[0].segments[0].carrierCode + flight.itineraries[0].segments[0].number,
      origin: flight.itineraries[0].segments[0].departure.iataCode,
      destination: flight.itineraries[0].segments[0].arrival.iataCode,
      date: flight.itineraries[0].segments[0].departure.at,
      price: flight.price.total,
      bookingLink: `https://www.example.com/book/${flight.id}`, // Replace with actual booking URL
    }));

    res.json(flights);
  } catch (error) {
    console.error('Error fetching flight data from Amadeus:', error.response?.data || error.message);
    res.status(500).send('Error fetching flight data');
  }
});

// Book a flight
app.post('/bookings', (req, res) => {
  const { flightNumber } = req.body;

  if (!flightNumber) {
    return res.status(400).send('Missing flight number');
  }

  // Find flight in sample data (you can extend this with a database lookup)
  const flight = flights.find(f => f.flightNumber === flightNumber);

  if (flight) {
    res.json({
      message: `Your booking for flight ${flightNumber} was successful!`,
      bookingLink: flight.bookingLink,
    });
  } else {
    res.status(404).json({ error: 'Flight not found' });
  }
});

// MongoDB connection
mongoose
  .connect('mongodb+srv://royinagar3:<QBqyVTkhtqiNgzgv>@flightsite.kbcwv.mongodb.net/?retryWrites=true&w=majority&appName=Flightsite')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
