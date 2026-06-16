// Appointments management
function formatPetAge(age) {
    if (!age && age !== 0) return '';
    const totalMonths = Math.round(parseFloat(age) * 12);
    const yrs = Math.floor(totalMonths / 12);
    const mo = totalMonths % 12;
    if (yrs === 0) return mo ? `${mo} mo` : '';
    if (mo === 0) return `${yrs} yr${yrs !== 1 ? 's' : ''}`;
    return `${yrs} yr${yrs !== 1 ? 's' : ''} ${mo} mo`;
}

let currentPage = 1;
let appointmentsPerPage = 10;
let currentFilter = 'all';
let searchQuery = '';

// Initialize appointments
document.addEventListener('DOMContentLoaded', () => {
    // Event listeners for filters
    document.getElementById('todayFilter').addEventListener('click', () => filterAppointments('today'));
    document.getElementById('weekFilter').addEventListener('click', () => filterAppointments('week'));
    document.getElementById('monthFilter').addEventListener('click', () => filterAppointments('month'));

    // Search input
    document.getElementById('appointmentSearch').addEventListener('input', (e) => {
        searchQuery = e.target.value;
        currentPage = 1; // Reset to first page on search
        loadAppointments();
    });

    // Status filter
    document.getElementById('statusFilter').addEventListener('change', (e) => {
        currentFilter = e.target.value;
        currentPage = 1; // Reset to first page on filter change
        loadAppointments();
    });

    // Items per page
    document.getElementById('appointmentsPerPage').addEventListener('change', (e) => {
        appointmentsPerPage = parseInt(e.target.value);
        currentPage = 1;
        loadAppointments();
    });

    // Add Appointment button is handled by dashboard.js to avoid conflicts

    // Initial load
    loadAppointments();
});

// Utility function to get token
function getToken() {
    return localStorage.getItem('token');
}

// Load appointments from the server
async function loadAppointments() {
    try {
        const response = await fetch(window.API_BASE_URL + '/admin/appointments?' + new URLSearchParams({
            page: currentPage,
            limit: appointmentsPerPage,
            filter: currentFilter,
            search: searchQuery
        }), {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch appointments');

        const data = await response.json();
        displayAppointments(data.appointments);
        updatePagination(data.pagination);
    } catch (error) {
        console.error('Error loading appointments:', error);
        showToast('error', 'Failed to load appointments');
    }
}

// Display appointments in the table
function displayAppointments(appointments) {
    const tbody = document.getElementById('appointmentsTableBody');
    tbody.innerHTML = '';

    if (appointments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4">
                    <p class="text-muted mb-0">No appointments found</p>
                </td>
            </tr>
        `;
        return;
    }

    appointments.forEach(appointment => {
        const row = document.createElement('tr');
        const date = appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleDateString() : 'N/A';
        const time = appointment.appointment_time || 'N/A';
        const clientName = appointment.client_name || `${appointment.first_name || ''} ${appointment.last_name || ''}`;
        const petType = appointment.pet_type || 'N/A';
        const petBreed = appointment.pet_breed || 'N/A';
        const petName = appointment.pet_name || 'N/A';

        row.innerHTML = `
            <td>${date}</td>
            <td>${time}</td>
            <td>
                ${clientName}
                <div class="small text-muted">${appointment.client_email || appointment.email || ''}</div>
            </td>
            <td>
                ${petName}
                <div class="small text-muted">${petType} - ${petBreed}${formatPetAge(appointment.pet_age) ? ` · ${formatPetAge(appointment.pet_age)}` : ''}</div>
            </td>
            <td>${appointment.service_name || ''}</td>
            <td>
                <span class="badge bg-${getStatusBadgeClass(appointment.status)}">
                    ${appointment.status}
                </span>
            </td>
            <td>
                <span class="badge bg-${getPaymentStatusBadgeClass(appointment.payment_status)}">
                    ${appointment.payment_status}
                </span>
            </td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-info" onclick='viewNotesModal(${JSON.stringify(appointment).replace(/'/g, "&#39;")})' title="Notes">
                        <i class='bx bx-note'></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" onclick='rescheduleAppointment(${JSON.stringify(appointment).replace(/'/g, "&#39;")})' title="Reschedule">
                        <i class='bx bx-calendar-edit'></i>
                    </button>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" title="Change Status">
                            <i class='bx bx-transfer-alt'></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item" href="#" onclick="updateAppointmentStatus(${appointment.id}, 'pending'); return false;">Pending</a></li>
                            <li><a class="dropdown-item" href="#" onclick="updateAppointmentStatus(${appointment.id}, 'confirmed'); return false;">Confirmed</a></li>
                            <li><a class="dropdown-item" href="#" onclick="updateAppointmentStatus(${appointment.id}, 'completed'); return false;">Completed</a></li>
                            <li><a class="dropdown-item" href="#" onclick="updateAppointmentStatus(${appointment.id}, 'no-show'); return false;">No Show</a></li>
                            <li><a class="dropdown-item text-danger" href="#" onclick="updateAppointmentStatus(${appointment.id}, 'cancelled'); return false;">Cancelled</a></li>
                        </ul>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteAppointment(${appointment.id})" title="Delete">
                        <i class='bx bx-trash'></i>
                    </button>
                </div>
            </td>
        `;

        tbody.appendChild(row);
    });
}

// Update appointment status via admin API
async function updateAppointmentStatus(id, newStatus) {
    try {
        const response = await fetch(window.API_BASE_URL + `/admin/appointments/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ status: newStatus })
        });
        if (!response.ok) throw new Error('Failed to update status');
        showToast('success', `Status updated to ${newStatus}`);
        loadAppointments();
    } catch (error) {
        console.error('Error updating status:', error);
        showToast('error', 'Failed to update status');
    }
}

// Update pagination controls
function updatePagination(pagination) {
    const paginationDiv = document.getElementById('appointmentsPagination');
    const { total, pages, currentPage, perPage } = pagination;

    let html = '<nav><ul class="pagination mb-0">';

    // Previous button
    html += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1})" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `;

    // Page numbers
    for (let i = 1; i <= pages; i++) {
        if (
            i === 1 || // First page
            i === pages || // Last page
            (i >= currentPage - 2 && i <= currentPage + 2) // Pages around current page
        ) {
            html += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
                </li>
            `;
        } else if (
            i === currentPage - 3 || // Show dots before current page
            i === currentPage + 3 // Show dots after current page
        ) {
            html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }

    // Next button
    html += `
        <li class="page-item ${currentPage === pages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1})" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `;

    html += '</ul></nav>';
    paginationDiv.innerHTML = html;
}

// Change page
function changePage(page) {
    currentPage = page;
    loadAppointments();
}

// Filter appointments
function filterAppointments(filter) {
    currentFilter = filter;
    currentPage = 1;
    loadAppointments();

    // Update button states
    document.querySelectorAll('#appointments-section .btn-primary').forEach(btn => {
        btn.classList.replace('btn-primary', 'btn-outline-primary');
    });
    document.getElementById(`${filter}Filter`).classList.replace('btn-outline-primary', 'btn-primary');
}

// Get appropriate badge class for status
function getStatusBadgeClass(status) {
    const statusClasses = {
        'pending': 'warning',
        'confirmed': 'primary',
        'completed': 'success',
        'cancelled': 'danger'
    };
    return statusClasses[status] || 'secondary';
}

// Get appropriate badge class for payment status
function getPaymentStatusBadgeClass(status) {
    const statusClasses = {
        'pending': 'warning',
        'paid': 'success',
        'refunded': 'info',
        'not_required': 'secondary'
    };
    return statusClasses[status] || 'secondary';
}

// Edit appointment
async function editAppointment(id) {
    try {
        const response = await fetch(window.API_BASE_URL + `/admin/appointments/${id}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch appointment details');
        const appointment = await response.json();
        showAppointmentModal(appointment);
    } catch (error) {
        console.error('Error fetching appointment details:', error);
        showToast('error', 'Failed to load appointment details: ' + error.message);
    }
}

// Delete appointment
async function deleteAppointment(id) {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    try {
        const response = await fetch(window.API_BASE_URL + `/admin/appointments/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        if (!response.ok) throw new Error('Failed to delete appointment');
        showToast('success', 'Appointment deleted successfully');
        loadAppointments();
    } catch (error) {
        console.error('Error deleting appointment:', error);
        showToast('error', 'Failed to delete appointment: ' + error.message);
    }
}

// Show toast message
function showToast(type, message) {
    // Implement your toast notification here
    console.log(`${type}: ${message}`);
}

// View appointment notes
function viewNotes(id) {
    const appointment = appointments.find(a => a.id === id);
    if (!appointment) return;

    // You can implement a modal or tooltip to show notes
    alert(appointment.notes || 'No notes available');
}

// Modal for viewing notes
function ensureNotesModal() {
    if (!document.getElementById('notesModal')) {
        const modalHtml = `
        <div class="modal fade" id="notesModal" tabindex="-1" aria-labelledby="notesModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="notesModalLabel">Appointment Notes</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body" id="notesModalBody">
                <!-- Notes will be loaded here -->
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
}

function viewNotesModal(appointment) {
    ensureNotesModal();
    const modalBody = document.getElementById('notesModalBody');
    modalBody.textContent = appointment.notes && appointment.notes.trim() ? appointment.notes : 'No notes available.';
    const notesModal = new bootstrap.Modal(document.getElementById('notesModal'));
    notesModal.show();
}

// Reschedule logic
function rescheduleAppointment(appointment) {
    showRescheduleModal(appointment);
}

// Show reschedule modal
function showRescheduleModal(appointment) {
    // Set appointment ID
    document.getElementById('rescheduleAppointmentId').value = appointment.id;
    
    // Set current date and time as default values
    document.getElementById('rescheduleDate').value = appointment.appointment_date || '';
    document.getElementById('rescheduleTime').value = appointment.appointment_time || '';
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('rescheduleModal'));
    modal.show();
}

// Add/Edit Appointment Modal Logic

async function showAppointmentModal(appointment = null) {
    ensureAppointmentModal();
    
    // Set form values
    document.getElementById('appointmentId').value = appointment ? appointment.id : '';
    document.getElementById('clientName').value = appointment ? (appointment.client_name || '') : '';
    document.getElementById('clientEmail').value = appointment ? (appointment.client_email || '') : '';
    document.getElementById('clientPhone').value = appointment ? (appointment.client_phone || '') : '';
    document.getElementById('petName').value = appointment ? (appointment.pet_name || '') : '';
    document.getElementById('petType').value = appointment ? (appointment.pet_type || '') : '';
    document.getElementById('petBreed').value = appointment ? (appointment.pet_breed || '') : '';
    document.getElementById('serviceId').value = appointment ? (appointment.service_id || '') : '';
    
    // Set default date/time for new appointments
    if (!appointment) {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('appointmentDate').value = today;
        
        const now = new Date();
        now.setHours(now.getHours() + 1);
        const timeString = now.toTimeString().slice(0, 5);
        document.getElementById('appointmentTime').value = timeString;
    } else {
        document.getElementById('appointmentDate').value = appointment ? (appointment.appointment_date || '') : '';
        document.getElementById('appointmentTime').value = appointment ? (appointment.appointment_time || '') : '';
    }
    
    document.getElementById('status').value = appointment ? (appointment.status || 'pending') : 'pending';
    document.getElementById('price').value = appointment ? (appointment.price || '') : '';
    document.getElementById('paymentStatus').value = appointment ? (appointment.payment_status || 'pending') : 'pending';
    document.getElementById('notes').value = appointment ? (appointment.notes || '') : '';
    // Load services dropdown
    await loadServicesDropdown();
    
    const modal = new bootstrap.Modal(document.getElementById('appointmentModal'));
    modal.show();
}

function ensureAppointmentModal() {
    // Modal is already in HTML, so nothing needed here
}

async function loadServicesDropdown() {
    const select = document.getElementById('serviceId');
    if (!select) return;
    select.innerHTML = '<option value="">Loading...</option>';
    try {
        const response = await fetch(window.API_BASE_URL + '/admin/services', {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (!response.ok) throw new Error('Failed to load services');
        const services = await response.json();
        select.innerHTML = '<option value="">Select Service</option>' +
            services.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    } catch (e) {
        select.innerHTML = '<option value="">Failed to load</option>';
    }
}

// handleAppointmentFormSubmit function removed - form submission is now handled by dashboard.js