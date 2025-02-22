require('dotenv').config()
require('express-async-errors')

const path = require('path')

// extra security packages
const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')

const express = require('express')
const app = express()

const connectDB = require('./db/connect')
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
  origin: [
    'https://67ba49f5d282930ba7790a98--papaya-cranachan-df9f5e.netlify.app/',
  ], // Allow only requests from this origin
  methods: 'GET,POST,PATCH,DELETE', // Allow only these methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow only these headers
}

// Use CORS middleware with specified options
app.use(cors(corsOptions))

// routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/jobs', authenticateUser, jobsRouter)

app.get('*', (req, res) => {
  res.send('jobster')
  console.log(req)

  // res.sendFile(path.resolve(__dirname, './client/build', 'index.html'))
})

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 5000

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    )
  } catch (error) {
    console.log(error)
  }
}

start()
