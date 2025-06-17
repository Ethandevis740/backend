const validateRegistration = (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  // Check required fields
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields: firstName, lastName, email, password'
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }

  // Password validation
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }

  next();
};

const validateEventRegistration = (req, res, next) => {
  const { name, email, eventId } = req.body;

  if (!name || !email || !eventId) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email, and eventId'
    });
  }

  next();
};

const validateEventIdea = (req, res, next) => {
  const { name, email, eventTitle, description, expectedDate, location, expectedAttendees } = req.body;

  if (!name || !email || !eventTitle || !description || !expectedDate || !location || !expectedAttendees) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields for event idea'
    });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateEventRegistration,
  validateEventIdea
};