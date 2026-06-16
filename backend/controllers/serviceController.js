const db = require('../config/database');
const logAudit = require('../utils/auditLogger');

exports.getAllServices = async(req, res) => {
    try {
        console.log('Getting all services...');
        const [services] = await db.pool.execute(
            'SELECT *, CAST(price AS DECIMAL(10,2)) as price FROM services ORDER BY name'
        );

        console.log(`Database returned ${services.length} services`);

        if (services.length === 0) {
            console.log('No services found in database');
            return res.json([]);
        }

        // Group services by name and keep the most recent version
        const uniqueServices = Object.values(
            services.reduce((acc, service) => {
                const currentService = acc[service.name];
                if (!currentService || new Date(service.created_at) > new Date(currentService.created_at)) {
                    acc[service.name] = {
                        ...service,
                        price: parseFloat(service.price) // Convert price to number
                    };
                }
                return acc;
            }, {})
        );

        console.log(`Returning ${uniqueServices.length} unique services after deduplication`);
        res.json(uniqueServices);
    } catch (err) {
        console.error('Error getting services:', err);
        console.error('Error details:', err.message);
        console.error('Error stack:', err.stack);
        res.status(500).json({ error: "An error occurred while fetching services" });
    }
};

exports.getServiceById = async(req, res) => {
    try {
        const [services] = await db.pool.execute(
            'SELECT * FROM services WHERE id = ?', [req.params.id]
        );

        if (services.length === 0) {
            return res.status(404).json({ error: "Service not found" });
        }

        res.json(services[0]);
    } catch (err) {
        console.error('Error getting service:', err);
        res.status(500).json({ error: "An error occurred while fetching service" });
    }
};

exports.createService = async(req, res) => {
    try {
        const { name, description, duration, price } = req.body;

        const result = await db.pool.execute(
            'INSERT INTO services (name, description, duration, price) VALUES (?, ?, ?, ?)', [name, description, duration, price]
        );

        logAudit(req, 'CREATE', 'service', result[0].insertId, `Created service: ${name}`);
        res.status(201).json({
            message: "Service created successfully",
            serviceId: result[0].insertId
        });
    } catch (err) {
        console.error('Error creating service:', err);
        res.status(500).json({ error: "An error occurred while creating service" });
    }
};

exports.updateService = async(req, res) => {
    try {
        const { name, description, duration, price, status } = req.body;

        // Check if service exists
        const [services] = await db.pool.execute(
            'SELECT * FROM services WHERE id = ?', [req.params.id]
        );

        if (services.length === 0) {
            return res.status(404).json({ error: "Service not found" });
        }

        await db.pool.execute(
            `UPDATE services 
             SET name = ?, description = ?, duration = ?, price = ?, status = ?
             WHERE id = ?`, [name, description, duration, price, status, req.params.id]
        );

        logAudit(req, 'UPDATE', 'service', parseInt(req.params.id), `Updated service #${req.params.id}: ${name}`);
        res.json({ message: "Service updated successfully" });
    } catch (err) {
        console.error('Error updating service:', err);
        res.status(500).json({ error: "An error occurred while updating service" });
    }
};

exports.deleteService = async(req, res) => {
    try {
        // Check if service exists
        const [services] = await db.pool.execute(
            'SELECT * FROM services WHERE id = ?', [req.params.id]
        );

        if (services.length === 0) {
            return res.status(404).json({ error: "Service not found" });
        }

        // Check if service is used in any appointments
        const [appointments] = await db.pool.execute(
            'SELECT COUNT(*) as count FROM appointments WHERE service_id = ?', [req.params.id]
        );

        if (appointments[0].count > 0) {
            return res.status(400).json({
                error: "Cannot delete service as it is associated with appointments"
            });
        }

        await db.pool.execute('DELETE FROM services WHERE id = ?', [req.params.id]);
        logAudit(req, 'DELETE', 'service', parseInt(req.params.id), `Deleted service #${req.params.id}`);
        res.json({ message: "Service deleted successfully" });
    } catch (err) {
        console.error('Error deleting service:', err);
        res.status(500).json({ error: "An error occurred while deleting service" });
    }
};