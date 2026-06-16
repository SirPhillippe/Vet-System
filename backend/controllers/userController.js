const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async(req, res) => {
    try {
        const users = await User.findAll();
        res.json(users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            specialization: user.specialization,
            status: user.status
        })));
    } catch (err) {
        console.error('Error getting users:', err);
        res.status(500).json({ error: "An error occurred while fetching users" });
    }
};

exports.createUser = async(req, res) => {
    try {
        const { name, email, password, role, phone, specialization } = req.body;

        // Check if user exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }

        // Create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const userData = {
            name,
            email,
            password: hashedPassword,
            role,
            phone,
            specialization
        };

        const userId = await User.create(userData);
        res.status(201).json({
            message: "User created successfully",
            userId
        });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: "An error occurred while creating user" });
    }
};

exports.getUserById = async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            specialization: user.specialization,
            status: user.status
        });
    } catch (err) {
        console.error('Error getting user:', err);
        res.status(500).json({ error: "An error occurred while fetching user" });
    }
};

exports.updateUser = async(req, res) => {
    try {
        const { name, email, password, role, phone, specialization, status } = req.body;

        // Check if user exists
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Prepare update data
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (password) updateData.password = await bcrypt.hash(password, 10);
        if (role) updateData.role = role;
        if (phone) updateData.phone = phone;
        if (specialization) updateData.specialization = specialization;
        if (status) updateData.status = status;

        await User.update(req.params.id, updateData);
        res.json({ message: "User updated successfully" });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: "An error occurred while updating user" });
    }
};

exports.deleteUser = async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        await User.delete(req.params.id);
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: "An error occurred while deleting user" });
    }
};