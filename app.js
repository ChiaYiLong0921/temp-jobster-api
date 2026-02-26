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

// error handler
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')

// app.set('trust proxy', 1)

// app.use(express.static(path.resolve(__dirname, './client/build')))
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
// app.use((req, res, next) => {
//   const requestOrigin = req.get('Origin');
//   const hostHeader = req.get('Host');
  
//   console.log(`CORS Check - Request Origin: ${requestOrigin}, Host: ${hostHeader}`);
  
//   // Check if origin is allowed
//   const allowedOrigins = ['http://localhost:5173', process.env.FRONTEND1];
//   const isAllowed = allowedOrigins.includes(requestOrigin);
  
//   console.log(`Origin ${requestOrigin} is ${isAllowed ? 'ALLOWED' : 'BLOCKED'} by CORS`);
  
//   // Set CORS headers manually or continue with standard CORS
//   res.header('Access-Control-Allow-Origin', '*'); // Temporary permissive setting for testing
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
//   if (req.method === 'OPTIONS') {
//     res.sendStatus(200);
//     return;
//   }
  
//   next();
// });

// routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/jobs', authenticateUser, jobsRouter)

app.get('*', (req, res) => {
  res.send('jobster')
  // console.log(req.headers)

  // res.sendFile(path.resolve(__dirname, './client/dist', 'index.html'))
})

app.get('/api/v1/health', async (req, res) => {
  try {
    // Optional: Check if the database is actually reachable
    await sequelize.authenticate(); 
    res.status(200).send('OK');
  } catch (error) {
    res.status(500).send('Database connection failed');
  }
});

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
