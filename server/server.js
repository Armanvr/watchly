import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'

import authRoutes from './routes/auth.js'
import eventRoutes from './routes/events.js'
import mediaRoutes from './routes/media.js'

const app = express()
const PORT = process.env.PORT || 3001

const allowedOrigins = new Set(process.env.ALLOWED_ORIGINS.split(','))
const corsOptions = {
	origin: (origin, callback) => {
		if (!origin || allowedOrigins.has(origin)) {
			callback(null, true)
			return
		}
		callback(new Error(`Origin ${origin} is not allowed by CORS`))
	},
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}

// Middleware
app.use(cors(corsOptions))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/media', mediaRoutes)

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

// MongoDB connection
mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => {
		console.log('✅ MongoDB connected')
		app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
	})
	.catch((err) => {
		console.error('❌ MongoDB connection error:', err.message)
		process.exit(1)
	})
