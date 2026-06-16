const { query } = require('../config/database');
const bcrypt = require('bcryptjs');
const { generatePDF } = require('../utils/reportGenerator');
const { sendEmail } = require('../utils/email');
const { sendAppointmentStatusUpdate, sendAppointmentReschedule } = require('../utils/emailService');
const logAudit = require('../utils/auditLogger');

// Dashboard Statistics
exports.getDashboardStats = async(req, res) => {
    try {
        // Get total appointments today
        const todayAppointments = await query(
            `SELECT COUNT(*) as count FROM appointments 
             WHERE DATE(appointment_date) = CURDATE()`
        );

        // Get total active employees
        const activeEmployees = await query(
            `SELECT COUNT(*) as count FROM employees 
             WHERE status = 'active'`
        );

        // Get total queries
        const totalQueries = await query(
            'SELECT COUNT(*) as count FROM queries'
        );

        // Get total revenue this month
        const monthlyRevenue = await query(
            `SELECT COALESCE(SUM(price), 0) as revenue 
             FROM appointments
             WHERE MONTH(appointment_date) = MONTH(CURRENT_DATE())
             AND YEAR(appointment_date) = YEAR(CURRENT_DATE())
             AND payment_status = 'paid'`
        );

        res.json({
            todayAppointments: todayAppointments[0].count,
            activeEmployees: activeEmployees[0].count,
            totalQueries: totalQueries[0].count,
            monthlyRevenue: monthlyRevenue[0].revenue
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Recent Activity
exports.getRecentActivity = async(req, res) => {
    try {
        const activities = await query(
            `SELECT * FROM activity_logs 
             ORDER BY timestamp DESC 
             LIMIT 10`
        );
        res.json(activities);
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Appointments Management
exports.getAllAppointments = async(req, res) => {
    try {
        const { page = 1, limit = 10, filter = 'all', search = '', status = '' } = req.query;
        const offset = Number.isNaN(Number(page)) ? 0 : (parseInt(page) - 1) * parseInt(limit);
        const safeLimit = Number.isNaN(Number(limit)) ? 10 : parseInt(limit);

        // Base query
        let queryStr = 'SELECT a.*, s.name as service_name, s.price as service_price FROM appointments a JOIN services s ON a.service_id = s.id';

        // Add filter conditions
        const conditions = [];
        const filterParams = [];

        if (filter === 'today') {
            conditions.push('DATE(a.appointment_date) = CURDATE()');
        } else if (filter === 'week') {
            conditions.push('YEARWEEK(a.appointment_date, 1) = YEARWEEK(CURDATE(), 1)');
        } else if (filter === 'month') {
            conditions.push('YEAR(a.appointment_date) = YEAR(CURDATE()) AND MONTH(a.appointment_date) = MONTH(CURDATE())');
        }

        // Add status filter
        if (status) {
            if (status === 'empty') {
                conditions.push('(a.status = "" OR a.status IS NULL)');
            } else {
                conditions.push('a.status = ?');
                filterParams.push(status);
            }
        }

        // Add search condition
        if (search) {
            conditions.push('(a.client_email LIKE ? OR a.client_name LIKE ? OR a.pet_name LIKE ?)');
            const searchPattern = `%${search}%`;
            filterParams.push(searchPattern, searchPattern, searchPattern);
        }

        // Combine conditions
        if (conditions.length > 0) {
            queryStr += ' WHERE ' + conditions.join(' AND ');
        }

        // Add sophisticated sorting - prioritize today, then upcoming, then past appointments
        queryStr += ` ORDER BY 
            CASE 
                WHEN DATE(a.appointment_date) = CURDATE() THEN 1
                WHEN a.appointment_date > CURDATE() THEN 2
                ELSE 3
            END,
            a.appointment_date ASC,
            a.appointment_time ASC`;

        // Add pagination (interpolate limit/offset directly)
        queryStr += ` LIMIT ${safeLimit} OFFSET ${offset}`;
        const mainParams = [...filterParams]; // Do NOT include limit/offset in params

        // Get total count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM appointments a JOIN services s ON a.service_id = s.id';
        if (conditions.length > 0) {
            countQuery += ' WHERE ' + conditions.join(' AND ');
        }
        const countParams = filterParams;

        // Debug logging
        console.log('Executing SQL:', queryStr);
        console.log('Parameters:', mainParams);
        console.log('Count SQL:', countQuery);
        console.log('Count Parameters:', countParams);

        // Execute queries
        const appointments = await query(queryStr, mainParams);
        const countResult = await query(countQuery, countParams);

        // Send response with pagination info
        res.json({
            appointments,
            pagination: {
                total: countResult[0].total,
                pages: Math.ceil(countResult[0].total / safeLimit),
                currentPage: parseInt(page),
                perPage: safeLimit
            }
        });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Vets Management
exports.getAllVets = async(req, res) => {
    try {
        const vets = await query(
            `SELECT id, name, email, specialization, status 
             FROM users 
             WHERE role = 'vet'`
        );
        res.json({ data: vets });
    } catch (error) {
        console.error('Error fetching vets:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.createVet = async(req, res) => {
    try {
        const { name, email, specialization, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        await query(
            `INSERT INTO users (name, email, password, role, specialization, status) 
             VALUES (?, ?, ?, 'vet', ?, 'active')`, [name, email, hashedPassword, specialization]
        );

        res.json({ message: 'Veterinarian added successfully' });
    } catch (error) {
        console.error('Error creating vet:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Clients Management
exports.getAllClients = async(req, res) => {
    try {
        const clients = await query(
            `SELECT 
                c.*,
                COUNT(p.id) as total_pets,
                MAX(qa.preferred_date) as last_visit
             FROM clients c
             LEFT JOIN pets p ON c.id = p.client_id
             LEFT JOIN quick_appointments qa ON c.email = qa.email
             GROUP BY c.id
             ORDER BY c.first_name, c.last_name`
        );
        res.json(clients);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Inventory Management
exports.getAllInventory = async(req, res) => {
    try {
        const { search = '' } = req.query;
        
        let sql = `SELECT * FROM inventory`;
        let params = [];
        
        if (search.trim()) {
            sql += ` WHERE name LIKE ? OR category LIKE ?`;
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern);
        }
        
        sql += ` ORDER BY name`;
        
        const inventory = await query(sql, params);
        res.json({ data: inventory });
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.addInventoryItem = async(req, res) => {
    try {
        const { name, category, quantity, unitPrice, unit_price, reorderLevel, reorder_level } = req.body;
        const unitPriceValue = unitPrice || unit_price;
        const reorderLevelValue = reorderLevel || reorder_level;

        await query(
            `INSERT INTO inventory (name, category, quantity, unit_price, reorder_level) 
             VALUES (?, ?, ?, ?, ?)`, [name, category, quantity, unitPriceValue, reorderLevelValue]
        );
        logAudit(req, 'CREATE', 'inventory', null, `Added inventory item: ${name}`);
        res.json({ message: 'Inventory item added successfully' });
    } catch (error) {
        console.error('Error adding inventory item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Services Management
exports.getAllServices = async(req, res) => {
    try {
        const services = await query(
            'SELECT * FROM services ORDER BY name'
        );
        res.json(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.createService = async(req, res) => {
    try {
        const { name, description, duration, price } = req.body;
        await query(
            `INSERT INTO services (name, description, duration, price) 
             VALUES (?, ?, ?, ?)`, [name, description, duration, price]
        );
        res.json({ message: 'Service added successfully' });
    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Reports
exports.generateReport = async(req, res) => {
    try {
        const { type } = req.params;
        let data;

        switch (type) {
            case 'revenue':
                data = await query(
                    `SELECT 
                        DATE(appointment_date) as date,
                        COUNT(*) as appointments,
                        SUM(price) as revenue
                     FROM appointments
                     WHERE status = 'completed'
                     GROUP BY DATE(appointment_date)
                     ORDER BY date DESC
                     LIMIT 30`
                );
                break;
            case 'appointments':
                data = await query(
                    `SELECT 
                        a.*,
                        u.name as client_name,
                        p.name as pet_name,
                        s.name as service_name
                     FROM appointments a
                     JOIN users u ON a.user_id = u.id
                     JOIN pets p ON a.pet_id = p.id
                     JOIN services s ON a.service_id = s.id
                     WHERE a.appointment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                     ORDER BY a.appointment_date DESC`
                );
                break;
                // Add more report types as needed
        }

        const pdf = await generatePDF(type, data);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${type}_report.pdf`);
        res.send(pdf);
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Settings
exports.getSettings = async(req, res) => {
    try {
        // For now, return some default settings
        res.json({
            business: {
                name: 'VetTech Clinic',
                email: 'contact@vettech.com',
                phone: '555-0100',
                address: '123 Vet Street, City'
            },
            system: {
                appointment_duration: 30,
                opening_time: '09:00',
                closing_time: '17:00',
                currency: 'USD'
            }
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateGeneralSettings = async(req, res) => {
    try {
        const { clinic_name, clinic_email, clinic_phone, clinic_address } = req.body;

        await query(
            `UPDATE settings 
             SET clinic_name = ?, clinic_email = ?, clinic_phone = ?, clinic_address = ?`, [clinic_name, clinic_email, clinic_phone, clinic_address]
        );

        res.json({ message: 'General settings updated successfully' });
    } catch (error) {
        console.error('Error updating general settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateSystemSettings = async(req, res) => {
    try {
        const { appointment_duration, working_hours_start, working_hours_end, email_notifications, sms_notifications } = req.body;

        await query(
            `UPDATE settings 
             SET appointment_duration = ?, 
                 working_hours_start = ?, 
                 working_hours_end = ?,
                 email_notifications = ?,
                 sms_notifications = ?`, [appointment_duration, working_hours_start, working_hours_end, email_notifications, sms_notifications]
        );

        res.json({ message: 'System settings updated successfully' });
    } catch (error) {
        console.error('Error updating system settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Add missing appointment management functions
exports.updateAppointment = async(req, res) => {
    try {
        const { id } = req.params;
        const { status, preferred_date, preferred_time, notes } = req.body;

        await query(
            `UPDATE quick_appointments 
             SET status = ?, preferred_date = ?, preferred_time = ?, notes = ?
             WHERE id = ?`, [status, preferred_date, preferred_time, notes, id]
        );

        // Get appointment details for email notification
        const appointment = await query(
            'SELECT * FROM quick_appointments WHERE id = ?', [id]
        );

        if (appointment.length > 0) {
            await sendEmail(
                appointment[0].email,
                'Appointment Update',
                `Your appointment has been updated:\n
                 New Date: ${preferred_date}\n
                 New Time: ${preferred_time}\n
                 Status: ${status}\n
                 Notes: ${notes || 'No additional notes'}`
            );
        }

        res.json({ message: 'Appointment updated successfully' });
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteAppointment = async(req, res) => {
    try {
        const { id } = req.params;

        // Get appointment details before deletion for email notification
        const appointment = await query(
            'SELECT * FROM quick_appointments WHERE id = ?', [id]
        );

        await query('DELETE FROM quick_appointments WHERE id = ?', [id]);

        if (appointment.length > 0) {
            await sendEmail(
                appointment[0].email,
                'Appointment Cancelled',
                `Your appointment for ${appointment[0].preferred_date} at ${appointment[0].preferred_time} has been cancelled.`
            );
        }

        res.json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Add missing vet management functions
exports.updateVet = async(req, res) => {
    try {
        const { id } = req.params;
        const { name, email, specialization } = req.body;

        await query(
            `UPDATE users 
             SET name = ?, email = ?, specialization = ?
             WHERE id = ? AND role = 'vet'`, [name, email, specialization, id]
        );

        res.json({ message: 'Veterinarian updated successfully' });
    } catch (error) {
        console.error('Error updating vet:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deactivateVet = async(req, res) => {
    try {
        const { id } = req.params;
        await query(
            `UPDATE users 
             SET status = 'inactive' 
             WHERE id = ? AND role = 'vet'`, [id]
        );
        res.json({ message: 'Veterinarian deactivated successfully' });
    } catch (error) {
        console.error('Error deactivating vet:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Add missing client management functions
exports.getClientDetails = async(req, res) => {
    try {
        const { id } = req.params;

        // Get client info
        const client = await query(
            'SELECT * FROM clients WHERE id = ?', [id]
        );

        if (!client.length) {
            return res.status(404).json({ error: 'Client not found' });
        }

        // Get client's pets
        const pets = await query(
            'SELECT * FROM pets WHERE client_id = ?', [id]
        );

        // Get client's appointments
        const appointments = await query(
            `SELECT qa.*, s.name as service_name
             FROM quick_appointments qa
             JOIN services s ON qa.service_id = s.id
             WHERE qa.email = ?
             ORDER BY qa.preferred_date DESC`, [client[0].email]
        );

        res.json({
            client: client[0],
            pets,
            appointments
        });
    } catch (error) {
        console.error('Error fetching client details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateClient = async(req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, email, phone, address } = req.body;

        await query(
            `UPDATE clients 
             SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ?
             WHERE id = ?`, [first_name, last_name, email, phone, address, id]
        );

        res.json({ message: 'Client updated successfully' });
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteClient = async(req, res) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM clients WHERE id = ?', [id]);
        res.json({ message: 'Client deleted successfully' });
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Add missing inventory management functions
exports.updateInventoryItem = async(req, res) => {
    try {
        const { id } = req.params;
        const { name, category, quantity, unitPrice, unit_price, reorderLevel, reorder_level } = req.body;
        const unitPriceValue = unitPrice || unit_price;
        const reorderLevelValue = reorderLevel || reorder_level;

        await query(
            `UPDATE inventory 
             SET name = ?, category = ?, quantity = ?, unit_price = ?, reorder_level = ?
             WHERE id = ?`, [name, category, quantity, unitPriceValue, reorderLevelValue, id]
        );

        logAudit(req, 'UPDATE', 'inventory', parseInt(id), `Updated inventory item #${id}`);
        res.json({ message: 'Inventory item updated successfully' });
    } catch (error) {
        console.error('Error updating inventory item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteInventoryItem = async(req, res) => {
    try {
        const { id } = req.params;
        const result = await query('DELETE FROM inventory WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }
        logAudit(req, 'DELETE', 'inventory', parseInt(id), `Deleted inventory item #${id}`);
        res.json({ message: 'Inventory item deleted successfully' });
    } catch (error) {
        console.error('Error deleting inventory item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.reorderInventoryItem = async(req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        if (!quantity || isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({ error: 'Invalid quantity' });
        }
        const result = await query(
            `UPDATE inventory SET quantity = quantity + ? WHERE id = ?`, [quantity, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }
        logAudit(req, 'UPDATE', 'inventory', parseInt(id), `Reordered inventory item #${id}: added ${quantity} units`);
        res.json({ message: 'Inventory reorder successful' });
    } catch (error) {
        console.error('Error reordering inventory:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.useInventoryItem = async(req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        if (!quantity || isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({ error: 'Invalid quantity' });
        }

        // First check current stock
        const currentStock = await query(
            `SELECT quantity FROM inventory WHERE id = ?`, [id]
        );

        if (currentStock.length === 0) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }

        const availableQuantity = currentStock[0].quantity;

        if (quantity > availableQuantity) {
            return res.status(400).json({
                error: `Insufficient stock. Available: ${availableQuantity}, Requested: ${quantity}`
            });
        }

        // Update inventory by reducing quantity
        const result = await query(
            `UPDATE inventory SET quantity = quantity - ? WHERE id = ?`, [quantity, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }

        logAudit(req, 'UPDATE', 'inventory', parseInt(id), `Used ${quantity} units of inventory item #${id} (remaining: ${availableQuantity - quantity})`);
        res.json({
            message: `Successfully used ${quantity} units. Remaining stock: ${availableQuantity - quantity}`
        });
    } catch (error) {
        console.error('Error using inventory item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Add missing service management functions
exports.updateService = async(req, res) => {
    try {
        const { id } = req.params;
        const { name, duration, price, description } = req.body;

        await query(
            `UPDATE services 
             SET name = ?, duration = ?, price = ?, description = ?
             WHERE id = ?`, [name, duration, price, description, id]
        );

        res.json({ message: 'Service updated successfully' });
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteService = async(req, res) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM services WHERE id = ?', [id]);
        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get client's pets
exports.getClientPets = async(req, res) => {
    try {
        const { clientId } = req.params;
        const pets = await query(
            `SELECT id, name, type, breed, age 
             FROM pets 
             WHERE user_id = ?`, [clientId]
        );
        res.json(pets);
    } catch (error) {
        console.error('Error fetching client pets:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create a new appointment
exports.createAppointment = async(req, res) => {
    try {
        const {
            client_name,
            client_email,
            client_phone,
            pet_name,
            pet_type,
            pet_breed,
            service_id,
            appointment_date,
            appointment_time,
            status,
            price,
            payment_status,
            notes
        } = req.body;
        if (!client_name || !client_email || !client_phone || !pet_name || !pet_type || !service_id || !appointment_date || !appointment_time || !status || !payment_status) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        await query(
            `INSERT INTO appointments (client_name, client_email, client_phone, pet_name, pet_type, pet_breed, service_id, appointment_date, appointment_time, status, price, payment_status, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [client_name, client_email, client_phone, pet_name, pet_type, pet_breed, service_id, appointment_date, appointment_time, status, price, payment_status, notes]
        );
        logAudit(req, 'CREATE', 'appointment', null, `Created appointment for ${client_name} (${pet_name}) on ${appointment_date}`);
        res.status(201).json({ message: 'Appointment created successfully' });
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete an appointment by id
exports.deleteAppointment = async(req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: 'Missing appointment id' });
        const result = await query('DELETE FROM appointments WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        logAudit(req, 'DELETE', 'appointment', parseInt(id), `Deleted appointment #${id}`);
        res.json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Revenue Statistics
exports.getRevenueStats = async(req, res) => {
    try {
        // Get monthly trend
        const monthlyTrend = await query(
            `SELECT 
                DATE_FORMAT(qa.preferred_date, '%b') as month,
                COALESCE(SUM(s.price), 0) as revenue
             FROM quick_appointments qa
             JOIN services s ON qa.service_id = s.id
             WHERE qa.payment_status = 'paid'
             AND qa.preferred_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
             GROUP BY MONTH(qa.preferred_date)
             ORDER BY qa.preferred_date`
        );

        // Get revenue by service
        const byService = await query(
            `SELECT 
                s.name,
                COALESCE(SUM(s.price), 0) as revenue
             FROM quick_appointments qa
             JOIN services s ON qa.service_id = s.id
             WHERE qa.payment_status = 'paid'
             AND qa.preferred_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH)
             GROUP BY s.id, s.name`
        );

        res.json({
            monthlyTrend,
            byService
        });
    } catch (error) {
        console.error('Error fetching revenue stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Employee Management
exports.getAllEmployees = async(req, res) => {
    try {
        const employees = await query(
            `SELECT id, first_name, last_name, email, role, phone, specialization, status 
             FROM employees 
             ORDER BY first_name, last_name`
        );
        res.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.createEmployee = async(req, res) => {
    try {
        const { firstName, lastName, email, password, role, phone, specialization } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        await query(
            `INSERT INTO employees (first_name, last_name, email, password, role, phone, specialization) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`, [firstName, lastName, email, hashedPassword, role, phone, specialization]
        );

        res.json({ message: 'Employee added successfully' });
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateEmployee = async(req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, email, phone, role, specialization } = req.body;

        await query(
            `UPDATE employees 
             SET first_name = ?, last_name = ?, email = ?, 
                 phone = ?, role = ?, specialization = ?
             WHERE id = ?`, [first_name, last_name, email, phone, role, specialization, id]
        );

        res.json({ message: 'Employee updated successfully' });
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteEmployee = async(req, res) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM employees WHERE id = ?', [id]);
        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateEmployeeStatus = async(req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        await query(
            'UPDATE employees SET status = ? WHERE id = ?', [status, id]
        );

        res.json({ message: 'Employee status updated successfully' });
    } catch (error) {
        console.error('Error updating employee status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Revenue Report
exports.getRevenueReport = async(req, res) => {
    try {
        const { range } = req.query;
        let dateCondition = '';
        let params = [];

        // Set date range based on the range parameter
        switch (range) {
            case 'week':
                dateCondition = 'AND a.appointment_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
                break;
            case 'month':
                dateCondition = 'AND a.appointment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
                break;
            case 'year':
                dateCondition = 'AND a.appointment_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)';
                break;
            default:
                dateCondition = 'AND a.appointment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
        }

        const report = await query(
            `SELECT DATE(a.appointment_date) as date,
                    COUNT(*) as appointments,
                    SUM(a.price) as revenue
             FROM appointments a
             JOIN services s ON a.service_id = s.id
             WHERE a.status = 'completed'
             ${dateCondition}
             GROUP BY date
             ORDER BY date`, params
        );

        res.json({ data: report });
    } catch (error) {
        console.error('Error generating revenue report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Newsletter Management
exports.getNewsletterSubscribers = async(req, res) => {
    try {
        const subscribers = await query(
            `SELECT * FROM newsletter_subscriptions 
             ORDER BY subscribed_at DESC`
        );
        res.json(subscribers);
    } catch (error) {
        console.error('Error fetching newsletter subscribers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.sendNewsletter = async(req, res) => {
    try {
        const { subject, content } = req.body;

        const subscribers = await query(
            `SELECT email FROM newsletter_subscriptions 
             WHERE status = 'active'`
        );

        // Send email to all subscribers
        for (const subscriber of subscribers) {
            await sendEmail(subscriber.email, subject, content);
        }

        res.json({
            message: 'Newsletter sent successfully',
            recipientCount: subscribers.length
        });
    } catch (error) {
        console.error('Error sending newsletter:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteSubscriber = async(req, res) => {
    try {
        const { id } = req.params;
        await query(
            `UPDATE newsletter_subscriptions 
             SET status = 'unsubscribed', 
                 unsubscribed_at = CURRENT_TIMESTAMP
             WHERE id = ?`, [id]
        );
        res.json({ message: 'Subscriber removed successfully' });
    } catch (error) {
        console.error('Error removing subscriber:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Missing Service Management Methods
exports.createService = async(req, res) => {
    try {
        const { name, duration, price, description } = req.body;
        await query(
            `INSERT INTO services (name, duration, price, description) 
             VALUES (?, ?, ?, ?)`, [name, duration, price, description]
        );
        res.json({ message: 'Service created successfully' });
    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Missing Report Methods
exports.getAppointmentsReport = async(req, res) => {
    try {
        const { range } = req.query;
        let dateCondition = '';

        // Set date range based on the range parameter
        switch (range) {
            case 'week':
                dateCondition = 'AND a.appointment_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
                break;
            case 'month':
                dateCondition = 'AND a.appointment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
                break;
            case 'year':
                dateCondition = 'AND a.appointment_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)';
                break;
            default:
                dateCondition = 'AND a.appointment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
        }

        const appointments = await query(
            `SELECT a.*, s.name as service_name, a.client_name as first_name, a.client_name as last_name
             FROM appointments a
             JOIN services s ON a.service_id = s.id
             WHERE 1=1 ${dateCondition}
             ORDER BY a.appointment_date DESC`
        );
        res.json({ data: appointments });
    } catch (error) {
        console.error('Error generating appointments report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getServicesReport = async(req, res) => {
    try {
        const { range } = req.query;
        let dateCondition = '';

        // Set date range based on the range parameter
        switch (range) {
            case 'week':
                dateCondition = 'AND a.appointment_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
                break;
            case 'month':
                dateCondition = 'AND a.appointment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
                break;
            case 'year':
                dateCondition = 'AND a.appointment_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)';
                break;
            default:
                dateCondition = 'AND a.appointment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
        }

        const services = await query(
            `SELECT s.*, COUNT(a.id) as total_bookings,
             SUM(CASE WHEN a.status = 'completed' THEN a.price ELSE 0 END) as total_revenue
             FROM services s
             LEFT JOIN appointments a ON s.id = a.service_id AND 1=1 ${dateCondition}
             GROUP BY s.id`
        );
        res.json({ data: services });
    } catch (error) {
        console.error('Error generating services report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getClientsReport = async(req, res) => {
    try {
        const { range } = req.query;
        let dateCondition = '';

        // Set date range based on the range parameter
        switch (range) {
            case 'week':
                dateCondition = 'AND a.appointment_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
                break;
            case 'month':
                dateCondition = 'AND a.appointment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
                break;
            case 'year':
                dateCondition = 'AND a.appointment_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)';
                break;
            default:
                dateCondition = 'AND a.appointment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
        }

        // Since appointments table has client info directly, we'll group by client email
        const clients = await query(
            `SELECT 
                a.client_name as first_name,
                a.client_name as last_name,
                a.client_email as email,
                a.client_phone as phone,
                COUNT(DISTINCT a.id) as total_appointments,
                SUM(CASE WHEN a.status = 'completed' THEN a.price ELSE 0 END) as total_spent
             FROM appointments a
             WHERE 1=1 ${dateCondition}
             GROUP BY a.client_email`
        );
        res.json({ data: clients });
    } catch (error) {
        console.error('Error generating clients report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Missing Appointment Stats Method
exports.getAppointmentStats = async(req, res) => {
    try {
        // Get appointments by status
        const statusStats = await query(
            `SELECT status, COUNT(*) as count
             FROM quick_appointments
             GROUP BY status`
        );

        // Get appointments by service
        const serviceStats = await query(
            `SELECT s.name, COUNT(a.id) as count
             FROM services s
             LEFT JOIN quick_appointments a ON s.id = a.service_id
             GROUP BY s.id`
        );

        // Get upcoming appointments
        const upcomingAppointments = await query(
            `SELECT a.*, s.name as service_name
             FROM quick_appointments a
             JOIN services s ON a.service_id = s.id
             WHERE a.preferred_date >= CURDATE()
             ORDER BY a.preferred_date, a.preferred_time
             LIMIT 5`
        );

        res.json({
            byStatus: statusStats,
            byService: serviceStats,
            upcoming: upcomingAppointments
        });
    } catch (error) {
        console.error('Error fetching appointment stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Missing Settings Method
exports.updateSettings = async(req, res) => {
    try {
        const {
            clinic_name,
            clinic_email,
            clinic_phone,
            clinic_address,
            working_hours_start,
            working_hours_end,
            appointment_duration,
            email_notifications,
            sms_notifications
        } = req.body;

        await query(
            `UPDATE settings SET
             clinic_name = ?,
             clinic_email = ?,
             clinic_phone = ?,
             clinic_address = ?,
             working_hours_start = ?,
             working_hours_end = ?,
             appointment_duration = ?,
             email_notifications = ?,
             sms_notifications = ?
             WHERE id = 1`, [clinic_name, clinic_email, clinic_phone, clinic_address,
                working_hours_start, working_hours_end, appointment_duration,
                email_notifications, sms_notifications
            ]
        );

        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update appointment (reschedule, status, or other fields)
exports.rescheduleAppointment = async(req, res) => {
    try {
        const { id } = req.params;
        const { appointment_date, appointment_time, status, payment_status, price, notes } = req.body;
        
        if (!id) {
            return res.status(400).json({ error: 'Missing appointment ID' });
        }

        // Fetch the existing appointment (with service name) so we can detect what
        // changed and have the owner's contact details for the notification email.
        const existingRows = await query(
            `SELECT a.*, s.name AS service_name
             FROM appointments a
             LEFT JOIN services s ON a.service_id = s.id
             WHERE a.id = ?`, [id]
        );
        if (existingRows.length === 0) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        const existing = existingRows[0];

        // Build dynamic update query based on provided fields
        let updateFields = [];
        let updateValues = [];

        if (appointment_date) {
            updateFields.push('appointment_date = ?');
            updateValues.push(appointment_date);
        }

        if (appointment_time) {
            updateFields.push('appointment_time = ?');
            updateValues.push(appointment_time);
        }

        if (status) {
            updateFields.push('status = ?');
            updateValues.push(status);
        }

        if (payment_status) {
            updateFields.push('payment_status = ?');
            updateValues.push(payment_status);
        }

        if (price !== undefined) {
            updateFields.push('price = ?');
            updateValues.push(price);
        }

        if (notes !== undefined) {
            updateFields.push('notes = ?');
            updateValues.push(notes);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        updateValues.push(id);
        const queryStr = `UPDATE appointments SET ${updateFields.join(', ')} WHERE id = ?`;
        
        const result = await query(queryStr, updateValues);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Notify the appointment owner of the change. The final date/time fall back to
        // the existing values when only the status (or vice versa) was updated.
        const recipient = existing.client_email;
        if (recipient) {
            const finalDate = appointment_date || existing.appointment_date;
            const finalTime = appointment_time || existing.appointment_time;
            const finalNotes = notes !== undefined ? notes : existing.notes;
            const statusChanged = status && status !== existing.status;
            const rescheduled = Boolean(appointment_date || appointment_time);

            // Email failures should never break the update — just log them.
            try {
                if (rescheduled) {
                    await sendAppointmentReschedule({
                        to: recipient,
                        name: existing.client_name,
                        petName: existing.pet_name,
                        service: existing.service_name,
                        date: finalDate,
                        time: finalTime
                    });
                }
                if (statusChanged) {
                    await sendAppointmentStatusUpdate({
                        to: recipient,
                        name: existing.client_name,
                        petName: existing.pet_name,
                        service: existing.service_name,
                        date: finalDate,
                        time: finalTime,
                        status,
                        notes: finalNotes
                    });
                }
            } catch (emailErr) {
                console.error('Failed to send appointment notification email:', emailErr);
            }
        }

        const message = status === 'completed' ? 'Appointment completed successfully' :
                       appointment_date ? 'Appointment rescheduled successfully' :
                       'Appointment updated successfully';
        logAudit(req, 'UPDATE', 'appointment', parseInt(id), message + ` (appointment #${id})`);
        res.json({ message });
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get patients for medical records
exports.getPatients = async (req, res) => {
    try {
        const patients = await query(`
            SELECT DISTINCT
                a.id,
                a.pet_name,
                a.client_name,
                a.client_phone,
                a.pet_type,
                a.pet_breed,
                a.pet_age
            FROM appointments a
            ORDER BY a.client_name, a.pet_name
        `);
        
        res.json(patients);
    } catch (error) {
        console.error('Error getting patients:', error);
        res.status(500).json({ message: 'Error getting patients' });
    }
};

// Admin Medical Records Functions
exports.getAllMedicalRecords = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (page - 1) * limit;

        let sql = `
            SELECT mr.*, u.name as vet_name 
            FROM medical_records mr 
            LEFT JOIN users u ON mr.vet_id = u.id 
            WHERE mr.status = 'active'
        `;
        let params = [];

        if (search) {
            sql += ` AND (mr.patient_name LIKE ? OR mr.owner_name LIKE ? OR mr.diagnosis LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        sql += ` ORDER BY mr.record_date DESC, mr.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

        const records = await query(sql, params);

        // Get total count for pagination
        let countSql = `SELECT COUNT(*) as total FROM medical_records WHERE status = 'active'`;
        let countParams = [];

        if (search) {
            countSql += ` AND (patient_name LIKE ? OR owner_name LIKE ? OR diagnosis LIKE ?)`;
            countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const [{ total }] = await query(countSql, countParams);

        res.json({
            data: records,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(total / limit),
                total_records: total,
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error getting medical records:', error);
        res.status(500).json({ error: 'Failed to get medical records' });
    }
};

exports.getMedicalRecord = async (req, res) => {
    try {
        const { id } = req.params;

        const sql = `
            SELECT mr.*, u.name as vet_name 
            FROM medical_records mr 
            LEFT JOIN users u ON mr.vet_id = u.id 
            WHERE mr.id = ? AND mr.status = 'active'
        `;

        const records = await query(sql, [id]);

        if (records.length === 0) {
            return res.status(404).json({ error: 'Medical record not found' });
        }

        res.json(records[0]);
    } catch (error) {
        console.error('Error getting medical record:', error);
        res.status(500).json({ error: 'Failed to get medical record' });
    }
};

exports.createMedicalRecord = async (req, res) => {
    try {
        const {
            patient_id,
            patient_name,
            owner_name,
            owner_phone,
            pet_species,
            pet_breed,
            pet_age,
            diagnosis,
            treatment,
            prescription,
            notes,
            record_date
        } = req.body;

        // For admin, we'll use a default vet_id or get it from the request
        const vetId = req.body.vet_id || 1; // Default to admin user or first vet

        const sql = `
            INSERT INTO medical_records (
                patient_name, owner_name, owner_phone, 
                pet_species, pet_breed, pet_age, diagnosis, treatment, 
                prescription, notes, vet_id, record_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            patient_name,
            owner_name,
            owner_phone || null,
            pet_species,
            pet_breed || null,
            pet_age || null,
            diagnosis,
            treatment,
            prescription || null,
            notes || null,
            vetId,
            record_date
        ];

        const result = await query(sql, params);

        logAudit(req, 'CREATE', 'medical_record', result.insertId, `Created medical record for patient ${req.body.patient_name || ''}`);
        res.status(201).json({
            message: 'Medical record created successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error creating medical record:', error);
        res.status(500).json({ error: 'Failed to create medical record' });
    }
};

exports.updateMedicalRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            patient_name,
            owner_name,
            owner_phone,
            pet_species,
            pet_breed,
            pet_age,
            diagnosis,
            treatment,
            prescription,
            notes,
            record_date
        } = req.body;

        const sql = `
            UPDATE medical_records SET 
                patient_name = ?, owner_name = ?, owner_phone = ?, 
                pet_species = ?, pet_breed = ?, pet_age = ?, 
                diagnosis = ?, treatment = ?, prescription = ?, 
                notes = ?, record_date = ?
            WHERE id = ?
        `;

        const params = [
            patient_name,
            owner_name,
            owner_phone || null,
            pet_species,
            pet_breed || null,
            pet_age || null,
            diagnosis,
            treatment,
            prescription || null,
            notes || null,
            record_date,
            id
        ];

        const result = await query(sql, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Medical record not found' });
        }

        logAudit(req, 'UPDATE', 'medical_record', parseInt(id), `Updated medical record #${id}`);
        res.json({ message: 'Medical record updated successfully' });
    } catch (error) {
        console.error('Error updating medical record:', error);
        res.status(500).json({ error: 'Failed to update medical record' });
    }
};

exports.deleteMedicalRecord = async (req, res) => {
    try {
        const { id } = req.params;

        const sql = `UPDATE medical_records SET status = 'archived' WHERE id = ?`;
        const result = await query(sql, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Medical record not found' });
        }

        logAudit(req, 'DELETE', 'medical_record', parseInt(id), `Archived medical record #${id}`);
        res.json({ message: 'Medical record deleted successfully' });
    } catch (error) {
        console.error('Error deleting medical record:', error);
        res.status(500).json({ error: 'Failed to delete medical record' });
    }
};

exports.getAuditLogs = async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 100, 500);
        const offset = parseInt(req.query.offset) || 0;
        const entity = req.query.entity || null;

        let sql = `
            SELECT al.*, COALESCE(u.name, CONCAT('User #', al.user_id)) AS user_name
            FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.id
            ${entity ? 'WHERE al.entity = ?' : ''}
            ORDER BY al.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
        `;
        const params = entity ? [entity] : [];
        const rows = await query(sql, params);
        const [{ total }] = await query(
            `SELECT COUNT(*) AS total FROM audit_logs${entity ? ' WHERE entity = ?' : ''}`,
            entity ? [entity] : []
        );
        res.json({ logs: rows, total });
    } catch (err) {
        console.error('Error fetching audit logs:', err);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
};