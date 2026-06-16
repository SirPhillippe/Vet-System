const nodemailer = require('nodemailer');
require('dotenv').config();

// Create Gmail transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD // This should be an App Password, not your regular Gmail password
    }
});

// Verify connection configuration
transporter.verify()
    .then(() => console.log('✅ Email service is ready'))
    .catch(err => console.error('❌ Email configuration error:', err));

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};

exports.sendAppointmentConfirmation = async({ to, name, email, phone, petName, petType, petBreed, date, time, service, receiptNumber, paymentMethod, paymentReference, amount, appointmentId }) => {
    const appBaseUrl = (process.env.APP_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');
    const receiptUrl = appointmentId ? `${appBaseUrl}/api/appointments/${appointmentId}/receipt` : null;

    const detailRow = (label, value) => `
        <tr>
            <td style="padding:8px 0;color:#6c757d;font-size:14px;">${label}</td>
            <td style="padding:8px 0;color:#212529;font-size:14px;font-weight:600;text-align:right;">${value}</td>
        </tr>`;

    // Reminders shown on the confirmation page — repeated here on the email receipt
    const importantNotes = [
        'Please arrive 10 minutes before your appointment time',
        'Bring any previous medical records if available',
        'Ensure your pet is properly restrained',
        'Call us if you need to reschedule or cancel'
    ];
    const importantSection = `
        <tr><td style="padding:8px 32px 0;">
            <div style="border-top:1px solid #e9ecef;margin:8px 0 16px;"></div>
            <h3 style="margin:0 0 12px;color:#0d6efd;font-size:16px;">Important Information</h3>
            <ul style="margin:0;padding-left:20px;color:#495057;font-size:14px;line-height:1.7;">
                ${importantNotes.map(note => `<li>${note}</li>`).join('')}
            </ul>
        </td></tr>`;

    // Receipt + download button only when payment details are supplied
    const receiptSection = receiptNumber ? `
        <tr><td style="padding:0 32px;">
            <div style="border-top:1px solid #e9ecef;margin:8px 0 20px;"></div>
            <h3 style="margin:0 0 12px;color:#0d6efd;font-size:16px;">Payment Receipt</h3>
            <table style="width:100%;border-collapse:collapse;">
                ${detailRow('Receipt Number', receiptNumber)}
                ${detailRow('Payment Method', paymentMethod || 'N/A')}
                ${detailRow('Payment Reference', paymentReference || 'N/A')}
                ${detailRow('Amount Paid', `$${amount != null ? amount : 'N/A'}`)}
            </table>
            ${receiptUrl ? `
            <div style="text-align:center;margin:24px 0 8px;">
                <a href="${receiptUrl}"
                   style="display:inline-block;background:#0d6efd;color:#ffffff;text-decoration:none;
                          padding:12px 28px;border-radius:8px;font-size:15px;font-weight:600;">
                    ⬇ Download Receipt (PDF)
                </a>
            </div>` : ''}
            <p style="font-size:12px;color:#868e96;text-align:center;margin:8px 0 0;">Please keep this receipt as proof of payment.</p>
        </td></tr>` : '';

    const emailContent = `
    <div style="background:#f4f6fb;padding:24px 0;font-family:Arial,Helvetica,sans-serif;">
      <table style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;
                    box-shadow:0 2px 8px rgba(0,0,0,0.06);width:100%;border-collapse:collapse;">
        <!-- Header -->
        <tr><td style="background:#0d6efd;padding:28px 32px;">
            <div style="color:#ffffff;font-size:24px;font-weight:700;">Pawfect Care</div>
            <div style="color:#dbe7ff;font-size:13px;margin-top:2px;">Veterinary Clinic</div>
        </td></tr>
        <!-- Confirmed banner -->
        <tr><td style="padding:24px 32px 8px;">
            <div style="font-size:20px;color:#198754;font-weight:700;">✓ Appointment Confirmed</div>
            <p style="color:#495057;font-size:15px;line-height:1.5;margin:12px 0 0;">
                Dear ${name},<br>
                Thank you for booking with Pawfect Care. Your appointment is scheduled and your payment has been received.
                Keep this email as your receipt.
            </p>
        </td></tr>
        <!-- Billed To / Patient -->
        <tr><td style="padding:16px 32px 0;">
            <table style="width:100%;border-collapse:collapse;">
                <tr>
                    <td style="width:50%;vertical-align:top;padding-right:12px;">
                        <div style="color:#0d6efd;font-size:11px;font-weight:700;letter-spacing:.5px;">BILLED TO</div>
                        <div style="color:#212529;font-size:14px;font-weight:600;margin-top:4px;">${name}</div>
                        <div style="color:#6c757d;font-size:13px;">${email || ''}</div>
                        <div style="color:#6c757d;font-size:13px;">${phone || ''}</div>
                    </td>
                    <td style="width:50%;vertical-align:top;">
                        <div style="color:#0d6efd;font-size:11px;font-weight:700;letter-spacing:.5px;">PATIENT</div>
                        <div style="color:#212529;font-size:14px;font-weight:600;margin-top:4px;">${petName || ''}</div>
                        <div style="color:#6c757d;font-size:13px;">${petType || ''}${petBreed ? ' · ' + petBreed : ''}</div>
                    </td>
                </tr>
            </table>
        </td></tr>
        <!-- Appointment details -->
        <tr><td style="padding:16px 32px 0;">
            <div style="border-top:1px solid #e9ecef;margin:8px 0 8px;"></div>
            <table style="width:100%;border-collapse:collapse;">
                ${detailRow('Service', service)}
                ${detailRow('Date', formatDate(date))}
                ${detailRow('Time', formatTime(time))}
            </table>
        </td></tr>
        ${receiptSection}
        ${importantSection}
        <!-- Footer -->
        <tr><td style="padding:24px 32px;background:#f8f9fa;border-top:1px solid #e9ecef;">
            <p style="color:#495057;font-size:13px;margin:0 0 8px;">
                If you need to reschedule, just reply to this email or call us.
            </p>
            <p style="color:#868e96;font-size:13px;margin:0;">
                <strong>Pawfect Care</strong><br>
                ✉ <a href="mailto:2pawfectcare@gmail.com" style="color:#0d6efd;">2pawfectcare@gmail.com</a>
                &nbsp;·&nbsp; ☎ <a href="tel:0788400208" style="color:#0d6efd;">0788400208</a>
            </p>
        </td></tr>
      </table>
    </div>`;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject: 'Appointment Confirmation - Pawfect Care',
            html: emailContent
        });
    } catch (error) {
        console.error('Error sending appointment confirmation:', error);
        throw error;
    }
};

exports.sendAppointmentReminder = async({ to, name, date, time }) => {
    const emailContent = `
        <h2>Appointment Reminder</h2>
        <p>Dear ${name},</p>
        <p>This is a friendly reminder about your upcoming appointment:</p>
        <ul>
            <li><strong>Date:</strong> ${formatDate(date)}</li>
            <li><strong>Time:</strong> ${formatTime(time)}</li>
        </ul>
        <p>Please arrive 10 minutes before your scheduled time.</p>
        <p>If you need to reschedule or cancel your appointment, please contact us as soon as possible.</p>
        <p>Best regards,<br>Pawfect Care Team</p>
    `;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject: 'Appointment Reminder - Pawfect Care',
            html: emailContent
        });
    } catch (error) {
        console.error('Error sending appointment reminder:', error);
        throw error;
    }
};

exports.sendAppointmentCancellation = async({ to, name, date, time, reason }) => {
        const emailContent = `
        <h2>Appointment Cancellation</h2>
        <p>Dear ${name},</p>
        <p>Your appointment scheduled for:</p>
        <ul>
            <li><strong>Date:</strong> ${formatDate(date)}</li>
            <li><strong>Time:</strong> ${formatTime(time)}</li>
        </ul>
        <p>has been cancelled${reason ? ` for the following reason: ${reason}` : ''}.</p>
        <p>If you would like to reschedule, please visit our website or contact us directly.</p>
        <p>Best regards,<br>Pawfect Care Team</p>
    `;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject: 'Appointment Cancellation - Pawfect Care',
            html: emailContent
        });
    } catch (error) {
        console.error('Error sending appointment cancellation:', error);
        throw error;
    }
};

// Shared branded wrapper used for status-change / reschedule notifications
const renderStatusEmail = ({ heading, headingColor, name, message, petName, service, date, time, extraNote }) => {
    const detailRow = (label, value) => value ? `
        <tr>
            <td style="padding:8px 0;color:#6c757d;font-size:14px;">${label}</td>
            <td style="padding:8px 0;color:#212529;font-size:14px;font-weight:600;text-align:right;">${value}</td>
        </tr>` : '';

    return `
    <div style="background:#f4f6fb;padding:24px 0;font-family:Arial,Helvetica,sans-serif;">
      <table style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;
                    box-shadow:0 2px 8px rgba(0,0,0,0.06);width:100%;border-collapse:collapse;">
        <!-- Header -->
        <tr><td style="background:#0d6efd;padding:28px 32px;">
            <div style="color:#ffffff;font-size:24px;font-weight:700;">Pawfect Care</div>
            <div style="color:#dbe7ff;font-size:13px;margin-top:2px;">Veterinary Clinic</div>
        </td></tr>
        <!-- Status banner -->
        <tr><td style="padding:24px 32px 8px;">
            <div style="font-size:20px;color:${headingColor};font-weight:700;">${heading}</div>
            <p style="color:#495057;font-size:15px;line-height:1.5;margin:12px 0 0;">
                Dear ${name || 'Customer'},<br>
                ${message}
            </p>
        </td></tr>
        <!-- Appointment details -->
        <tr><td style="padding:16px 32px 0;">
            <div style="border-top:1px solid #e9ecef;margin:8px 0 8px;"></div>
            <table style="width:100%;border-collapse:collapse;">
                ${detailRow('Patient', petName)}
                ${detailRow('Service', service)}
                ${detailRow('Date', date ? formatDate(date) : '')}
                ${detailRow('Time', time ? formatTime(time) : '')}
            </table>
        </td></tr>
        ${extraNote ? `<tr><td style="padding:16px 32px 0;color:#495057;font-size:14px;line-height:1.5;">${extraNote}</td></tr>` : ''}
        <!-- Footer -->
        <tr><td style="padding:24px 32px;background:#f8f9fa;border-top:1px solid #e9ecef;">
            <p style="color:#495057;font-size:13px;margin:0 0 8px;">
                If you have any questions, just reply to this email or call us.
            </p>
            <p style="color:#868e96;font-size:13px;margin:0;">
                <strong>Pawfect Care</strong><br>
                ✉ <a href="mailto:2pawfectcare@gmail.com" style="color:#0d6efd;">2pawfectcare@gmail.com</a>
                &nbsp;·&nbsp; ☎ <a href="tel:0788400208" style="color:#0d6efd;">0788400208</a>
            </p>
        </td></tr>
      </table>
    </div>`;
};

// Custom per-status content for appointment status-change notifications
const STATUS_CONTENT = {
    pending: {
        subject: 'Appointment Pending - Pawfect Care',
        heading: '⏳ Appointment Pending',
        headingColor: '#fd7e14',
        message: "We've received your appointment and it is currently <strong>pending</strong> review. Our team will confirm the details with you shortly."
    },
    confirmed: {
        subject: 'Appointment Confirmed - Pawfect Care',
        heading: '✓ Appointment Confirmed',
        headingColor: '#198754',
        message: "Good news! Your appointment has been <strong>confirmed</strong>. We look forward to seeing you and your pet."
    },
    completed: {
        subject: 'Appointment Completed - Pawfect Care',
        heading: '✓ Appointment Completed',
        headingColor: '#0d6efd',
        message: "Thank you for visiting Pawfect Care! Your appointment is now marked as <strong>completed</strong>. We hope your pet is feeling great."
    },
    'no-show': {
        subject: 'Missed Appointment - Pawfect Care',
        heading: 'Missed Appointment',
        headingColor: '#6c757d',
        message: "Our records show that you were unable to attend your scheduled appointment (marked as <strong>no-show</strong>). Please contact us to reschedule whenever you're ready."
    },
    cancelled: {
        subject: 'Appointment Cancelled - Pawfect Care',
        heading: '✕ Appointment Cancelled',
        headingColor: '#dc3545',
        message: "Your appointment has been <strong>cancelled</strong>. If this was unexpected or you'd like to rebook, please contact us or visit our website."
    }
};

// Notify the owner when an appointment's status changes (one custom message per status)
exports.sendAppointmentStatusUpdate = async({ to, name, petName, service, date, time, status, notes }) => {
    const key = String(status || '').toLowerCase().replace(/_/g, '-');
    const content = STATUS_CONTENT[key];
    if (!content) {
        console.log(`No status email template for status "${status}", skipping notification.`);
        return;
    }

    const extraNote = notes && notes.trim()
        ? `<strong>Note from the clinic:</strong> ${notes}`
        : '';

    const html = renderStatusEmail({
        heading: content.heading,
        headingColor: content.headingColor,
        name,
        message: content.message,
        petName,
        service,
        date,
        time,
        extraNote
    });

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject: content.subject,
            html
        });
    } catch (error) {
        console.error('Error sending appointment status update:', error);
        throw error;
    }
};

// Notify the owner when an appointment is rescheduled to a new date/time
exports.sendAppointmentReschedule = async({ to, name, petName, service, date, time }) => {
    const html = renderStatusEmail({
        heading: '📅 Appointment Rescheduled',
        headingColor: '#0d6efd',
        name,
        message: "Your appointment has been <strong>rescheduled</strong>. Please find your new date and time below.",
        petName,
        service,
        date,
        time,
        extraNote: "If this new time doesn't work for you, please contact us and we'll find a better slot."
    });

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject: 'Appointment Rescheduled - Pawfect Care',
            html
        });
    } catch (error) {
        console.error('Error sending appointment reschedule notification:', error);
        throw error;
    }
};

exports.sendPaymentConfirmation = async({ to, name, date, time, service, amount }) => {
    const emailContent = `
        <h2>Payment Confirmation</h2>
        <p>Dear ${name},</p>
        <p>We have received your payment of $${amount} for:</p>
        <ul>
            <li><strong>Service:</strong> ${service}</li>
            <li><strong>Date:</strong> ${formatDate(date)}</li>
            <li><strong>Time:</strong> ${formatTime(time)}</li>
        </ul>
        <p>Your appointment has been confirmed. We look forward to seeing you!</p>
        <p>Best regards,<br>Pawfect Care Team</p>
    `;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject: 'Payment Confirmation - Pawfect Care',
            html: emailContent
        });
    } catch (error) {
        console.error('Error sending payment confirmation:', error);
        throw error;
    }
};

// Generic email sending function
exports.sendEmail = async({ to, subject, text, html }) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html
        });
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};