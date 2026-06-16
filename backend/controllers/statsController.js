const db = require('../config/database');

exports.getAppointmentStats = async(req, res) => {
    try {
        // Get total appointments by status
        const [statusStats] = await db.query(`
            SELECT status, COUNT(*) as count
            FROM appointments
            GROUP BY status
        `);

        // Get appointments by date (last 30 days)
        const [dateStats] = await db.query(`
            SELECT DATE(appointment_date) as date, COUNT(*) as count
            FROM appointments
            WHERE appointment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY DATE(appointment_date)
            ORDER BY date
        `);

        // Get appointments by service
        const [serviceStats] = await db.query(`
            SELECT s.name, COUNT(a.id) as count
            FROM services s
            LEFT JOIN appointments a ON s.id = a.service_id
            GROUP BY s.id, s.name
            ORDER BY count DESC
        `);

        // Get appointments by vet
        const [vetStats] = await db.query(`
            SELECT u.name, COUNT(a.id) as count
            FROM users u
            LEFT JOIN appointments a ON u.id = a.vet_id
            WHERE u.role = 'vet'
            GROUP BY u.id, u.name
            ORDER BY count DESC
        `);

        res.json({
            byStatus: statusStats,
            byDate: dateStats,
            byService: serviceStats,
            byVet: vetStats
        });
    } catch (err) {
        console.error('Error getting appointment stats:', err);
        res.status(500).json({ error: "An error occurred while fetching appointment statistics" });
    }
};

exports.getRevenueStats = async(req, res) => {
    try {
        // Get revenue by date (last 12 months, grouped by month)
        const revenueByMonth = await db.query(`
            SELECT 
                DATE_FORMAT(appointment_date, '%Y-%m') as month,
                SUM(price) as revenue
            FROM appointments
            WHERE 
                appointment_date >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 11 MONTH), '%Y-%m-01')
                AND payment_status = 'paid'
            GROUP BY month
            ORDER BY month
        `);

        // Generate last 12 months labels
        const months = [];
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const label = d.toISOString().slice(0, 7); // 'YYYY-MM'
            months.push(label);
        }
        // Map revenue data to all months, filling missing with 0
        const revenueMap = Object.fromEntries(revenueByMonth.map(row => [row.month, Number(row.revenue) || 0]));
        const monthlyTrend = months.map(month => ({ month, revenue: revenueMap[month] || 0 }));

        // Get revenue by service
        const revenueByService = await db.query(`
            SELECT 
                s.name,
                SUM(a.price) as revenue
            FROM appointments a
            JOIN services s ON a.service_id = s.id
            WHERE a.payment_status = 'paid'
            GROUP BY s.id, s.name
            ORDER BY revenue DESC
        `);

        res.json({
            monthlyTrend,
            byService: revenueByService.map(row => ({ name: row.name, revenue: Number(row.revenue) || 0 }))
        });
    } catch (err) {
        console.error('Error getting revenue stats:', err);
        res.status(500).json({ error: "An error occurred while fetching revenue statistics" });
    }
};

exports.getServiceStats = async(req, res) => {
    try {
        // Get service usage stats
        const [serviceStats] = await db.query(`
            SELECT 
                s.name,
                s.price,
                COUNT(a.id) as total_appointments,
                COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
                COUNT(CASE WHEN a.payment_status = 'paid' THEN 1 END) as paid_appointments,
                SUM(CASE WHEN a.payment_status = 'paid' THEN s.price ELSE 0 END) as total_revenue
            FROM services s
            LEFT JOIN appointments a ON s.id = a.service_id
            GROUP BY s.id, s.name, s.price
            ORDER BY total_appointments DESC
        `);

        // Get service popularity by time slot
        const [timeSlotStats] = await db.query(`
            SELECT 
                s.name,
                HOUR(a.appointment_time) as hour,
                COUNT(*) as count
            FROM services s
            JOIN appointments a ON s.id = a.service_id
            GROUP BY s.id, s.name, HOUR(a.appointment_time)
            ORDER BY s.name, hour
        `);

        // Get service status distribution
        const [statusStats] = await db.query(`
            SELECT 
                s.name,
                a.status,
                COUNT(*) as count
            FROM services s
            JOIN appointments a ON s.id = a.service_id
            GROUP BY s.id, s.name, a.status
            ORDER BY s.name, a.status
        `);

        res.json({
            usage: serviceStats,
            timeSlots: timeSlotStats,
            statusDistribution: statusStats
        });
    } catch (err) {
        console.error('Error getting service stats:', err);
        res.status(500).json({ error: "An error occurred while fetching service statistics" });
    }
};