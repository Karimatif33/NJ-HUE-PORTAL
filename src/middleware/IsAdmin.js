const { pool } = require('../db/dbConnect');

const isAdmin = async (req, res, next) => {
  try {
    if (!req.session) {
      console.error('Session is undefined');
      return res.status(500).json({ error: 'Session not initialized' });
    }

    const user = req.session.user;

    if (!user || !user.username) {
      console.error('User not found in session or username is missing');
      return res.status(403).json({ error: 'Access Denied, admin only' });
    }

    const username = user.username;
    console.log('Username received in isAdmin middleware:', username);

    const userId = getUserIdFromUsername(username);

    if (!userId) {
      console.error('Invalid user ID derived from username');
      return res.status(403).json({ error: 'Access Denied, admin only' });
    }

    const queryText = 'SELECT isadmin FROM UserData.users WHERE id = $1';
    const { rows } = await pool.query(queryText, [userId]);
    const adminFound = rows[0];

    if (adminFound && adminFound.isadmin === true) {
      next();
    } else {
      console.error('User is not an admin');
      res.status(403).json({ error: 'Access Denied, admin only' });
    }
  } catch (error) {
    console.error('Error in isAdmin middleware:', error);
    next(error);
  }
};

const getUserIdFromUsername = (username) => {
  switch (username) {
    case 'katif': return 2209;
    case 'mlotfy': return 53381491;
    case 'mwadood': return 1700;
    case 'asteet': return 1388;
    case 'rkishta': return 1449;
    case 'mbakr': return 1825;
    case 'mzedan': return 2290;
    default:
      console.error('Unknown username:', username);
      return null;
  }
};

module.exports = isAdmin;
