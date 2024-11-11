import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import nodemailer from 'nodemailer';
import fs from 'fs';
import util from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const app = express();
const port = process.env.PORT || 3000;


// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const API_KEY = 'e2ee763919bb4250a91454ab15fd1b48';


const corsOptions = {
  origin: 'http://localhost:4200', // Adjust this to match your Angular app's URL
  optionsSuccessStatus: 200,
};
const flights = [
  { flightNumber: 'TL123', origin: 'TLV', destination: 'NYC', date: '2024-12-01', time: '10:00', price: 500 },
  { flightNumber: 'TL456', origin: 'TLV', destination: 'LAX', date: '2024-12-01', time: '15:00', price: 600 }
];

// Configure your email service
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'royinagar2@gmail.com',
    pass: 'pryk uqde apyp kuwl'
  }
});

// Middleware
app.use(bodyParser.json());
app.use(cors(corsOptions));



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
    const decoded = jwt.verify(token, 'secretKey'); // חשוב להחליף 'secretKey' במפתח סודי אמיתי
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send('Invalid token');
  }
}

// Routes
app.post('/register', async (req, res) => {
  const { username, firstName, lastName, email, password, dateOfBirth } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    username,
    firstName,
    lastName,
    email,
    password: hashedPassword,
    dateOfBirth,
  });

  try {
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

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).send('User not found');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).send('Invalid credentials');

  const token = jwt.sign({ id: user._id, username: user.username, firstName: user.firstName, lastName: user.lastName }, 'secretKey', { expiresIn: '1h' });
  res.json({ token });
});



// API for fetching flights with parameters
app.get('/flights', async (req, res) => {
  const { origin, destination, date } = req.query;

  try {
    const response = await axios.get('https://test.api.amadeus.com/v2/shopping/flight-offers', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      },
      params: {
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate: date,
        adults: 1
      }
    });

    const flights = response.data.data.map(flight => ({
      flightNumber: `${flight.itineraries[0].segments[0].carrierCode}${flight.itineraries[0].segments[0].number}`,
      origin: flight.itineraries[0].segments[0].departure.iataCode,
      destination: flight.itineraries[0].segments[0].arrival.iataCode,
      date: flight.itineraries[0].segments[0].departure.at,
      price: parseFloat(flight.price.total), // Ensure price is parsed correctly as a float
      bookingLink: `https://www.amadeus.com/booking/flight/${flight.id}`
    }));

    res.json(flights);
  } catch (error) {
    console.error('Error fetching flight data:', error);
    res.status(500).send('Error fetching flight data');
  }
});


// API להזמנת טיסה
app.post('/bookings', (req, res) => {
  const { flightNumber } = req.body;
  const flight = flights.find(f => f.flightNumber === flightNumber);
  if (flight) {
    res.json({ message: `הזמנתך עבור הטיסה ${flightNumber} בוצעה בהצלחה!` });
  } else {
    res.status(404).json({ error: 'הטיסה לא נמצאה' });
  }
});


// MongoDB connection
mongoose.connect('mongodb://localhost:27017/Flight_Site')
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error(err);
  });

// All other GET requests not handled before will return the Angular app
app.get('*', (req, res) => {
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
//
export default app;//