const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
require('dotenv').config();

exports.register = async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, role } = req.body;

        // Validate role
        if (!['admin', 'vet'].includes(role)) {
            return res.status(400).json({ error: "Invalid role. Must be 'admin' or 'vet'" });
        }

        // Check if user exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }

        // Create new user
        await User.create(name, email, password, role);
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: "An error occurred during registration" });
    }
};

exports.login = async(req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for email:', email);

        // Find user by email
        const user = await User.findByEmail(email);
        console.log('User found:', user ? 'Yes' : 'No');

        if (!user) {
            console.log('No user found with email:', email);
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Validate role
        if (!['admin', 'vet'].includes(user.role)) {
            console.log('Invalid role for user:', user.role);
            return res.status(401).json({ error: "Invalid user role" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch ? 'Yes' : 'No');

        if (!isMatch) {
            console.log('Password mismatch for user:', email);
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign({ userId: user.id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key', { expiresIn: "1h" }
        );

        console.log('Login successful for user:', email);
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                specialization: user.specialization,
                working_hours: user.working_hours
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: "An error occurred during login" });
    }
};

exports.registerVet = async(req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Only admins can create vet accounts." });
        }

        const { name, email, password } = req.body;

        // Check if vet exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }

        // Create vet account
        await User.create(name, email, password, "vet");
        res.status(201).json({ message: "Vet account created successfully" });
    } catch (err) {
        console.error('Vet registration error:', err);
        res.status(500).json({ error: "An error occurred during vet registration" });
    }
};

exports.getCurrentUser = async(req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            specialization: user.specialization,
            working_hours: user.working_hours
        });
    } catch (err) {
        console.error('Get current user error:', err);
        res.status(500).json({ error: "An error occurred while fetching user data" });
    }
};

exports.changePassword = async(req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Current password is incorrect" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.update(user.id, { password: hashedPassword });

        res.json({ message: "Password updated successfully" });
    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ error: "An error occurred while changing password" });
    }
};

exports.updateProfile = async(req, res) => {
    try {
        const { name, phone, specialization, working_hours } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (specialization) updateData.specialization = specialization;
        if (working_hours) updateData.working_hours = JSON.stringify(working_hours);

        await User.update(req.user.userId, updateData);

        const updatedUser = await User.findById(req.user.userId);
        res.json({
            message: "Profile updated successfully",
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                phone: updatedUser.phone,
                specialization: updatedUser.specialization,
                working_hours: updatedUser.working_hours
            }
        });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: "An error occurred while updating profile" });
    }
};

exports.forgotPassword = async(req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findByEmail(email);
        if (!user) {
            // For security reasons, don't reveal if email exists
            return res.json({ message: "If your email is registered, you will receive password reset instructions" });
        }

        // Generate reset token
        const resetToken = jwt.sign({ userId: user.id },
            process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' }
        );

        // In a real application, send email with reset link
        // For now, just return the token
        res.json({
            message: "Password reset instructions sent",
            resetToken // Remove this in production
        });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ error: "An error occurred while processing your request" });
    }
};

exports.resetPassword = async(req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        // Verify token
        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'your-secret-key');

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await User.update(decoded.userId, { password: hashedPassword });

        res.json({ message: "Password has been reset successfully" });
    } catch (err) {
        console.error('Reset password error:', err);
        if (err.name === 'JsonWebTokenError') {
            return res.status(400).json({ error: "Invalid or expired reset token" });
        }
        res.status(500).json({ error: "An error occurred while resetting password" });
    }
};