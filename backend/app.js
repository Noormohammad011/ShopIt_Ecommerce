import express from 'express'
const app = express()
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import fileUpload from 'express-fileupload'
import { notFound, errorHandler } from './middlewares/errorMiddleware.js'

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(fileUpload())

// Import all routes
import productRoutes from './routes/productRoutes.js'
import userRoutes from './routes/userRoutes.js'
import orderRoutes from './routes/orderRoutes.js'

app.use('/api/v1', productRoutes)
app.use('/api/v1', userRoutes)
app.use('/api/v1', orderRoutes)

// Middleware to handle errors
app.use(notFound)
app.use(errorHandler)

export default app
