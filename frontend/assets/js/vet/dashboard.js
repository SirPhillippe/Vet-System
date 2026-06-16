// Immediate initialization check
console.log('Vet dashboard JS loading...');

function formatPetAge(age) {
    if (!age && age !== 0) return '';
    const totalMonths = Math.round(parseFloat(age) * 12);
    const yrs = Math.floor(totalMonths / 12);
    const mo = totalMonths % 12;
    if (yrs === 0) return mo ? `${mo} mo` : '';
    if (mo === 0) return `${yrs} yr${yrs !== 1 ? 's' : ''}`;
    return `${yrs} yr${yrs !== 1 ? 's' : ''} ${mo} mo`;
}

function setAgeInputs(decimalAge) {
    const totalMonths = Math.round((parseFloat(decimalAge) || 0) * 12);
    const yrsEl = document.getElementById('petAgeYears');
    const moEl = document.getElementById('petAgeMonths');
    if (yrsEl) yrsEl.value = Math.floor(totalMonths / 12) || '';
    if (moEl) moEl.value = totalMonths % 12 || '';
}

function getAgeFromInputs() {
    const years = parseInt(document.getElementById('petAgeYears')?.value, 10) || 0;
    const months = parseInt(document.getElementById('petAgeMonths')?.value, 10) || 0;
    const total = years + months / 12;
    return total > 0 ? parseFloat(total.toFixed(4)) : null;
}

// Get API_BASE_URL from window object
const API_BASE_URL = window.API_BASE_URL;
console.log('API_BASE_URL:', API_BASE_URL);

// Global logout function - define immediately
window.logout = function() {
    console.log('Logout function called');
    alert('You have been successfully logged out. Redirecting to login page...');

    // Clear all stored data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();

    console.log('Data cleared, redirecting...');

    // Redirect to login page
    window.location.href = '/frontend/pages/login.html';
};

// Utility functions
function getToken() {
    return localStorage.getItem('token');
}

// Improved loading system
let loadingTimeout;
let isLoading = false;

function showLoading(delay = 300) {
    // Clear any existing timeout
    if (loadingTimeout) {
        clearTimeout(loadingTimeout);
    }
    
    // Only show loading if it's not already showing and after a delay
    if (!isLoading) {
        loadingTimeout = setTimeout(() => {
            isLoading = true;
            const spinner = document.createElement('div');
            spinner.className = 'spinner-overlay';
            spinner.innerHTML = '<div class="spinner-border" role="status"></div>';
            document.body.appendChild(spinner);
        }, delay);
    }
}

function hideLoading() {
    // Clear the timeout if it hasn't triggered yet
    if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        loadingTimeout = null;
    }
    
    // Hide the spinner if it's showing
    if (isLoading) {
        isLoading = false;
        const spinner = document.querySelector('.spinner-overlay');
        if (spinner) {
            spinner.remove();
        }
    }
}

// Inline loading for tables
function showTableLoading(tableBodyId, message = 'Loading...') {
    const tbody = document.getElementById(tableBodyId);
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                    ${message}
                </td>
            </tr>
        `;
    }
}

function hideTableLoading(tableBodyId) {
    const tbody = document.getElementById(tableBodyId);
    if (tbody && tbody.querySelector('.spinner-border')) {
        tbody.innerHTML = '';
    }
}

function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('.container-fluid').prepend(alert);
}

function showSuccess(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-success alert-dismissible fade show';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('.container-fluid').prepend(alert);
    setTimeout(() => {
        alert.style.transition = 'opacity 0.5s ease-out';
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 500);
    }, 4000);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getStatusColor(status) {
    switch (status.toLowerCase()) {
        case 'confirmed':
            return 'success';
        case 'pending':
            return 'warning';
        case 'cancelled':
            return 'danger';
        case 'completed':
            return 'info';
        default:
            return 'secondary';
    }
}

function getPaymentStatusColor(paymentStatus) {
    switch (paymentStatus ?.toLowerCase()) {
        case 'paid':
            return 'success';
        case 'pending':
            return 'warning';
        case 'refunded':
            return 'info';
        case 'partial':
            return 'primary';
        default:
            return 'secondary';
    }
}

// Dashboard functions
async function loadDashboardStats() {
    try {
        showLoading(500); // Show loading after 500ms for dashboard stats
        const response = await fetch(`${API_BASE_URL}/vet/dashboard-stats`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (!response.ok) throw new Error('Failed to load dashboard stats');

        const data = await response.json();

        // Update statistics
        document.getElementById('todayAppointments').textContent = data.todayAppointments || 0;
        document.getElementById('completedToday').textContent = data.completedToday || 0;
        document.getElementById('pendingCases').textContent = data.pendingCases || 0;

        await loadTodaySchedule();
    } catch (error) {
        showError('Error loading dashboard statistics');
        console.error(error);
    } finally {
        hideLoading();
    }
}

// Navigation and initialization
function handleNavigation() {
    const sidebarLinks = document.querySelectorAll('#sidebar a[data-section]');
    const sections = document.querySelectorAll('.content-section');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.getAttribute('data-section');

            // Update active states
            sidebarLinks.forEach(l => l.parentElement.classList.remove('active'));
            link.parentElement.classList.add('active');

            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${targetSection}-section`) {
                    section.classList.add('active');
                }
            });

            // Auto-close sidebar on mobile
            if (window.innerWidth < 992) {
                document.getElementById('sidebar').classList.remove('active');
                document.getElementById('content').classList.remove('active');
            }

            // Load section content
            switch (targetSection) {
                case 'dashboard':
                    loadDashboardStats();
                    break;
                case 'appointments':
                    loadFilteredAppointments();
                    break;
                case 'medical-records':
                    loadMedicalRecords();
                    break;
                case 'inventory':
                    loadInventory();
                    break;
                case 'reports':
                    loadReports();
                    break;
            }
        });
    });
}

function initializeSidebar() {
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');

    if (sidebarCollapse) {
        sidebarCollapse.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            content.classList.toggle('active');
        });
    }
}

function handleLogout() {
    console.log('handleLogout function called');
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        console.log('Logout link found:', logoutBtn);
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
        console.log('Logout event listener attached successfully');
    }
}

// Initialize dashboard
function initializeDashboard() {
    console.log('Initializing vet dashboard...');

    // Initialize all components
    handleNavigation();
    initializeSidebar();
    handleLogout();

    initializeMedicalRecordForm();
    initializeInventoryForms();
    initializeAddInventoryButton();
    initializeInventoryCancelButtons();
    initializeAppointmentForms();
    initializeAddAppointmentButton();
    initializeAppointmentCancelButtons();

    // Initialize appointment filters
    initializeAppointmentFilters();

    // Initialize modal forms
    initializeModalForms();
    
    // Set initial active filter
    setActiveFilter('all');

    // Initialize medical records functionality
    initializeAddMedicalRecordButton();
    initializeMedicalRecordCancelButtons();



    // Load initial dashboard data
    loadDashboardStats();
    loadFilteredAppointments();

    // Auto-hide welcome message after 30 seconds
    setTimeout(() => {
        const welcomeAlert = document.querySelector('#dashboard-section .alert-info');
        if (welcomeAlert) {
            welcomeAlert.style.transition = 'opacity 0.5s ease-out';
            welcomeAlert.style.opacity = '0';
            setTimeout(() => {
                welcomeAlert.remove();
            }, 500);
        }
    }, 30000); // 30 seconds
}

// Appointments Management
async function loadAppointments() {
    try {
        console.log('Loading appointments...');
        showTableLoading('appointmentsTableBody', 'Loading appointments...');
        const response = await fetch(`${API_BASE_URL}/vet/appointments`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        console.log('Appointments response status:', response.status);
        console.log('Appointments response ok:', response.ok);

        if (!response.ok) throw new Error('Failed to load appointments');

        const data = await response.json();
        console.log('Appointments data received:', data);
        console.log('Appointments data.appointments:', data.appointments);
        console.log('Is data.appointments an array?', Array.isArray(data.appointments));

        renderAppointmentsTable(data.appointments || []);
    } catch (error) {
        console.error('Error in loadAppointments:', error);
        showError('Error loading appointments');
        showTableLoading('appointmentsTableBody', 'Error loading appointments');
    }
}

function renderAppointmentsTable(appointments) {
    console.log('Rendering appointments table with:', appointments);
    const tbody = document.getElementById('appointmentsTableBody');
    console.log('Appointments table body element:', tbody);

    if (!tbody) {
        console.error('Appointments table body element not found!');
        return;
    }

    tbody.innerHTML = '';

    if (!appointments.length) {
        console.log('No appointments to display');
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">No appointments found.</td></tr>';
        return;
    }

    appointments.forEach(appointment => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(appointment.appointment_date)}</td>
            <td>${appointment.appointment_time || 'N/A'}</td>
            <td>${appointment.client_name}</td>
            <td>
                ${appointment.pet_name || 'N/A'}
                <div class="small text-muted">${formatPetAge(appointment.pet_age)}</div>
            </td>
            <td>${appointment.service_name}</td>
            <td><span class="badge bg-${getStatusColor(appointment.status)}">${appointment.status}</span></td>
            <td>
                <span class="badge bg-${getPaymentStatusColor(appointment.payment_status)}">${appointment.payment_status || 'Pending'}</span>
            </td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-info" onclick='viewNotesModal(${JSON.stringify(appointment).replace(/'/g, "&#39;")})' title="Notes">
                        <i class='bx bx-note'></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" onclick='rescheduleAppointment(${JSON.stringify(appointment).replace(/'/g, "&#39;")})' title="Reschedule">
                        <i class='bx bx-calendar-edit'></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" title="Change Status" onclick="openChangeStatus(${appointment.id}, '${(appointment.status || '').replace(/'/g, "\'")}')">
                        <i class='bx bx-transfer-alt'></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteAppointment(${appointment.id})" title="Delete">
                        <i class='bx bx-trash'></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Ensure change-status modal exists
    ensureChangeStatusModal();
}

async function updateAppointmentStatus(id, newStatus) {
    try {
        showLoading(200);
        const response = await fetch(`${API_BASE_URL}/vet/appointments/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ status: newStatus })
        });
        if (!response.ok) throw new Error('Failed to update status');
        showSuccess(`Status updated to ${newStatus}`);
        await loadFilteredAppointments();
    } catch (e) {
        console.error('Error updating status:', e);
        showError('Failed to update status');
    } finally {
        hideLoading();
    }
}

function ensureChangeStatusModal() {
    if (document.getElementById('changeStatusModal')) return;
    const html = `
    <div class="modal fade" id="changeStatusModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Change Status</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <input type="hidden" id="changeStatusId">
            <label class="form-label">Select new status</label>
            <select class="form-select" id="changeStatusSelect">
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="no-show">No Show</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="changeStatusSave">Save</button>
          </div>
        </div>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
    document.getElementById('changeStatusSave').addEventListener('click', async () => {
        const id = document.getElementById('changeStatusId').value;
        const val = document.getElementById('changeStatusSelect').value;
        await updateAppointmentStatus(id, val);
        const modalEl = document.getElementById('changeStatusModal');
        if (bootstrap && bootstrap.Modal) {
            const inst = bootstrap.Modal.getOrCreateInstance(modalEl);
            inst.hide();
        } else {
            modalEl.classList.remove('show');
            modalEl.style.display = 'none';
        }
    });
}

function openChangeStatus(id, current) {
    ensureChangeStatusModal();
    document.getElementById('changeStatusId').value = id;
    const sel = document.getElementById('changeStatusSelect');
    if (current) sel.value = current.toLowerCase();
    const modalEl = document.getElementById('changeStatusModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

async function loadTodaySchedule() {
    try {
        console.log('Loading today\'s schedule...');
        showTableLoading('upcomingAppointmentsTableBody', 'Loading today\'s schedule...');
        const response = await fetch(`${API_BASE_URL}/vet/appointments/today`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (!response.ok) throw new Error('Failed to load today\'s schedule');

        const data = await response.json();
        console.log('Today\'s schedule data:', data);

        // Handle both array and object responses
        const appointments = Array.isArray(data) ? data : (data.appointments || []);
        renderTodaySchedule(appointments);
    } catch (error) {
        console.error('Error loading today\'s schedule:', error);
        // Show error in the table
        const tbody = document.getElementById('upcomingAppointmentsTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading appointments</td></tr>';
        }
    }
}

function renderTodaySchedule(appointments) {
    console.log('Rendering today\'s schedule with:', appointments);
    const tbody = document.getElementById('upcomingAppointmentsTableBody');

    if (!tbody) {
        console.error('Upcoming appointments table body not found!');
        return;
    }

    tbody.innerHTML = '';

    if (!appointments.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No appointments scheduled for today.</td></tr>';
        return;
    }

    appointments.forEach(appointment => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(appointment.appointment_date)}</td>
            <td>${appointment.appointment_time || 'N/A'}</td>
            <td>${appointment.client_name}</td>
            <td>
                ${appointment.pet_name || 'N/A'}
                <div class="small text-muted">${formatPetAge(appointment.pet_age)}</div>
            </td>
            <td>${appointment.service_name || 'N/A'}</td>
            <td><span class="badge bg-${getStatusColor(appointment.status)}">${appointment.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

// Patients Management


// Medical Records Management
async function loadMedicalRecords(search = '') {
    try {
        showTableLoading('medicalRecordsTableBody', 'Loading medical records...');
        
        let url = `${API_BASE_URL}/vet/medical-records`;
        if (search) {
            url += `?search=${encodeURIComponent(search)}`;
        }
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (!response.ok) throw new Error('Failed to load medical records');

        const data = await response.json();
        renderMedicalRecordsTable(data.data || []);
    } catch (error) {
        showError('Error loading medical records');
        console.error(error);
        showTableLoading('medicalRecordsTableBody', 'Error loading medical records');
    }
}

function truncateText(text, max = 60) {
    if (!text) return '';
    return text.length > max ? text.substring(0, max) + '…' : text;
}

function renderMedicalRecordsTable(records) {
    const tbody = document.getElementById('medicalRecordsTableBody');
    tbody.innerHTML = '';

    if (!records.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No medical records found.</td></tr>';
        return;
    }

    records.forEach(record => {
        const diagShort = truncateText(record.diagnosis);
        const treatShort = truncateText(record.treatment);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="white-space:nowrap">${formatDate(record.record_date)}</td>
            <td>${record.patient_name}</td>
            <td>${record.owner_name}</td>
            <td title="${(record.diagnosis || '').replace(/"/g, '&quot;')}">${diagShort}</td>
            <td title="${(record.treatment || '').replace(/"/g, '&quot;')}">${treatShort}</td>
            <td>${record.vet_name || 'N/A'}</td>
            <td style="white-space:nowrap">
                <button class="btn btn-sm btn-info me-1" onclick="viewMedicalRecordDetails(${record.id})" title="View">
                    <i class='bx bx-show'></i>
                </button>
                <button class="btn btn-sm btn-primary me-1" onclick="editMedicalRecord(${record.id})" title="Edit">
                    <i class='bx bx-edit'></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteMedicalRecord(${record.id})" title="Delete">
                    <i class='bx bx-trash'></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.viewMedicalRecordDetails = async function(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/vet/medical-records/${id}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await response.json();
        const r = data.data;
        if (!r) return;

        let modal = document.getElementById('medicalRecordViewModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'medicalRecordViewModal';
            modal.className = 'modal fade';
            modal.tabIndex = -1;
            modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Medical Record</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="medicalRecordViewBody"></div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>`;
            document.body.appendChild(modal);
        }

        document.getElementById('medicalRecordViewBody').innerHTML = `
            <div class="row mb-3">
                <div class="col-md-6"><strong>Date:</strong> ${formatDate(r.record_date)}</div>
                <div class="col-md-6"><strong>Vet:</strong> ${r.vet_name || 'N/A'}</div>
            </div>
            <div class="row mb-3">
                <div class="col-md-6"><strong>Patient:</strong> ${r.patient_name}</div>
                <div class="col-md-6"><strong>Owner:</strong> ${r.owner_name}</div>
            </div>
            <div class="row mb-3">
                <div class="col-md-4"><strong>Species:</strong> ${r.pet_species || 'N/A'}</div>
                <div class="col-md-4"><strong>Breed:</strong> ${r.pet_breed || 'N/A'}</div>
                <div class="col-md-4"><strong>Age:</strong> ${formatPetAge(r.pet_age) || 'N/A'}</div>
            </div>
            <hr>
            <div class="mb-3"><strong>Diagnosis:</strong><p class="mt-1">${r.diagnosis || 'N/A'}</p></div>
            <div class="mb-3"><strong>Treatment:</strong><p class="mt-1">${r.treatment || 'N/A'}</p></div>
            ${r.prescription ? `<div class="mb-3"><strong>Prescription:</strong><p class="mt-1">${r.prescription}</p></div>` : ''}
            ${r.notes ? `<div class="mb-3"><strong>Notes:</strong><p class="mt-1">${r.notes}</p></div>` : ''}
        `;
        new bootstrap.Modal(modal).show();
    } catch (error) {
        showError('Error loading medical record');
        console.error(error);
    }
};

// Show add medical record modal
async function showAddMedicalRecordModal() {
    const modal = document.getElementById('medicalRecordModal');
    if (modal) {
        // Reset form
        document.getElementById('medicalRecordForm').reset();
        document.getElementById('recordId').value = '';
        document.getElementById('medicalRecordModalLabel').textContent = 'Add Medical Record';

        // Set today's date as default
        document.getElementById('recordDate').value = new Date().toISOString().split('T')[0];

        // Clear patient search for fresh add
        const searchEl = document.getElementById('recordPatientSearch');
        if (searchEl) searchEl.value = '';
        const hiddenEl = document.getElementById('recordPatient');
        if (hiddenEl) hiddenEl.value = '';

        // Load patients for autocomplete
        await loadPatientsDropdown();

        // Show modal
        modal.style.display = 'block';
        modal.style.zIndex = '1055';
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.classList.add('show', 'd-block');

        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        backdrop.style.zIndex = '1054';
        backdrop.style.position = 'fixed';
        backdrop.style.top = '0';
        backdrop.style.left = '0';
        backdrop.style.width = '100vw';
        backdrop.style.height = '100vh';
        backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        document.body.appendChild(backdrop);

        // Add click handler to backdrop
        backdrop.addEventListener('click', () => {
            hideModal('medicalRecordModal');
        });
    }
}

// Show edit medical record modal
async function showEditMedicalRecordModal(id) {
    const modal = document.getElementById('medicalRecordModal');
    if (modal) {
        try {
            // Fetch record data
            const response = await fetch(`${API_BASE_URL}/vet/medical-records/${id}`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            
            const data = await response.json();
            
            if (data.data) {
                // Load patients dropdown first
                await loadPatientsDropdown();
                
                // Fill the form with record data
                fillMedicalRecordForm(data.data);
                document.getElementById('medicalRecordModalLabel').textContent = 'Edit Medical Record';

                // Show modal
                modal.style.display = 'block';
                modal.style.zIndex = '1055';
                modal.style.position = 'fixed';
                modal.style.top = '50%';
                modal.style.left = '50%';
                modal.style.transform = 'translate(-50%, -50%)';
                modal.classList.add('show', 'd-block');

                // Create backdrop
                const backdrop = document.createElement('div');
                backdrop.className = 'modal-backdrop fade show';
                backdrop.style.zIndex = '1054';
                backdrop.style.position = 'fixed';
                backdrop.style.top = '0';
                backdrop.style.left = '0';
                backdrop.style.width = '100vw';
                backdrop.style.height = '100vh';
                backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                document.body.appendChild(backdrop);

                // Add click handler to backdrop
                backdrop.addEventListener('click', () => {
                    hideModal('medicalRecordModal');
                });
            }
        } catch (error) {
            showError('Error loading medical record');
            console.error(error);
        }
    }
}

let patientsData = [];

// Load patients for search autocomplete
async function loadPatientsDropdown() {
    const searchInput = document.getElementById('recordPatientSearch');
    if (!searchInput) return;

    searchInput.placeholder = 'Loading patients...';
    searchInput.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/vet/patients`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        if (!response.ok) throw new Error('Failed to load patients');

        patientsData = await response.json();
        searchInput.placeholder = 'Type to search patient...';
        searchInput.disabled = false;
    } catch (error) {
        console.error('Error loading patients:', error);
        searchInput.placeholder = 'Failed to load patients';
        searchInput.disabled = false;
    }
}

// Filter and display matching patients
function filterPatients(query) {
    const results = document.getElementById('patientSearchResults');
    if (!query.trim()) {
        results.classList.remove('show');
        return;
    }

    const q = query.toLowerCase();
    const matches = patientsData.filter(p =>
        p.pet_name.toLowerCase().includes(q) ||
        p.client_name.toLowerCase().includes(q)
    );

    if (!matches.length) {
        results.innerHTML = '<div class="patient-no-results">No patients found</div>';
    } else {
        results.innerHTML = matches.map((p, i) =>
            `<div class="patient-search-item" data-index="${i}">
                <div class="pet-name">${p.pet_name}</div>
                <div class="owner-name">${p.client_name}</div>
            </div>`
        ).join('');

        results.querySelectorAll('.patient-search-item').forEach((item, i) => {
            item.addEventListener('mousedown', (e) => {
                e.preventDefault();
                handlePatientSelection(matches[i]);
            });
        });
    }

    results.classList.add('show');
}

// Handle patient selection to auto-fill details
function handlePatientSelection(patient) {
    if (patient) {
        document.getElementById('recordPatientSearch').value = `${patient.pet_name} (${patient.client_name})`;
        document.getElementById('recordPatient').value = patient.pet_name;
        document.getElementById('ownerName').value = patient.client_name || '';
        document.getElementById('ownerPhone').value = patient.client_phone || '';
        document.getElementById('petSpecies').value = patient.pet_type || '';
        document.getElementById('petBreed').value = patient.pet_breed || '';
        setAgeInputs(parseFloat(patient.pet_age) || 0);
    } else {
        document.getElementById('recordPatient').value = '';
        document.getElementById('ownerName').value = '';
        document.getElementById('ownerPhone').value = '';
        document.getElementById('petSpecies').value = '';
        document.getElementById('petBreed').value = '';
        setAgeInputs(0);
    }
    document.getElementById('patientSearchResults').classList.remove('show');
}

// Fill medical record form with data
function fillMedicalRecordForm(record) {
    document.getElementById('recordId').value = record.id;
    
    // Pre-fill patient search with full display text after patients load
    setTimeout(() => {
        document.getElementById('recordPatient').value = record.patient_name;
        const match = patientsData.find(p => p.pet_name === record.patient_name);
        document.getElementById('recordPatientSearch').value = match
            ? `${match.pet_name} (${match.client_name})`
            : record.patient_name;
    }, 100);
    
    document.getElementById('ownerName').value = record.owner_name;
    document.getElementById('ownerPhone').value = record.owner_phone || '';
    document.getElementById('petSpecies').value = record.pet_species;
    document.getElementById('petBreed').value = record.pet_breed || '';
    setAgeInputs(parseFloat(record.pet_age) || 0);
    document.getElementById('recordDate').value = record.record_date;
    document.getElementById('recordDiagnosis').value = record.diagnosis;
    document.getElementById('recordTreatment').value = record.treatment;
    document.getElementById('recordPrescription').value = record.prescription || '';
    document.getElementById('recordNotes').value = record.notes || '';
}

// Edit medical record function (global)
window.editMedicalRecord = function(id) {
    showEditMedicalRecordModal(id);
};

// Delete medical record function (global)
window.deleteMedicalRecord = function(id) {
    if (confirm('Are you sure you want to delete this medical record?')) {
        fetch(`${API_BASE_URL}/vet/medical-records/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    showSuccess('Medical record deleted successfully');
                    loadMedicalRecords();
                }
            })
            .catch(error => {
                showError('Error deleting medical record');
                console.error(error);
            });
    }
};

// Inventory Management (Full functionality like admin)
async function loadInventory(search = '') {
    try {
        showTableLoading('inventoryTableBody', 'Loading inventory...');
        
        // Build URL with search parameter if provided
        let url = `${API_BASE_URL}/vet/inventory`;
        if (search.trim()) {
            url += `?search=${encodeURIComponent(search.trim())}`;
        }
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (!response.ok) throw new Error('Failed to load inventory');

        const data = await response.json();
        console.log('Inventory data received:', data);
        console.log('Inventory data type:', typeof data);
        console.log('Inventory data.data:', data.data);
        console.log('Is data.data an array?', Array.isArray(data.data));

        renderInventoryTable(data.data || []);
    } catch (error) {
        showError('Error loading inventory');
        console.error(error);
        showTableLoading('inventoryTableBody', 'Error loading inventory');
    }
}

function renderInventoryTable(items) {
    const tbody = document.getElementById('inventoryTableBody');
    tbody.innerHTML = '';

    // Ensure items is an array
    if (!Array.isArray(items)) {
        console.error('Items is not an array:', items);
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Error loading inventory data.</td></tr>';
        return;
    }

    // Calculate statistics
    const totalItems = items.length;
    const inStockItems = items.filter(item => Number(item.quantity) > 0).length;
    const lowStockItems = items.filter(item => Number(item.quantity) <= Number(item.reorder_level)).length;
    const totalValue = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_price)), 0);

    // Update statistics cards
    document.getElementById('totalInventoryItems').textContent = totalItems;
    document.getElementById('inStockItems').textContent = inStockItems;
    document.getElementById('lowStockItems').textContent = lowStockItems;
    document.getElementById('totalInventoryValue').textContent = formatCurrency(totalValue);

    if (!items.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No inventory items found.</td></tr>';
        return;
    }

    items.forEach(item => {
        const lowStock = Number(item.quantity) <= Number(item.reorder_level);
        const outOfStock = Number(item.quantity) === 0;
        const tr = document.createElement('tr');

        if (outOfStock) {
            tr.classList.add('table-danger');
        } else if (lowStock) {
            tr.classList.add('table-warning');
        }

        // Determine status
        let status = '';
        if (outOfStock) {
            status = '<span class="badge bg-danger">Out of Stock</span>';
        } else if (lowStock) {
            status = '<span class="badge bg-warning">Low Stock</span>';
        } else {
            status = '<span class="badge bg-success">In Stock</span>';
        }

        tr.innerHTML = `
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.quantity}</td>
            <td>${formatCurrency(item.unit_price)}</td>
            <td>${item.reorder_level}</td>
            <td>${status}</td>
            <td>
                <button class="btn btn-sm btn-warning me-1" onclick="editInventoryItem(${item.id})" title="Edit">
                    <i class='bx bx-edit'></i>
                </button>
                <button class="btn btn-sm btn-info me-1" onclick="reorderInventoryItem(${item.id})" title="Reorder">
                    <i class='bx bx-plus'></i>
                </button>
                <button class="btn btn-sm btn-secondary me-1" onclick="useInventoryItem(${item.id})" title="Use Item">
                    <i class='bx bx-package'></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteInventoryItem(${item.id})" title="Delete">
                    <i class='bx bx-trash'></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}





// Form initializations

function initializeMedicalRecordForm() {
    const medicalRecordForm = document.getElementById('medicalRecordForm');
    if (medicalRecordForm) {
        // Wire up patient search autocomplete
        const patientSearch = document.getElementById('recordPatientSearch');
        if (patientSearch) {
            patientSearch.addEventListener('input', () => filterPatients(patientSearch.value));
            patientSearch.addEventListener('focus', () => {
                if (patientSearch.value.trim()) filterPatients(patientSearch.value);
            });
            patientSearch.addEventListener('blur', () => {
                setTimeout(() => {
                    document.getElementById('patientSearchResults').classList.remove('show');
                }, 150);
            });
        }

        medicalRecordForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const recordId = document.getElementById('recordId').value;
            const isEdit = recordId !== '';

            const payload = {
                patient_name: document.getElementById('recordPatient').value,
                owner_name: document.getElementById('ownerName').value,
                owner_phone: document.getElementById('ownerPhone').value,
                pet_species: document.getElementById('petSpecies').value,
                pet_breed: document.getElementById('petBreed').value,
                pet_age: getAgeFromInputs(),
                diagnosis: document.getElementById('recordDiagnosis').value,
                treatment: document.getElementById('recordTreatment').value,
                prescription: document.getElementById('recordPrescription').value,
                notes: document.getElementById('recordNotes').value,
                record_date: document.getElementById('recordDate').value
            };

            try {
                showLoading(200); // Show loading for form submissions
                const url = isEdit ?
                    `${API_BASE_URL}/vet/medical-records/${recordId}` :
                    `${API_BASE_URL}/vet/medical-records`;
                
                const method = isEdit ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error('Failed to save medical record');

                const data = await response.json();
                showSuccess(data.message || 'Medical record saved successfully');
                
                // Hide modal and reload data
                hideModal('medicalRecordModal');
                medicalRecordForm.reset();
                loadMedicalRecords();
                
            } catch (error) {
                showError('Error saving medical record');
                console.error(error);
            } finally {
                hideLoading();
            }
        });
    }
}



// Inventory Modal Functions
function showAddInventoryModal() {
    console.log('Showing add inventory modal');
    const modal = document.getElementById('addInventoryModal');
    if (modal) {
        modal.style.display = 'block';
        modal.style.zIndex = '1055';
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.classList.add('show', 'd-block');

        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        backdrop.style.zIndex = '1054';
        backdrop.style.position = 'fixed';
        backdrop.style.top = '0';
        backdrop.style.left = '0';
        backdrop.style.width = '100vw';
        backdrop.style.height = '100vh';
        backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        document.body.appendChild(backdrop);

        // Add click handler to backdrop
        backdrop.addEventListener('click', () => {
            hideModal('addInventoryModal');
        });
    }
}

function showEditInventoryModal(id) {
    console.log('Showing edit inventory modal for ID:', id);
    // Load item data and populate form
    showSuccess('Edit modal opened for item ID: ' + id);

    const modal = document.getElementById('editInventoryModal');
    if (modal) {
        modal.style.display = 'block';
        modal.style.zIndex = '1055';
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.classList.add('show', 'd-block');

        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        backdrop.style.zIndex = '1054';
        backdrop.style.position = 'fixed';
        backdrop.style.top = '0';
        backdrop.style.left = '0';
        backdrop.style.width = '100vw';
        backdrop.style.height = '100vh';
        backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        document.body.appendChild(backdrop);

        // Add click handler to backdrop
        backdrop.addEventListener('click', () => {
            hideModal('editInventoryModal');
        });
    }
}

function showReorderInventoryModal(id) {
    console.log('Showing reorder inventory modal for ID:', id);
    document.getElementById('reorderInventoryId').value = id;

    const modal = document.getElementById('reorderInventoryModal');
    if (modal) {
        modal.style.display = 'block';
        modal.style.zIndex = '1055';
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.classList.add('show', 'd-block');

        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        backdrop.style.zIndex = '1054';
        backdrop.style.position = 'fixed';
        backdrop.style.top = '0';
        backdrop.style.left = '0';
        backdrop.style.width = '100vw';
        backdrop.style.height = '100vh';
        backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        document.body.appendChild(backdrop);

        // Add click handler to backdrop
        backdrop.addEventListener('click', () => {
            hideModal('reorderInventoryModal');
        });
    }
}

function showUseInventoryModal(id) {
    console.log('Showing use inventory modal for ID:', id);
    document.getElementById('useInventoryId').value = id;

    const modal = document.getElementById('useInventoryModal');
    if (modal) {
        modal.style.display = 'block';
        modal.style.zIndex = '1055';
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.classList.add('show', 'd-block');

        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        backdrop.style.zIndex = '1054';
        backdrop.style.position = 'fixed';
        backdrop.style.top = '0';
        backdrop.style.left = '0';
        backdrop.style.width = '100vw';
        backdrop.style.height = '100vh';
        backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        document.body.appendChild(backdrop);

        // Add click handler to backdrop
        backdrop.addEventListener('click', () => {
            hideModal('useInventoryModal');
        });
    }
}

function hideModal(modalId) {
    console.log('Hiding modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show', 'd-block');
    }
    cleanupModalBackdrops();
}

function cleanupModalBackdrops() {
    console.log('Cleaning up modal backdrops');
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());

    // Reset body styles
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.body.classList.remove('modal-open');

    // Hide any visible modals
    const visibleModals = document.querySelectorAll('.modal.show');
    visibleModals.forEach(modal => {
        modal.style.display = 'none';
        modal.classList.remove('show', 'd-block');
    });
}

function initializeInventoryForms() {
    console.log('Initializing inventory forms...');

    // Add Inventory Form
    const inventoryForm = document.getElementById('inventoryForm');
    if (inventoryForm) {
        console.log('Inventory form found:', inventoryForm);
        inventoryForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Inventory form submitted - EVENT TRIGGERED!');

            const formData = {
                name: document.getElementById('inventoryName').value,
                category: document.getElementById('inventoryCategory').value,
                quantity: document.getElementById('inventoryQuantity').value,
                unit_price: document.getElementById('inventoryUnitPrice').value,
                reorder_level: document.getElementById('inventoryReorderLevel').value,
                description: document.getElementById('inventoryDescription').value
            };

            console.log('Inventory payload:', formData);

            try {
                showLoading(200); // Show loading for form submissions
                const response = await fetch(`${API_BASE_URL}/vet/inventory`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: JSON.stringify(formData)
                });

                console.log('Inventory response status:', response.status);

                if (response.ok) {
                    const result = await response.json();
                    console.log('Inventory success result:', result);
                    showSuccess('Inventory item added successfully!');
                    hideModal('addInventoryModal');
                    inventoryForm.reset();
                    loadInventory();
                } else {
                    throw new Error('Failed to add inventory item');
                }
            } catch (error) {
                console.error('Error in inventory form submission:', error);
                showError('Error adding inventory item');
            } finally {
                hideLoading();
            }
        });
        console.log('Inventory form event listener attached');
    }

    // Reorder Inventory Form
    const reorderInventoryForm = document.getElementById('reorderInventoryForm');
    if (reorderInventoryForm) {
        console.log('Reorder inventory form found:', reorderInventoryForm);
        reorderInventoryForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Reorder form submitted - EVENT TRIGGERED!');

            const formData = {
                quantity: document.getElementById('reorderQuantity').value,
                notes: document.getElementById('reorderNotes').value
            };

            console.log('Reorder payload:', formData);

            try {
                const itemId = document.getElementById('reorderInventoryId').value;
                const response = await fetch(`${API_BASE_URL}/vet/inventory/${itemId}/reorder`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: JSON.stringify(formData)
                });

                console.log('Reorder response status:', response.status);

                if (response.ok) {
                    const result = await response.json();
                    console.log('Reorder success result:', result);
                    showSuccess('Stock added successfully!');
                    hideModal('reorderInventoryModal');
                    reorderInventoryForm.reset();
                    loadInventory();
                } else {
                    throw new Error('Failed to add stock');
                }
            } catch (error) {
                console.error('Error in reorder form submission:', error);
                showError('Error adding stock');
            }
        });
        console.log('Reorder inventory form event listener attached');
    }

    // Edit Inventory Form
    const editInventoryForm = document.getElementById('editInventoryForm');
    if (editInventoryForm) {
        console.log('Edit inventory form found:', editInventoryForm);
        editInventoryForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Edit inventory form submitted - EVENT TRIGGERED!');

            const formData = {
                name: document.getElementById('editInventoryName').value,
                category: document.getElementById('editInventoryCategory').value,
                quantity: document.getElementById('editInventoryQuantity').value,
                unit_price: document.getElementById('editInventoryUnitPrice').value,
                reorder_level: document.getElementById('editInventoryReorderLevel').value,
                description: document.getElementById('editInventoryDescription').value
            };

            console.log('Edit inventory payload:', formData);

            try {
                const itemId = document.getElementById('editInventoryId').value;
                const response = await fetch(`${API_BASE_URL}/vet/inventory/${itemId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: JSON.stringify(formData)
                });

                console.log('Edit inventory response status:', response.status);

                if (response.ok) {
                    const result = await response.json();
                    console.log('Edit inventory success result:', result);
                    showSuccess('Inventory item updated successfully!');
                    hideModal('editInventoryModal');
                    editInventoryForm.reset();
                    loadInventory();
                } else {
                    throw new Error('Failed to update inventory item');
                }
            } catch (error) {
                console.error('Error in edit inventory form submission:', error);
                showError('Error updating inventory item');
            }
        });
        console.log('Edit inventory form event listener attached');
    }

    // Use Inventory Form
    const useInventoryForm = document.getElementById('useInventoryForm');
    if (useInventoryForm) {
        console.log('Use inventory form found:', useInventoryForm);
        useInventoryForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Use inventory form submitted - EVENT TRIGGERED!');

            const formData = {
                quantity: document.getElementById('useQuantity').value,
                notes: document.getElementById('useNotes').value
            };

            console.log('Use inventory payload:', formData);

            try {
                const itemId = document.getElementById('useInventoryId').value;
                const response = await fetch(`${API_BASE_URL}/vet/inventory/${itemId}/use`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: JSON.stringify(formData)
                });

                console.log('Use inventory response status:', response.status);

                if (response.ok) {
                    const result = await response.json();
                    console.log('Use inventory success result:', result);
                    showSuccess('Stock used successfully!');
                    hideModal('useInventoryModal');
                    useInventoryForm.reset();
                    loadInventory();
                } else {
                    throw new Error('Failed to use stock');
                }
            } catch (error) {
                console.error('Error in use inventory form submission:', error);
                showError('Error using stock');
            }
        });
        console.log('Use inventory form event listener attached');
    }
}

function initializeAddInventoryButton() {
    console.log('Initializing add inventory button...');
    const addInventoryBtn = document.getElementById('addInventoryBtn');
    if (addInventoryBtn) {
        console.log('Add inventory button found:', addInventoryBtn);
        addInventoryBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Add inventory button clicked!');
            showAddInventoryModal();
        });
        console.log('Add inventory button event listener attached');
    }
    
    // Initialize inventory search
    const inventorySearch = document.getElementById('inventorySearch');
    if (inventorySearch) {
        console.log('Inventory search input found:', inventorySearch);
        inventorySearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.trim();
            console.log('Inventory search term:', searchTerm);
            loadInventory(searchTerm);
        });
        console.log('Inventory search event listener attached');
    }
}

function initializeInventoryCancelButtons() {
    console.log('Initializing inventory cancel buttons...');

    // Add Inventory Modal Cancel Button
    const addInventoryCancelBtn = document.querySelector('#addInventoryModal .btn-secondary');
    if (addInventoryCancelBtn) {
        addInventoryCancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Add inventory cancel button clicked!');
            hideModal('addInventoryModal');
            document.getElementById('inventoryForm').reset();
        });
    }

    // Edit Inventory Modal Cancel Button
    const editInventoryCancelBtn = document.querySelector('#editInventoryModal .btn-secondary');
    if (editInventoryCancelBtn) {
        editInventoryCancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Edit inventory cancel button clicked!');
            hideModal('editInventoryModal');
            document.getElementById('editInventoryForm').reset();
        });
    }

    // Reorder Inventory Modal Cancel Button
    const reorderInventoryCancelBtn = document.querySelector('#reorderInventoryModal .btn-secondary');
    if (reorderInventoryCancelBtn) {
        reorderInventoryCancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Reorder inventory cancel button clicked!');
            hideModal('reorderInventoryModal');
            document.getElementById('reorderInventoryForm').reset();
        });
    }

    // Use Inventory Modal Cancel Button
    const useInventoryCancelBtn = document.querySelector('#useInventoryModal .btn-secondary');
    if (useInventoryCancelBtn) {
        useInventoryCancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Use inventory cancel button clicked!');
            hideModal('useInventoryModal');
            document.getElementById('useInventoryForm').reset();
        });
    }

    console.log('Inventory cancel buttons initialized');
}

// Appointment Modal Functions
async function showAddAppointmentModal() {
    console.log('Showing add appointment modal');
    
    // Reset form
    document.getElementById('appointmentForm').reset();
    document.getElementById('appointmentId').value = '';
    document.getElementById('appointmentModalLabel').textContent = 'Add Appointment';
    
    // Load services dropdown
    await loadServicesDropdown();
    
    // Show the modal using Bootstrap
    const modal = new bootstrap.Modal(document.getElementById('appointmentModal'));
    modal.show();
}

async function loadServicesDropdown() {
    const select = document.getElementById('serviceId');
    if (!select) return;
    
    select.innerHTML = '<option value="">Loading...</option>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/vet/services`, {
            headers: { 
                'Authorization': `Bearer ${getToken()}` 
            }
        });
        
        if (!response.ok) throw new Error('Failed to load services');
        
        const services = await response.json();
        select.innerHTML = '<option value="">Select Service</option>' +
            services.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    } catch (error) {
        console.error('Error loading services:', error);
        select.innerHTML = '<option value="">Failed to load services</option>';
    }
}

function showEditAppointmentModal(id) {
    console.log('Showing edit appointment modal for ID:', id);
    // Load appointment data and populate form
    showSuccess('Edit modal opened for appointment ID: ' + id);

    const modal = document.getElementById('editAppointmentModal');
    if (modal) {
        modal.style.display = 'block';
        modal.style.zIndex = '1055';
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.classList.add('show', 'd-block');

        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        backdrop.style.zIndex = '1054';
        backdrop.style.position = 'fixed';
        backdrop.style.top = '0';
        backdrop.style.left = '0';
        backdrop.style.width = '100vw';
        backdrop.style.height = '100vh';
        backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        document.body.appendChild(backdrop);

        // Add click handler to backdrop
        backdrop.addEventListener('click', () => {
            hideModal('editAppointmentModal');
        });
    }
}

function initializeAppointmentForms() {
    console.log('Initializing appointment forms...');

    // Add Appointment Form
    const appointmentForm = document.getElementById('appointmentForm');
    if (appointmentForm) {
        console.log('Appointment form found:', appointmentForm);
        appointmentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Appointment form submitted - EVENT TRIGGERED!');

            const formData = {
                client_name: document.getElementById('clientName').value,
                client_email: document.getElementById('clientEmail').value,
                client_phone: document.getElementById('clientPhone').value,
                pet_name: document.getElementById('petName').value,
                pet_type: document.getElementById('petType').value,
                pet_breed: document.getElementById('petBreed').value,
                service_id: document.getElementById('serviceId').value,
                appointment_date: document.getElementById('appointmentDate').value,
                appointment_time: document.getElementById('appointmentTime').value,
                status: document.getElementById('status').value,
                price: document.getElementById('price').value,
                payment_status: document.getElementById('paymentStatus').value,
                notes: document.getElementById('notes').value
            };

            console.log('Appointment payload:', formData);

            try {
                showLoading(200); // Show loading for form submissions
                const response = await fetch(`${API_BASE_URL}/vet/appointments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: JSON.stringify(formData)
                });

                console.log('Appointment response status:', response.status);

                if (response.ok) {
                    const result = await response.json();
                    console.log('Appointment success result:', result);
                    showSuccess('Appointment added successfully!');
                    const modal = bootstrap.Modal.getInstance(document.getElementById('appointmentModal'));
                    modal.hide();
                    appointmentForm.reset();
                    loadFilteredAppointments();
                } else {
                    throw new Error('Failed to add appointment');
                }
            } catch (error) {
                console.error('Error in appointment form submission:', error);
                showError('Error adding appointment');
            } finally {
                hideLoading();
            }
        });
        console.log('Appointment form event listener attached');
    }

    // Edit Appointment Form
    const editAppointmentForm = document.getElementById('editAppointmentForm');
    if (editAppointmentForm) {
        console.log('Edit appointment form found:', editAppointmentForm);
        editAppointmentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Edit appointment form submitted - EVENT TRIGGERED!');

            const formData = {
                client_name: document.getElementById('editAppointmentClientName').value,
                pet_name: document.getElementById('editAppointmentPetName').value,
                appointment_date: document.getElementById('editAppointmentDate').value,
                appointment_time: document.getElementById('editAppointmentTime').value,
                service_name: document.getElementById('editAppointmentService').value,
                status: document.getElementById('editAppointmentStatus').value,
                notes: document.getElementById('editAppointmentNotes').value
            };

            console.log('Edit appointment payload:', formData);

            try {
                const appointmentId = document.getElementById('editAppointmentId').value;
                const response = await fetch(`${API_BASE_URL}/vet/appointments/${appointmentId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: JSON.stringify(formData)
                });

                console.log('Edit appointment response status:', response.status);

                if (response.ok) {
                    const result = await response.json();
                    console.log('Edit appointment success result:', result);
                    showSuccess('Appointment updated successfully!');
                    hideModal('editAppointmentModal');
                    editAppointmentForm.reset();
                    loadAppointments();
                } else {
                    throw new Error('Failed to update appointment');
                }
            } catch (error) {
                console.error('Error in edit appointment form submission:', error);
                showError('Error updating appointment');
            }
        });
        console.log('Edit appointment form event listener attached');
    }
}

function initializeAddAppointmentButton() {
    console.log('Initializing add appointment button...');
    const addAppointmentBtn = document.getElementById('addAppointmentBtn');
    if (addAppointmentBtn) {
        console.log('Add appointment button found:', addAppointmentBtn);
        addAppointmentBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            console.log('Add appointment button clicked!');
            await showAddAppointmentModal();
        });
        console.log('Add appointment button event listener attached');
    }
}

function initializeAppointmentCancelButtons() {
    console.log('Initializing appointment cancel buttons...');

    // Appointment Modal Cancel Button
    const appointmentCancelBtn = document.querySelector('#appointmentModal .btn-secondary');
    if (appointmentCancelBtn) {
        appointmentCancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Appointment cancel button clicked!');
            document.getElementById('appointmentForm').reset();
        });
    }

    console.log('Appointment cancel buttons initialized');
}

// Action functions
window.viewNotesModal = function(appointment) {
    console.log('View notes for appointment:', appointment);
    
    // Populate the view notes modal with appointment data
    document.getElementById('viewClientName').textContent = appointment.client_name || 'N/A';
    document.getElementById('viewClientEmail').textContent = appointment.client_email || 'N/A';
    document.getElementById('viewClientPhone').textContent = appointment.client_phone || 'N/A';
    document.getElementById('viewPetName').textContent = appointment.pet_name || 'N/A';
    document.getElementById('viewPetType').textContent = appointment.pet_type || 'N/A';
    document.getElementById('viewPetBreed').textContent = appointment.pet_breed || 'N/A';
    document.getElementById('viewAppointmentDate').textContent = formatDate(appointment.appointment_date);
    document.getElementById('viewAppointmentTime').textContent = appointment.appointment_time || 'N/A';
    document.getElementById('viewService').textContent = appointment.service_name || 'N/A';
    document.getElementById('viewStatus').textContent = appointment.status || 'N/A';
    document.getElementById('viewPrice').textContent = appointment.price || 'N/A';
    document.getElementById('viewPaymentStatus').textContent = appointment.payment_status || 'N/A';
    document.getElementById('viewNotes').textContent = appointment.notes || 'No notes available';
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('viewNotesModal'));
    modal.show();
};

window.rescheduleAppointment = function(appointment) {
    console.log('Reschedule appointment:', appointment);
    
    // Populate the reschedule modal
    document.getElementById('rescheduleAppointmentId').value = appointment.id;
    document.getElementById('rescheduleDate').value = appointment.appointment_date;
    document.getElementById('rescheduleTime').value = appointment.appointment_time;
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('rescheduleModal'));
    modal.show();
};

window.deleteAppointment = function(id) {
    console.log('Delete appointment:', id);
    
    // Store the appointment ID for deletion
    window.appointmentToDelete = id;
    
    // Show the confirmation modal
    const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    modal.show();
};

window.completeAppointment = function(id) {
    console.log('Complete appointment:', id);
    
    if (confirm('Are you sure you want to mark this appointment as completed?')) {
        completeAppointmentStatus(id);
    }
};

async function completeAppointmentStatus(id) {
    try {
        showLoading(200);
        
        const response = await fetch(`${API_BASE_URL}/vet/appointments/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                status: 'completed'
            })
        });

        if (response.ok) {
            showSuccess('Appointment marked as completed successfully!');
            loadFilteredAppointments(); // Reload the appointments table
        } else {
            throw new Error('Failed to complete appointment');
        }
    } catch (error) {
        console.error('Error completing appointment:', error);
        showError('Failed to complete appointment');
    } finally {
        hideLoading();
    }
}

window.viewAppointment = function(id) {
    console.log('View appointment:', id);
    showViewNotesModal(id);
};

window.editAppointment = function(id) {
    console.log('Edit appointment:', id);
    showEditAppointmentModal(id);
};

window.updatePayment = function(id) {
    console.log('Update payment for appointment:', id);
    showPaymentModal(id);
};

window.startAppointment = function(id) {
    console.log('Start appointment:', id);
    showSuccess('Starting appointment...');
};



window.viewMedicalRecord = function(id) {
    viewMedicalRecordDetails(id);
};

window.editInventoryItem = function(id) {
    console.log('Edit inventory item:', id);
    showEditInventoryModal(id);
};

window.reorderInventoryItem = function(id) {
    console.log('Reorder inventory item:', id);
    showReorderInventoryModal(id);
};

window.useInventoryItem = function(id) {
    console.log('Use inventory item:', id);
    showUseInventoryModal(id);
};

window.deleteInventoryItem = async function(id) {
    console.log('Delete inventory item:', id);
    if (!confirm('Are you sure you want to delete this inventory item?')) return;
    
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/vet/inventory/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete inventory item');
        }
        
        const result = await response.json();
        showSuccess(result.message || 'Inventory item deleted successfully!');
        await loadInventory();
    } catch (error) {
        showError('Error deleting inventory item: ' + error.message);
        console.error('Error deleting inventory item:', error);
    } finally {
        hideLoading();
    }
};

// Initialize add medical record button
function initializeAddMedicalRecordButton() {
    const addRecordBtn = document.getElementById('addRecordBtn');
    if (addRecordBtn) {
        addRecordBtn.addEventListener('click', () => {
            showAddMedicalRecordModal();
        });
    }
    
    // Initialize medical records search
    const recordSearch = document.getElementById('recordSearch');
    if (recordSearch) {
        recordSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.trim();
            loadMedicalRecords(searchTerm);
        });
    }
}

// Filter functionality
let currentFilter = 'all';
let currentSearch = '';
let currentStatusFilter = '';

// Initialize appointment filters
function initializeAppointmentFilters() {
    try {
        const allFilter = document.getElementById('allFilter');
        const todayFilter = document.getElementById('todayFilter');
        const weekFilter = document.getElementById('weekFilter');
        const monthFilter = document.getElementById('monthFilter');
        const appointmentSearch = document.getElementById('appointmentSearch');
        const statusFilter = document.getElementById('statusFilter');

        if (allFilter) {
            allFilter.addEventListener('click', () => {
                setActiveFilter('all');
                loadFilteredAppointments();
            });
        }

        if (todayFilter) {
            todayFilter.addEventListener('click', () => {
                setActiveFilter('today');
                loadFilteredAppointments();
            });
        }

        if (weekFilter) {
            weekFilter.addEventListener('click', () => {
                setActiveFilter('week');
                loadFilteredAppointments();
            });
        }

        if (monthFilter) {
            monthFilter.addEventListener('click', () => {
                setActiveFilter('month');
                loadFilteredAppointments();
            });
        }

        if (appointmentSearch) {
            appointmentSearch.addEventListener('input', (e) => {
                currentSearch = e.target.value;
                loadFilteredAppointments();
            });
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                currentStatusFilter = e.target.value;
                loadFilteredAppointments();
            });
        }
    } catch (error) {
        console.error('Error initializing appointment filters:', error);
    }
}

// Set active filter and update button styles
function setActiveFilter(filter) {
    currentFilter = filter;

    // Reset all filter buttons
    const filterButtons = ['allFilter', 'todayFilter', 'weekFilter', 'monthFilter'];
    filterButtons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.className = btn.className.replace('btn-primary', 'btn-outline-primary');
        }
    });

    // Set active button
    const activeButton = document.getElementById(filter + 'Filter');
    if (activeButton) {
        activeButton.className = activeButton.className.replace('btn-outline-primary', 'btn-primary');
    }
}

// Load filtered appointments
async function loadFilteredAppointments() {
    try {
        showTableLoading('appointmentsTableBody', 'Loading filtered appointments...');

        let url = `${API_BASE_URL}/vet/appointments`;
        const params = new URLSearchParams();

        // Add date filter - use the filter parameter that the backend expects
        if (currentFilter !== 'all') {
            params.append('filter', currentFilter);
        }

        // Add search filter
        if (currentSearch) {
            params.append('search', currentSearch);
        }

        // Add status filter
        if (currentStatusFilter) {
            params.append('status', currentStatusFilter);
        }

        if (params.toString()) {
            url += '?' + params.toString();
        }

        console.log('Fetching appointments with URL:', url);

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (!response.ok) throw new Error('Failed to load filtered appointments');

        const data = await response.json();
        console.log('Filtered appointments data received:', data);

        // Handle both array and object responses
        const appointments = Array.isArray(data) ? data : (data.appointments || []);
        renderAppointmentsTable(appointments);

    } catch (error) {
        console.error('Error loading filtered appointments:', error);
        showError('Failed to load filtered appointments');
        showTableLoading('appointmentsTableBody', 'Error loading filtered appointments');
    }
}

// Initialize medical record cancel buttons
function initializeMedicalRecordCancelButtons() {
    const cancelButtons = document.querySelectorAll('#medicalRecordModal .btn-secondary');
    cancelButtons.forEach(button => {
        button.addEventListener('click', () => {
            hideModal('medicalRecordModal');
            document.getElementById('medicalRecordForm').reset();
        });
    });
}

// Modal show functions (kept for backward compatibility)
function showViewNotesModal(appointmentId) {
    console.log('Showing view notes modal for appointment:', appointmentId);
    // This function is kept for backward compatibility but the new viewNotesModal function is used
}

function showRescheduleModal(appointmentId) {
    console.log('Showing reschedule modal for appointment:', appointmentId);
    // This function is kept for backward compatibility but the new rescheduleAppointment function is used
}

function showPaymentModal(appointmentId) {
    console.log('Showing payment modal for appointment:', appointmentId);
    document.getElementById('paymentAppointmentId').value = appointmentId;
    const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
    modal.show();
}

function showDeleteConfirmModal(appointmentId) {
    console.log('Showing delete confirmation modal for appointment:', appointmentId);
    // Store the appointment ID for deletion
    window.appointmentToDelete = appointmentId;
    const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    modal.show();
}

// Initialize modal forms
function initializeModalForms() {
    try {
        // Reschedule form
        const rescheduleForm = document.getElementById('rescheduleForm');
        if (rescheduleForm) {
            rescheduleForm.addEventListener('submit', async(e) => {
                e.preventDefault();
                const appointmentId = document.getElementById('rescheduleAppointmentId').value;
                const newDate = document.getElementById('rescheduleDate').value;
                const newTime = document.getElementById('rescheduleTime').value;
                const reason = document.getElementById('rescheduleReason').value;

                try {
                    showLoading(200);
                    const response = await fetch(`${API_BASE_URL}/vet/appointments/${appointmentId}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getToken()}`
                        },
                        body: JSON.stringify({
                            appointment_date: newDate,
                            appointment_time: newTime,
                            notes: reason
                        })
                    });

                    if (response.ok) {
                        showSuccess('Appointment rescheduled successfully!');
                        const modal = bootstrap.Modal.getInstance(document.getElementById('rescheduleModal'));
                        modal.hide();
                        loadFilteredAppointments();
                    } else {
                        throw new Error('Failed to reschedule appointment');
                    }
                } catch (error) {
                    console.error('Error rescheduling appointment:', error);
                    showError('Failed to reschedule appointment');
                } finally {
                    hideLoading();
                }
            });
        }

        // Payment form
        const paymentForm = document.getElementById('paymentForm');
        if (paymentForm) {
            paymentForm.addEventListener('submit', async(e) => {
                e.preventDefault();
                const appointmentId = document.getElementById('paymentAppointmentId').value;
                const amount = document.getElementById('paymentAmount').value;
                const method = document.getElementById('paymentMethod').value;
                const status = document.getElementById('paymentStatus').value;
                const notes = document.getElementById('paymentNotes').value;

                try {
                    showLoading(200);
                    const response = await fetch(`${API_BASE_URL}/vet/appointments/${appointmentId}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getToken()}`
                        },
                        body: JSON.stringify({
                            payment_status: status,
                            price: amount,
                            notes: notes
                        })
                    });

                    if (response.ok) {
                        showSuccess('Payment updated successfully!');
                        const modal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
                        modal.hide();
                        loadFilteredAppointments();
                    } else {
                        throw new Error('Failed to update payment');
                    }
                } catch (error) {
                    console.error('Error updating payment:', error);
                    showError('Failed to update payment');
                } finally {
                    hideLoading();
                }
            });
        }

        // Delete confirmation
        const confirmDeleteBtn = document.getElementById('confirmDelete');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', async() => {
                const appointmentId = window.appointmentToDelete;
                try {
                    showLoading(200);
                    const response = await fetch(`${API_BASE_URL}/vet/appointments/${appointmentId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${getToken()}`
                        }
                    });

                    if (response.ok) {
                        showSuccess('Appointment deleted successfully!');
                        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
                        modal.hide();
                        loadFilteredAppointments();
                    } else {
                        throw new Error('Failed to delete appointment');
                    }
                } catch (error) {
                    console.error('Error deleting appointment:', error);
                    showError('Failed to delete appointment');
                } finally {
                    hideLoading();
                }
            });
        }
    } catch (error) {
        console.error('Error initializing modal forms:', error);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing vet dashboard...');

    // Check if user is logged in
    const token = getToken();
    if (!token) {
        console.log('No token found, redirecting to login...');
        window.location.href = '/frontend/pages/login.html';
        return;
    }

    // Check if user role is correct
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'vet' && userRole !== 'admin') {
        console.log('Invalid user role, redirecting to login...');
        localStorage.clear();
        window.location.href = '/frontend/pages/login.html';
        return;
    }

    console.log('User authenticated, initializing dashboard...');
    initializeDashboard();
});