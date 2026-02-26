const express = require('express')
const router = express.Router()

const rateLimiter = require('express-rate-limit')

const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: (req) => req.headers['x-health-check-key'] === process.env.HEALTH_CHECK_SECRET,
  message: {
    msg: 'Too many requests from this IP, please try again after 15 minutes',
  },
})
const { healthCheck } = require('../controllers/status')
router.get('/', apiLimiter, healthCheck)

module.exports = router