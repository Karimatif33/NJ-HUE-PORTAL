// authenticateToken.js
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: 'https://login.microsoftonline.com/common/discovery/keys'
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error('Error fetching signing key:', err);
      return callback(err, null);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}
const authenticateToken = (req, res, next) => {
    console.log('Headers:', req.headers); // Debugging line to check headers
    const authHeader = req.headers['authorization']; // Check header name
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header is missing' });
    }
    
    const token = authHeader.split(' ')[1]; // Extract token from 'Bearer <token>'
  
    if (!token) {
      return res.status(401).json({ error: 'Token is missing' });
    }
  
    jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Token verification failed' });
      }
  
      req.user = user; // Attach user data to request
      req.username = user.username; // Assuming username is part of the user data
      next();
    });
  };
  
  

module.exports = authenticateToken;
