const { Sequelize } = require('sequelize');

// Load environment variables
const user = process.env.POSTG_USER;
const host = process.env.POSTG_HOST;
const database = process.env.POSTG_DB;
const port = process.env.POSTG_PORT;
const password = process.env.POSTG_PASSWORD;

// Create Sequelize instance
const sequelize = new Sequelize(database, user, password, {
  host: host,
  port: port,
  dialect: 'postgres',
  logging: false, // Disable logging (optional)
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Function to initialize the database
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL via Sequelize');

    // Import models here to avoid circular dependencies
    require('../models/User');
    require('../models/Job');

    // Sync models with the database
    await sequelize.sync({ alter: true }); // Use { force: true } carefully!
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Export the Sequelize instance and initialization function
module.exports = { sequelize, initializeDatabase };