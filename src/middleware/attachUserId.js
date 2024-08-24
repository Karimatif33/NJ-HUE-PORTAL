// middleware/attachUserId.js
const { getToken, getUserId } = require('../controller/AuthController');


  
  const attachUserId = (req, res, next) => {
    const username = req.headers['username']; // Assuming username is sent in headers
    console.log('Received Username:', username); // Log username for debugging
    req.userId = getUserId(username);
    console.log('Attached User ID:', req.userId); // Log userId for debugging
    next();
  };
  
  module.exports = attachUserId;
  