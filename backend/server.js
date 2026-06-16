const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/admin.routes');
const vetRoutes = require('./routes/vet.routes');
const appointmentRoutes = require('./routes/appointments.routes');
const servicesRoutes = require('./routes/services.routes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const queryRoutes = require('./routes/queryRoutes');

const app = express();

// CORS configuration
// Registered FIRST so that preflight (OPTIONS) requests always receive the
// Access-Control-Allow-Origin header — even if a later middleware (e.g. the
// rate limiter) would otherwise short-circuit the request.
app.use(cors({
    origin: '*', // Allow all origins for development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:", "http:"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            fontSrc: ["'self'", "https:", "http:", "data:"],
            connectSrc: ["'self'", "http://localhost:*", "http:", "https:"]
        }
    }
}));

// Rate limiting (skip CORS preflight requests so they are never blocked)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    skip: (req) => req.method === 'OPTIONS'
});
app.use('/api/', limiter);

// Logging
app.use(morgan('dev'));

// Configure static file serving
app.use('/frontend', express.static(path.join(__dirname, '../frontend'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// Ensure JSON is parsed properly
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vet', vetRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/queries', queryRoutes);

// Serve frontend routes
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/book-appointment.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ error: 'Invalid token' });
    }

    res.status(500).json({
        error: process.env.NODE_ENV === 'development' ?
            err.message : 'Something went wrong!'
    });
});

// Graceful shutdown handling
const gracefulShutdown = (server) => {
    process.on('SIGTERM', () => {
        console.info('SIGTERM signal received.');
        console.log('Closing HTTP server.');
        server.close(() => {
            console.log('HTTP server closed.');
            process.exit(0);
        });
    });
};

// Try alternative ports if the default port is in use
const tryPort = async(startPort) => {
    const maxPort = 65535; // Maximum valid port number
    let currentPort = startPort;

    while (currentPort <= maxPort) {
        try {
            const server = await new Promise((resolve, reject) => {
                const s = app.listen(currentPort)
                    .on('listening', () => {
                        console.log(`Server is running on port ${currentPort}`);
                        gracefulShutdown(s);
                        resolve(s);
                    })
                    .on('error', (err) => {
                        if (err.code === 'EADDRINUSE') {
                            console.log(`Port ${currentPort} is busy, trying ${currentPort + 1}`);
                            s.close();
                            currentPort++;
                            if (currentPort > maxPort) {
                                reject(new Error('No available ports found'));
                            }
                        } else {
                            reject(err);
                        }
                    });
            });
            return server;
        } catch (err) {
            if (err.message === 'No available ports found') {
                throw err;
            }
            // Continue trying next port
            currentPort++;
        }
    }
    throw new Error('No available ports found');
};

const PORT = process.env.PORT || 5000;
tryPort(PORT).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});