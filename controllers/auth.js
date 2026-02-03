const User = require('../models/User'); // Sequelize model
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');

// Register a new user
const register = async (req, res) => {
  const user = await User.create({ ...req.body }); // Sequelize create
  const token = user.createJWT(); // Instance method
  res.status(StatusCodes.CREATED).json({
    user: {
      email: user.email,
      lastName: user.lastName,
      location: user.location,
      name: user.name,
      token,
    },
  });
};

// Login user
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Please provide email and password');
  }

  // Find user by email (Sequelize syntax)
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials');
  }

  // Compare password (instance method)
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials');
  }

  // Generate token
  const token = user.createJWT();
  res.status(StatusCodes.OK).json({
    user: {
      email: user.email,
      lastName: user.lastName,
      location: user.location,
      name: user.name,
      token,
    },
  });
};

// Update user profile
const updateUser = async (req, res) => {
  const { email, name, lastName, location } = req.body;

  if (!email || !name || !lastName || !location) {
    throw new BadRequestError('Please provide all values');
  }

  // Find user by ID (Sequelize syntax)
  const user = await User.findByPk(req.user.userId);
  if (!user) {
    throw new UnauthenticatedError('User not found');
  }

  // Update user fields
  user.email = email;
  user.name = name;
  user.lastName = lastName;
  user.location = location;

  // Save updated user (Sequelize save)
  await user.save();

  // Generate new token
  const token = user.createJWT();
  res.status(StatusCodes.OK).json({
    user: {
      email: user.email,
      lastName: user.lastName,
      location: user.location,
      name: user.name,
      token,
    },
  });
};

module.exports = {
  register,
  login,
  updateUser,
};