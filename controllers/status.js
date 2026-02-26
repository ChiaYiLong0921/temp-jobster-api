const { sequelize } = require('../db/connect');
const { performance } = require('perf_hooks');

const healthCheck = async (req, res) => {
  const start = performance.now();
  try {
    // Database connectivity
    await sequelize.authenticate(); 
    
    const duration = Math.round(performance.now() - start);

    res.status(200).json({
      status: 'healthy',
      db_latency_ms: duration,
      uptime: Math.floor(process.uptime())
    });
  } catch (error) {
    const duration = Math.round(performance.now() - start);
    res.status(500).json({ 
      status: 'unhealthy', 
      db_latency_ms: duration,
      error: error.message 
    });
  }
}

module.exports = {
  healthCheck
};