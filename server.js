import * as dotenv from 'dotenv'
dotenv.config()
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const { APIKEY, PORT = 3030 } = process.env

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()

// App Configuration
const corsOptions = {
  origin: ['http://127.0.0.1:8080', 'http://localhost:8080', 'http://127.0.0.1:5173', 'http://localhost:5173'],
  credentials: true,
}

app.use(cors(corsOptions))
app.use(cookieParser()) // for res.cookies
app.use(express.json()) // for req.body
app.use(express.static('public'))

import { loggerService } from './services/logger.service.js'
import { toyRoutes } from './api/toy/toy.routes.js'
import { authRoutes } from './api/auth/auth.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { reviewRoutes } from './api/review/review.routes.js'

import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js'
app.all('*', setupAsyncLocalStorage)

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/toy', toyRoutes)
app.use('/api/review', reviewRoutes)

app.get('/api/getconfig', (req, res) => {
  const config = {
    apiKey: APIKEY,
  }

  res.send(config)
})

app.get('/**', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// Listen will always be the last line in our server!
// const port = 3030

const port = PORT
app.listen(port, () => {
  loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
})
