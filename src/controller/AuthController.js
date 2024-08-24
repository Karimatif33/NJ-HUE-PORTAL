const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');
const AsyncHandler = require('express-async-handler');
const { pool } = require('../db/dbConnect'); // Import the pool from your dbConnect

const client = jwksClient({
  jwksUri: 'https://login.microsoftonline.com/common/discovery/keys'
});

// Retrieve the signing key from JWKS endpoint
function getKey(header) {
  return new Promise((resolve, reject) => {
    client.getSigningKey(header.kid, (err, key) => {
      if (err) {
        console.error('Error fetching signing key:', err);
        return reject(err);
      }
      const signingKey = key.getPublicKey();
      console.log('Retrieved Signing Key:', signingKey); // Check if this key is correct
      resolve(signingKey);
    });
  });
}

// Function to update login timestamp
async function updateLoginTimestamp(userId) {
  console.log(userId,"userId")
  const updateLoginTimestampQuery = `
    UPDATE userdata.users
    SET last_login = CURRENT_TIMESTAMP + INTERVAL '3 hours'
    WHERE code = $1;
  `;

  const client = await pool.connect(); // Get a client from the pool
  try {
    await client.query(updateLoginTimestampQuery, [userId]);
    console.log('User login timestamp updated.');
  } catch (err) {
    console.error('Error updating login timestamp', err);
  } finally {
    // Release the client back to the pool
    client.release();
  }
}

exports.AuthController = AsyncHandler(async (req, res, next) => {
  console.log('Incoming Headers:', req.headers);

  const token = req.headers['authorization']?.split(' ')[1];
  const username = req.headers['username'];
  req.session.user = { token, username, userId: username };
  console.log('Session User Data:', req.session.user);
  updateLoginTimestamp(getUserId(username));

  if (!token || !username) {
    return res.status(400).json({ error: 'Missing token or username' });
  }

  try {
    console.log("Received Token:", token);

    const decodedHeader = jwt.decode(token, { complete: true }).header;
    console.log("Token Header:", decodedHeader);

    const signingKey = await getKey(decodedHeader);
    
    jwt.verify(token, signingKey, { algorithms: ['RS256'] }, (err, decoded) => {
      if (err) {
        console.error('Error verifying token:', err);
        return res.status(403).json({ error: 'Token verification failed' });
      }

      console.log('Verified Token:', decoded);

      const userId = getUserId(username); // Convert username to userId
      let role = /^\d+$/.test(userId) ? 'student' : 'admin';

      // Update login timestamp in the database

      res.json({
        message: `Hello ${username}, your role is ${role}`,
        user: { username, userId, role, token }
      });
    });
  } catch (err) {
    console.error('Error decoding token:', err);
    res.status(400).json({ error: 'Invalid token' });
  }
});

// Convert username to userId
const getUserId = (username) => {
  switch (username) {
    case 'katif': return 2209;
    case 'mlotfy': return 53381491;
    case 'mwadood': return 1700;
    case 'asteet': return 1388;
    case 'rkishta': return 1449;
    case 'mbakr': return 1825;
    case 'mzedan': return 2290;
    default: return username; // If no match, return the username as is
  }
};
