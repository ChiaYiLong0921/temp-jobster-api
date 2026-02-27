require('dotenv').config()
require('express-async-errors')

const path = require('path')

// extra security packages
const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')

const express = require('express')
const app = express()

require('./models/User');
require('./models/Job');

// const connectDB = require('./db/connect')
const {sequelize, initializeDatabase } = require('./db/connect')
const authenticateUser = require('./middleware/authentication')
// routers
const authRouter = require('./routes/auth')
const jobsRouter = require('./routes/jobs')
const statusRouter = require("./routes/status")

// error handler
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')

app.set('trust proxy', 1)

app.use(express.json())
app.use(helmet())
app.use(xss())
const corsOptions = {
  origin: [process.env.FRONTEND1], // Allow only requests from this origin
  methods: 'GET,POST,PATCH,DELETE', // Allow only these methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow only these headers
}

// Use CORS middleware with specified options
app.use(cors(corsOptions))


// routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/jobs', authenticateUser, jobsRouter)
app.use('/api/v1/status', statusRouter)

app.get('*', (req, res) => {
  res.send('jobster')
})


app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 8080

const start = async () => {
  try {
    // await connectDB(process.env.MONGO_URI)
    await initializeDatabase();
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    )
  } catch (error) {
    console.log(error)
  }
}

start()
