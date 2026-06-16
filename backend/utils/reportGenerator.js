const PDFDocument = require('pdfkit');

const BRAND = '#0d6efd';
const INK = '#212529';
const MUTED = '#6c757d';

// Reminders shown on the appointment confirmation page — repeated on the receipt
const IMPORTANT_NOTES = [
    'Please arrive 10 minutes before your appointment time',
    'Bring any previous medical records if available',
    'Ensure your pet is properly restrained',
    'Call us if you need to reschedule or cancel'
];

const fmtReceiptDate = (date) => new Date(date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});
const fmtReceiptTime = (time) => {
    if (!time) return '';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true
    });
};

// Generate a single-appointment payment receipt as a PDF Buffer
exports.generateAppointmentReceipt = async(appointment) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));

            const pageLeft = doc.page.margins.left;
            const pageRight = doc.page.width - doc.page.margins.right;
            const contentWidth = pageRight - pageLeft;

            // Header band
            doc.rect(0, 0, doc.page.width, 110).fill(BRAND);
            doc.fillColor('#ffffff')
                .fontSize(26).font('Helvetica-Bold')
                .text('Pawfect Care', pageLeft, 36);
            doc.fontSize(11).font('Helvetica')
                .text('Veterinary Clinic', pageLeft, 70);
            doc.fontSize(22).font('Helvetica-Bold')
                .text('RECEIPT', pageLeft, 40, { width: contentWidth, align: 'right' });
            doc.fontSize(10).font('Helvetica')
                .text(appointment.receipt_number || '', pageLeft, 74, { width: contentWidth, align: 'right' });

            // PAID badge
            doc.roundedRect(pageRight - 70, 90, 70, 22, 4).fill('#198754');
            doc.fillColor('#ffffff').fontSize(11).font('Helvetica-Bold')
                .text('PAID', pageRight - 70, 96, { width: 70, align: 'center' });

            doc.fillColor(MUTED).fontSize(10).font('Helvetica')
                .text(`Issued: ${fmtReceiptDate(appointment.created_at || new Date())}`, pageLeft, 130);

            let y = 160;

            // Two-column "Billed To" / "Pet" block
            const colGap = 20;
            const colWidth = (contentWidth - colGap) / 2;
            const rightX = pageLeft + colWidth + colGap;

            const sectionLabel = (label, x, yy) => {
                doc.fillColor(BRAND).fontSize(10).font('Helvetica-Bold')
                    .text(label.toUpperCase(), x, yy);
            };
            const line = (text, x, yy, opts = {}) => {
                doc.fillColor(opts.color || INK)
                    .fontSize(opts.size || 11)
                    .font(opts.bold ? 'Helvetica-Bold' : 'Helvetica')
                    .text(text, x, yy, { width: colWidth });
            };

            sectionLabel('Billed To', pageLeft, y);
            sectionLabel('Patient', rightX, y);
            y += 16;
            line(appointment.client_name || '', pageLeft, y, { bold: true });
            line(`${appointment.pet_name || ''}`, rightX, y, { bold: true });
            y += 16;
            line(appointment.client_email || '', pageLeft, y, { color: MUTED, size: 10 });
            line(`${appointment.pet_type || ''}${appointment.pet_breed ? ' · ' + appointment.pet_breed : ''}`, rightX, y, { color: MUTED, size: 10 });
            y += 14;
            line(appointment.client_phone || '', pageLeft, y, { color: MUTED, size: 10 });

            y += 36;

            // Appointment / payment detail rows
            doc.moveTo(pageLeft, y).lineTo(pageRight, y).strokeColor('#dee2e6').stroke();
            y += 16;

            const detailRow = (label, value) => {
                doc.fillColor(MUTED).fontSize(10).font('Helvetica')
                    .text(label, pageLeft, y, { width: colWidth });
                doc.fillColor(INK).fontSize(11).font('Helvetica-Bold')
                    .text(value || '—', pageLeft + colWidth, y, { width: contentWidth - colWidth, align: 'right' });
                y += 22;
            };

            detailRow('Service', appointment.service_name);
            detailRow('Appointment Date', fmtReceiptDate(appointment.appointment_date));
            detailRow('Appointment Time', fmtReceiptTime(appointment.appointment_time));
            detailRow('Payment Method', appointment.payment_method);
            detailRow('Payment Reference', appointment.payment_reference);

            y += 6;
            doc.moveTo(pageLeft, y).lineTo(pageRight, y).strokeColor('#dee2e6').stroke();
            y += 14;

            // Total box
            const amount = Number(appointment.price || 0).toFixed(2);
            doc.roundedRect(pageRight - 220, y, 220, 46, 6).fill('#f1f5ff');
            doc.fillColor(MUTED).fontSize(11).font('Helvetica')
                .text('Amount Paid', pageRight - 205, y + 14);
            doc.fillColor(BRAND).fontSize(20).font('Helvetica-Bold')
                .text(`$${amount}`, pageRight - 220, y + 9, { width: 205, align: 'right' });

            y += 80;

            // Important information / reminders
            doc.fillColor(BRAND).fontSize(11).font('Helvetica-Bold')
                .text('Important Information', pageLeft, y);
            y += 18;
            doc.fillColor(INK).fontSize(10).font('Helvetica');
            IMPORTANT_NOTES.forEach(note => {
                doc.text(`•  ${note}`, pageLeft, y, { width: contentWidth });
                y += 15;
            });
            y += 18;

            // Footer
            doc.fillColor(MUTED).fontSize(10).font('Helvetica')
                .text('Thank you for choosing Pawfect Care. Please keep this receipt as proof of payment.', pageLeft, y, { width: contentWidth, align: 'center' });
            doc.moveDown(0.5);
            doc.fillColor(MUTED).fontSize(9)
                .text('2pawfectcare@gmail.com  ·  0788400208', { width: contentWidth, align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

exports.generatePDF = async(type, data) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument();
            const chunks = [];

            // Collect PDF chunks
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));

            // Add header
            doc.fontSize(20).text(`VetTech - ${formatReportTitle(type)} Report`, {
                align: 'center'
            });
            doc.moveDown();
            doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, {
                align: 'center'
            });
            doc.moveDown(2);

            // Add content based on report type
            switch (type) {
                case 'revenue':
                    generateRevenueReport(doc, data);
                    break;
                case 'appointments':
                    generateAppointmentsReport(doc, data);
                    break;
                case 'services':
                    generateServicesReport(doc, data);
                    break;
                case 'vets':
                    generateVetsReport(doc, data);
                    break;
                default:
                    doc.text('Invalid report type');
            }

            // Add footer
            doc.moveDown(2);
            doc.fontSize(10).text('VetTech Management System', {
                align: 'center',
                color: 'grey'
            });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

function formatReportTitle(type) {
    return type.charAt(0).toUpperCase() + type.slice(1);
}

function generateRevenueReport(doc, data) {
    // Add summary
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const totalAppointments = data.reduce((sum, item) => sum + item.appointments, 0);

    doc.fontSize(14).text('Summary', { underline: true });
    doc.fontSize(12).text(`Total Revenue: $${totalRevenue.toFixed(2)}`);
    doc.text(`Total Appointments: ${totalAppointments}`);
    doc.moveDown();

    // Add table header
    doc.fontSize(14).text('Daily Breakdown', { underline: true });
    doc.moveDown();
    doc.fontSize(12);

    const tableTop = doc.y;
    const dateX = 50;
    const appointmentsX = 200;
    const revenueX = 350;

    doc.text('Date', dateX, tableTop);
    doc.text('Appointments', appointmentsX, tableTop);
    doc.text('Revenue', revenueX, tableTop);
    doc.moveDown();

    // Add table rows
    data.forEach(item => {
        const y = doc.y;
        doc.text(new Date(item.date).toLocaleDateString(), dateX, y);
        doc.text(item.appointments.toString(), appointmentsX, y);
        doc.text(`$${item.revenue.toFixed(2)}`, revenueX, y);
        doc.moveDown();
    });
}

function generateAppointmentsReport(doc, data) {
    // Add summary
    const statusCounts = data.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
    }, {});

    doc.fontSize(14).text('Appointments Summary', { underline: true });
    doc.fontSize(12).text(`Total Appointments: ${data.length}`);
    Object.entries(statusCounts).forEach(([status, count]) => {
        doc.text(`${status}: ${count}`);
    });
    doc.moveDown();

    // Add appointments list
    data.forEach(appointment => {
        doc.text(`Date: ${new Date(appointment.appointment_date).toLocaleDateString()} ${appointment.appointment_time}`);
        doc.text(`Client: ${appointment.client_name} (${appointment.client_email})`);
        doc.text(`Pet: ${appointment.pet_name} (${appointment.pet_type})`);
        doc.text(`Service: ${appointment.service_name}`);
        doc.text(`Status: ${appointment.status}`);
        doc.text(`Payment: ${appointment.payment_status}`);
        if (appointment.notes) doc.text(`Notes: ${appointment.notes}`);
        doc.moveDown();
    });
}

function generateServicesReport(doc, data) {
    // Add summary
    const totalServices = data.length;
    const activeServices = data.filter(s => s.status === 'active').length;

    doc.fontSize(14).text('Services Summary', { underline: true });
    doc.fontSize(12).text(`Total Services: ${totalServices}`);
    doc.text(`Active Services: ${activeServices}`);
    doc.moveDown();

    // Add services list
    doc.fontSize(14).text('Services List', { underline: true });
    doc.moveDown();

    data.forEach(service => {
        doc.fontSize(12).text(service.name, { underline: true });
        doc.fontSize(10).text(`Duration: ${service.duration} minutes`);
        doc.text(`Price: $${service.price.toFixed(2)}`);
        doc.text(`Status: ${service.status}`);
        doc.text(`Description: ${service.description}`);
        doc.moveDown();
    });
}

function generateVetsReport(doc, data) {
    // Add summary
    const totalVets = data.length;
    const activeVets = data.filter(v => v.status === 'active').length;

    doc.fontSize(14).text('Veterinarians Summary', { underline: true });
    doc.fontSize(12).text(`Total Veterinarians: ${totalVets}`);
    doc.text(`Active Veterinarians: ${activeVets}`);
    doc.moveDown();

    // Add vets list
    data.forEach(vet => {
        doc.fontSize(12).text(vet.name, { underline: true });
        doc.fontSize(10).text(`Email: ${vet.email}`);
        doc.text(`Phone: ${vet.phone || 'N/A'}`);
        doc.text(`Specialization: ${vet.specialization || 'General Practice'}`);
        doc.text(`Status: ${vet.status}`);
        doc.text(`Appointments Handled: ${vet.appointments_count || 0}`);
        if (vet.working_hours) doc.text(`Working Hours: ${JSON.stringify(vet.working_hours)}`);
        doc.moveDown();
    });
}