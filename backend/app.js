import express from 'express'
import productRoutes from './routes/productRoutes.js'
import { notFound, errorHandler } from './middlewares/errorMiddleware.js'
const app = express()
app.use(express.json())

app.use('/api/v1', productRoutes)

// Middleware to handle errors
app.use(notFound)
app.use(errorHandler)

export default app
