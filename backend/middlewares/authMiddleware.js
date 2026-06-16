const jwt = require('jsonwebtoken');
require('dotenv').config();

const VALID_ROLES = ['admin', 'vet'];

exports.authenticate = (req, res, next) => {
    try {
        const token = req.header('Authorization');

        if (!token) {
            return res.status(401).json({ error: "Access denied. No token provided" });
        }

        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token. Please login again." });
    }
};

exports.requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Authentication required" });
        }

        if (!Array.isArray(roles)) {
            roles = [roles];
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: `Access denied. Required role: ${roles.join(' or ')}`
            });
        }

        next();
    };
};

// Convenience middleware for admin-only routes
exports.requireAdmin = (req, res, next) => {
    exports.requireRole('admin')(req, res, next);
};

// Convenience middleware for vet-only routes
exports.requireVet = (req, res, next) => {
    exports.requireRole(['admin', 'vet'])(req, res, next);
};