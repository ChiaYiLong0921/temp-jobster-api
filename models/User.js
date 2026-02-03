const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../db/connect'); // Import sequelize

// Define the User model
const User = sequelize.define(
  'User',
  {
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: {
          args: [3, 50],
          msg: 'Name must be between 3 and 50 characters',
        },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Please provide a valid email',
        },
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: {
          args: [6, 255],
          msg: 'Password must be at least 6 characters',
        },
      },
    },
    lastName: {
      type: DataTypes.STRING(20),
      defaultValue: 'lastName',
      validate: {
        len: {
          args: [0, 20],
          msg: 'Last name must be at most 20 characters',
        },
      },
    },
    location: {
      type: DataTypes.STRING(20),
      defaultValue: 'my city',
      validate: {
        len: {
          args: [0, 20],
          msg: 'Location must be at most 20 characters',
        },
      },
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

// Instance methods
User.prototype.createJWT = function () {
  return jwt.sign(
    { userId: this.id, name: this.name },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );
};

User.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;