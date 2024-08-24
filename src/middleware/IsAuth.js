const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Set up JWKS client
const client = jwksClient({
  jwksUri: 'https://login.microsoftonline.com/common/discovery/keys'
});

// Get signing key from JWKS
function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error('Error fetching signing key:', err);
      return callback(err, null);
    }
    const signingKey = key.getPublicKey();
    console.log('Retrieved Signing Key:', signingKey);
    callback(null, signingKey);
  });
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Authorization header is missing' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token is missing' });

  jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
    if (err) {
      console.error('Error verifying token:', err);
      return res.status(403).json({ error: 'Token verification failed' });
    }

    req.user = {
      username: decoded.preferred_username || 'unknown',
      userId: decoded.sub || 'unknown',
      role: /^\d+$/.test(decoded.sub) ? 'student' : 'admin'
    };

    next();
  });
};

module.exports = authenticateToken;
