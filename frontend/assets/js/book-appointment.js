// Use the API_BASE_URL from window object
const API_BASE_URL = window.API_BASE_URL;
let selectedServiceId = null;
let selectedTimeSlot = null;
let pendingAppointmentData = null;

// Debug logging
console.log('API_BASE_URL:', API_BASE_URL);

// Helper: Convert a string to Title Case (first letter of each word capitalized)
function toTitleCase(input) {
    if (!input) return '';
    return input
        .toLowerCase()
        .replace(/\b[a-z]/g, function(char) { return char.toUpperCase(); });
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');

    // Initialize Flatpickr for date picker
    flatpickr("#appointmentDate", {
        minDate: "today",
        maxDate: new Date().fp_incr(21), // Allow booking up to 3 weeks in advance
        disable: [
            function(date) {
                // Disable Sundays
                return date.getDay() === 0;
            }
        ],
        locale: {
            firstDayOfWeek: 1 // Start week on Monday
        },
        onChange: function(selectedDates, dateStr) {
            const event = new Event('change', { bubbles: true });
            document.getElementById('appointmentDate').dispatchEvent(event);
        }
    });
    console.log('Date picker initialized');

    // Initialize Flatpickr for time picker (unused input — slots are rendered as buttons)
    flatpickr("#appointmentTime", {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        minTime: "09:00",
        maxTime: "17:00",
        minuteIncrement: 30,
        onChange: function(selectedDates, dateStr) {
            const event = new Event('change', { bubbles: true });
            document.getElementById('appointmentTime') &&
                document.getElementById('appointmentTime').dispatchEvent(event);
        }
    });

    // Load services
    loadServices();

    // Normalize name inputs on blur
    ['clientName', 'petName', 'petBreed'].forEach(function(fieldId) {
        var el = document.getElementById(fieldId);
        if (el) {
            el.addEventListener('blur', function() {
                el.value = toTitleCase(el.value.trim());
            });
        }
    });

    const form = document.getElementById('appointmentForm');
    const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));

    let selectedDate = null;

    // Listen for service selection
    document.addEventListener('click', function(e) {
        const card = e.target.closest('.service-card');
        if (card) {
            selectedServiceId = String(card.dataset.serviceId);
            document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            console.log('Selected service ID:', selectedServiceId, typeof selectedServiceId);
            updateAvailableSlots();
        }
    });

    // Listen for date selection
    document.getElementById('appointmentDate').addEventListener('change', function(e) {
        selectedDate = e.target.value;
        console.log('Date changed:', selectedDate);
        updateAvailableSlots();
    });

    // Form submit — validate then show payment modal
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Form submitted');

        if (!validateForm()) return;

        const selectedService = document.querySelector('.service-card.selected');
        if (!selectedService) {
            showError('Please select a service');
            return;
        }
        if (!selectedTimeSlot) {
            showError('Please select an available time slot');
            return;
        }

        const appointmentDate = document.getElementById('appointmentDate').value;
        const appointmentTime = selectedTimeSlot ? selectedTimeSlot.slice(0, 5) : '';

        const normalizedClientName = toTitleCase(document.getElementById('clientName').value.trim());
        const normalizedPetName = toTitleCase(document.getElementById('petName').value.trim());
        const normalizedPetBreed = toTitleCase(document.getElementById('petBreed').value.trim());

        document.getElementById('clientName').value = normalizedClientName;
        document.getElementById('petName').value = normalizedPetName;
        document.getElementById('petBreed').value = normalizedPetBreed;

        const appointmentData = {
            client_name: normalizedClientName,
            client_email: document.getElementById('clientEmail').value.trim(),
            client_phone: document.getElementById('clientPhone').value.trim(),
            pet_name: normalizedPetName,
            pet_type: document.getElementById('petType').value.trim(),
            pet_breed: normalizedPetBreed,
            pet_age: (function() {
                const years = parseInt(document.getElementById('petAgeYears')?.value, 10) || 0;
                const months = parseInt(document.getElementById('petAgeMonths')?.value, 10) || 0;
                const total = years + months / 12;
                return total > 0 ? parseFloat(total.toFixed(4)) : null;
            })(),
            service_id: parseInt(selectedService.dataset.serviceId),
            appointment_date: appointmentDate,
            appointment_time: appointmentTime,
            notes: document.getElementById('notes').value.trim(),
            newsletter: document.getElementById('newsletter').checked
        };

        pendingAppointmentData = {
            appointment: appointmentData,
            serviceName: selectedService.querySelector('.service-name').textContent,
            servicePrice: selectedService.querySelector('.service-price').textContent
        };

        document.getElementById('paymentServiceName').textContent = pendingAppointmentData.serviceName;
        document.getElementById('paymentAmount').textContent = pendingAppointmentData.servicePrice;
        paymentModal.show();
    });

    // Payment method switching
    document.querySelectorAll('.payment-method-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.payment-method-btn').forEach(function(b) {
                b.classList.remove('active');
            });
            this.classList.add('active');
            const method = this.dataset.method;
            if (method === 'visa' || method === 'mastercard') {
                document.getElementById('mobileMoneyForm').classList.add('d-none');
                document.getElementById('cardForm').classList.remove('d-none');
            } else {
                document.getElementById('cardForm').classList.add('d-none');
                document.getElementById('mobileMoneyForm').classList.remove('d-none');
            }
        });
    });

    // Card number auto-formatting (spaces every 4 digits)
    document.getElementById('cardNumber').addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '').substring(0, 16);
        this.value = value.replace(/(.{4})/g, '$1 ').trim();
    });

    // Expiry auto-formatting (MM/YY)
    document.getElementById('cardExpiry').addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '').substring(0, 4);
        if (value.length >= 3) {
            value = value.substring(0, 2) + '/' + value.substring(2);
        }
        this.value = value;
    });

    // Pay Now — fake 2s processing then submit to API
    document.getElementById('payNowBtn').addEventListener('click', async function() {
        if (!pendingAppointmentData) return;

        document.getElementById('mobileMoneyForm').classList.add('d-none');
        document.getElementById('cardForm').classList.add('d-none');
        document.getElementById('paymentProcessing').classList.remove('d-none');
        document.getElementById('payNowBtn').classList.add('d-none');
        document.getElementById('cancelPaymentBtn').classList.add('d-none');

        // Capture the selected payment method so it is stored with the booking
        const activeMethodBtn = document.querySelector('.payment-method-btn.active');
        pendingAppointmentData.appointment.payment_method = activeMethodBtn ? activeMethodBtn.dataset.method : 'ecocash';

        await new Promise(function(resolve) { setTimeout(resolve, 2000); });

        paymentModal.hide();
        loadingModal.show();

        try {
            console.log('Submitting appointment data:', pendingAppointmentData.appointment);

            const response = await fetch(`${API_BASE_URL}/appointments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pendingAppointmentData.appointment)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.errors ? result.errors[0].msg : (result.error || 'Failed to book appointment'));
            }

            localStorage.setItem('appointmentData', JSON.stringify({
                ...pendingAppointmentData.appointment,
                service: pendingAppointmentData.serviceName,
                appointment_id: result.appointmentId,
                receipt_number: result.receipt_number,
                payment_method: result.payment_method,
                payment_reference: result.payment_reference,
                amount_paid: result.amount_paid
            }));

            window.location.href = 'appointment-confirmation.html';
        } catch (error) {
            loadingModal.hide();
            showError(error.message);
            console.error('Appointment submission error:', error);
            pendingAppointmentData = null;
        }
    });

    // Reset payment modal state when closed
    document.getElementById('paymentModal').addEventListener('hidden.bs.modal', function() {
        document.getElementById('paymentProcessing').classList.add('d-none');
        document.getElementById('mobileMoneyForm').classList.remove('d-none');
        document.getElementById('cardForm').classList.add('d-none');
        document.getElementById('payNowBtn').classList.remove('d-none');
        document.getElementById('cancelPaymentBtn').classList.remove('d-none');
        document.querySelectorAll('.payment-method-btn').forEach(function(b, i) {
            b.classList.toggle('active', i === 0);
        });
    });

    // Add input validation on blur (exclude appointmentDate — flatpickr sets it after blur fires)
    document.querySelectorAll('input[required], select[required]').forEach(input => {
        if (input.id === 'appointmentDate') return;
        input.addEventListener('blur', function() {
            validateInput(this);
        });
    });
});

async function loadServices() {
    console.log('Starting loadServices function');
    const serviceCards = document.getElementById('serviceCards');

    if (!serviceCards) {
        console.error('Service cards container not found!');
        return;
    }

    try {
        console.log('Fetching services from:', `${API_BASE_URL}/services`);
        const response = await fetch(`${API_BASE_URL}/services`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Raw API response:', data);

        const services = Array.isArray(data) ? data : [data];
        console.log('Processed services:', services);

        serviceCards.innerHTML = '';

        if (!services || services.length === 0) {
            serviceCards.innerHTML = `
                <div class="alert alert-warning" role="alert">
                    <i class="bi bi-exclamation-triangle"></i>
                    No services available at the moment. Please try again later.
                </div>
            `;
            return;
        }

        services.forEach(service => {
            if (!service || typeof service !== 'object') {
                console.warn('Invalid service data:', service);
                return;
            }

            const price = typeof service.price === 'number' ? service.price : parseFloat(service.price) || 0;
            console.log('Creating service card for:', service.name, 'with price:', price);

            const card = document.createElement('div');
            card.className = 'service-card';
            card.dataset.serviceId = service.id;
            card.innerHTML = `
                <div class="service-name">${service.name || 'Unnamed Service'}</div>
                <div class="service-price">$${price.toFixed(2)}</div>
                <div class="service-duration">${service.duration || 0} minutes</div>
                <div class="service-description">${service.description || 'No description available'}</div>
            `;

            serviceCards.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading services:', error);
        serviceCards.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="bi bi-exclamation-triangle"></i>
                Failed to load services: ${error.message}. Please refresh the page or contact support.
            </div>
        `;
    }
}

function validateInput(input) {
    if (!input.value) {
        input.classList.add('is-invalid');
        if (!input.nextElementSibling || !input.nextElementSibling.classList.contains('invalid-feedback')) {
            const feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            feedback.textContent = `Please provide a valid ${input.previousElementSibling.textContent.toLowerCase()}`;
            input.parentNode.insertBefore(feedback, input.nextSibling);
        }
        return false;
    } else {
        input.classList.remove('is-invalid');
        const feedback = input.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.remove();
        }
        return true;
    }
}

function validateForm() {
    const requiredInputs = document.querySelectorAll('input[required], select[required]');
    let isValid = true;

    requiredInputs.forEach(input => {
        if (!validateInput(input)) {
            isValid = false;
        }
    });

    return isValid;
}

function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show mt-3';
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        <i class="bi bi-exclamation-triangle"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    const form = document.getElementById('appointmentForm');
    form.parentNode.insertBefore(alertDiv, form.nextSibling);

    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alertDiv);
        bsAlert.close();
    }, 5000);
}

async function updateAvailableSlots() {
    console.log('updateAvailableSlots called');
    const timeSlotsContainer = document.getElementById('timeSlotsContainer');
    selectedTimeSlot = null;
    if (!selectedServiceId || !document.getElementById('appointmentDate').value) {
        timeSlotsContainer.innerHTML = '<div class="alert alert-info">Select a date and service to see available time slots.</div>';
        return;
    }
    console.log('Fetching available slots for service_id:', selectedServiceId, typeof selectedServiceId);
    timeSlotsContainer.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';
    try {
        const date = document.getElementById('appointmentDate').value;
        const res = await fetch(`${API_BASE_URL}/appointments/available-slots?date=${encodeURIComponent(date)}&service_id=${selectedServiceId}`);
        if (!res.ok) throw new Error('Failed to fetch available slots');
        const slots = await res.json();
        if (!Array.isArray(slots) || slots.length === 0) {
            timeSlotsContainer.innerHTML = '<div class="alert alert-warning">No available time slots for this date. Please choose another date.</div>';
            return;
        }
        timeSlotsContainer.innerHTML = '<div class="time-slots"></div>';
        const slotsDiv = timeSlotsContainer.querySelector('.time-slots');
        slots.forEach(slot => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn btn-outline-primary time-slot m-1';
            btn.textContent = slot;
            btn.onclick = function() {
                document.querySelectorAll('.time-slot').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedTimeSlot = slot;
            };
            slotsDiv.appendChild(btn);
        });
    } catch (err) {
        timeSlotsContainer.innerHTML = `<div class="alert alert-danger">Failed to load available slots. Please try again.</div>`;
        console.error('Error loading available slots:', err);
    }
}
