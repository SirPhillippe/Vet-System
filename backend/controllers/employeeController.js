const Employee = require('../models/employee');
const logAudit = require('../utils/auditLogger');
const bcrypt = require('bcryptjs');

exports.getAllEmployees = async(req, res) => {
    try {
        const employees = await Employee.findAll();
        res.json(employees);
    } catch (err) {
        console.error('Error getting employees:', err);
        res.status(500).json({ error: 'An error occurred while fetching employees' });
    }
};

exports.createEmployee = async(req, res) => {
    try {
        const { first_name, last_name, email, phone, role, specialization, status } = req.body;
        const tempPassword = await bcrypt.hash('Welcome@1', 10);
        const employeeData = {
            first_name,
            last_name,
            email,
            phone: phone || null,
            role: role || 'staff',
            specialization: specialization || null,
            status: status || 'active',
            password: tempPassword
        };
        const employeeId = await Employee.create(employeeData);
        logAudit(req, 'CREATE', 'employee', employeeId, `Created employee: ${first_name} ${last_name}`);
        res.status(201).json({ message: 'Employee created successfully', employeeId });
    } catch (err) {
        console.error('Error creating employee:', err);
        res.status(500).json({ error: 'An error occurred while creating employee' });
    }
};

exports.getEmployeeById = async(req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.json(employee);
    } catch (err) {
        console.error('Error getting employee:', err);
        res.status(500).json({ error: 'An error occurred while fetching employee' });
    }
};

exports.updateEmployee = async(req, res) => {
    try {
        const { first_name, last_name, email, phone, role, specialization, status } = req.body;
        const updateData = {
            first_name,
            last_name,
            email,
            phone: phone || null,
            role: role || 'staff',
            specialization: specialization || null,
            status: status || 'active'
        };
        const updated = await Employee.update(req.params.id, updateData);
        if (!updated) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        logAudit(req, 'UPDATE', 'employee', parseInt(req.params.id), `Updated employee #${req.params.id}`);
        res.json({ message: 'Employee updated successfully' });
    } catch (err) {
        console.error('Error updating employee:', err);
        res.status(500).json({ error: 'An error occurred while updating employee' });
    }
};

exports.deleteEmployee = async(req, res) => {
    try {
        const deleted = await Employee.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        logAudit(req, 'DELETE', 'employee', parseInt(req.params.id), `Deleted employee #${req.params.id}`);
        res.json({ message: 'Employee deleted successfully' });
    } catch (err) {
        console.error('Error deleting employee:', err);
        res.status(500).json({ error: 'An error occurred while deleting employee' });
    }
};