const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/connect'); // Import sequelize

// Define the Job model
const Job = sequelize.define(
  'Job',
  {
    company: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: {
          args: [1, 50],
          msg: 'Company name must be between 1 and 50 characters',
        },
      },
    },
    position: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: {
          args: [1, 100],
          msg: 'Position must be between 1 and 100 characters',
        },
      },
    },
    status: {
      type: DataTypes.ENUM('interview', 'declined', 'pending'),
      defaultValue: 'pending',
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Reference to the Users table
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    jobType: {
      type: DataTypes.ENUM('full-time', 'part-time', 'remote', 'internship'),
      defaultValue: 'full-time',
    },
    jobLocation: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'my city',
      validate: {
        len: {
          args: [1, 100],
          msg: 'Job location must be between 1 and 100 characters',
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Associate Job with User
Job.belongsTo(sequelize.models.User, {
  foreignKey: 'createdBy',
  as: 'user',
});

module.exports = Job;