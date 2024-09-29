"use strict";
const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require('cors');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const logger = require("./model/logger");
const AllRoutes = require("./routes/AllRoutes");
const UiRoutes = require("./routes/UiRoutes");
const AuthRoutes = require("./routes/AuthRoutes");
const winston = require('winston');
const errorHandler = require('./middleware/errorHandler');
const authenticateToken = require("./middleware/IsAuth");
const passport = require('passport');
const BearerStrategy = require('passport-azure-ad').BearerStrategy;
const isAdmin = require("./middleware/IsAdmin");
const { AuthController } = require("./controller/AuthController");
require("dotenv").config();
require("./db/dbConnect");

const app = express();
const port = process.env.PORT || 3000;


// uncommit to save into log

// const outputPath = path.join(__dirname, '/LogOutput/LogOutput.json');

// // Function to strip ANSI color codes
// function stripAnsiCodes(str) {
//     return str.replace(/\u001b\[\d{1,2}m/g, '');
// }

// // Override process.stdout.write to capture console output
// const originalWrite = process.stdout.write;

// process.stdout.write = function (chunk, encoding, callback) {
//     let message = chunk.toString().trim();

//     if (message) {
//         // Strip ANSI color codes from the message
//         message = stripAnsiCodes(message);

//         const logEntry = {
//             timestamp: new Date().toISOString(),
//             message: message
//         };

//         // Append the log entry to the file
//         fs.appendFileSync(outputPath, JSON.stringify(logEntry, null, 2) + ',\n');
//     }

//     // Call the original process.stdout.write to print to the terminal
//     originalWrite.apply(process.stdout, arguments);
// };



// Configure HTTPS options

const options = {
  key: fs.readFileSync('localhost-key.pem'),
  cert: fs.readFileSync('localhost.pem')
};

// Custom logging with Morgan and Winston
const morganStream = {
  write: (message) => {
    logger.info(message.trim());
  }
};
app.use(morgan("combined", { stream: morganStream }));

// Middleware setup
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://login.microsoftonline.com"],
    }
  }
}));
app.use(cors()); // Allows all origins

// app.use(cors({
//   origin: 'https://knj.horus.edu.eg',
//   allowedHeaders: ['Authorization', 'Content-Type'],
//   credentials: true,
//   methods: ['GET', 'POST'],
// }));

app.use(cookieParser());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.raw({ type: '*/*', limit: '1mb' }));

// Parse raw body to string
app.use((req, res, next) => {
  req.rawBody = req.body.toString();
  next();
});

// Security headers
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://teams.microsoft.com");
  res.setHeader('X-Frame-Options', 'ALLOW-FROM https://teams.microsoft.com');
  next();
});

// Error handling middleware
app.use(errorHandler);
// Custom logging endpoint
app.post('/api/log', (req, res) => {
  if (req.body && req.body.message) {
    logger.info('Log received:', req.body);
    res.status(200).send('Log received');
  } else {
    res.status(400).send('Bad Request');
  }
});


// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET, // Replace with a strong secret key
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: true, // If using HTTPS
    httpOnly: true,
    sameSite: 'None' // Set SameSite attribute to None
  }
}));

// API routes
app.use( AuthRoutes);

app.use("/api/hue/portal/v1", AllRoutes);
app.use("/api/hue/portal/v1", UiRoutes);

// Serve static files and handle React app routing
app.use(express.static(path.join(__dirname, 'client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Request logging for debugging
app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
});


app.use(isAdmin);

// ///////////////////////////

// app.use(cors({
//   origin: 'http://10.11.11.15:3000',
//   allowedHeaders: ['Authorization', 'Content-Type'],
//   credentials: true,
//   methods: ['GET', 'POST'],
// }));

// Set up routes


// ///////////////////////////





// Start HTTPS server
https.createServer(options, app).listen(port, () => {
  console.log(`HTTPS server is running on https://knj.horus.edu.eg Port - ${port}`);
});







