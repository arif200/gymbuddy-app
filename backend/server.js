import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import { rateLimit } from 'express-rate-limit'
import dotenv from 'dotenv'
import {connectDB, isDBConnected} from './src/config/db.js'

import authRoutes from './src/routes/auth.routes.js'
import userRoutes from './src/routes/user.routes.js'
import classRoutes from './src/routes/class.routes.js'
import bookingRoutes from './src/routes/booking.routes.js'
import analyticsRoutes from './src/routes/analytics.routes.js'
import progressRoutes from './src/routes/progress.routes.js'
import reviewRoutes from './src/routes/review.routes.js'
import viewsRoutes from './src/routes/views.routes.js'
import trainerRoutes from './src/routes/trainer.routes.js'
import paymentRoutes from './src/routes/payment.routes.js'
import articlesRoutes from './src/routes/articles.routes.js'
import promoRoutes from './src/routes/promo.routes.js'
import faqRoutes from './src/routes/faq.routes.js'
import notificationsRoutes from './src/routes/notifications.routes.js'
import bannersRoutes from './src/routes/banners.routes.js'
import errorMiddleware from './src/middleware/Error.Middleware.js'

dotenv.config()

const app = express()

// Security & Optimization Middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.use(compression())

// CORS - lebih ketat
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5000'
]
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc)
        if (!origin) return callback(null, true)
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true)
        } else {
            callback(null, true) // Allow all in development
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['X-Total-Count'],
    credentials: true
}))

app.use(express.json({
    type: ['application/json', 'text/plain'],
    limit: '10mb'
}))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Rate Limiting Global
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: 'Terlalu banyak permintaan, coba lagi nanti' }
})
app.use(globalLimiter)

// Rate limiting lebih ketat untuk auth
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: 'Terlalu banyak percobaan login, coba 15 menit lagi' }
})

// Routes
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/sessions', classRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/views', viewsRoutes)
app.use('/api/trainers', trainerRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/articles', articlesRoutes)
app.use('/api/promo', promoRoutes)
app.use('/api/faq', faqRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/banners', bannersRoutes)

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'GymBuddy API berjalan',
        database: isDBConnected() ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    })
})

// Error handling
app.use(errorMiddleware)

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`GymBuddy API berjalan di port ${PORT}`)
    // Coba konek database (gagal gak apa, server tetap jalan)
    connectDB()
})
