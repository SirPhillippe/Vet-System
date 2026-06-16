// Immediate initialization check
console.log('Admin dashboard JS loading...');

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

// Test function to verify logout works
window.testLogout = function() {
    console.log('Testing logout function...');
    window.logout();
};

// Utility functions
function getToken() {
    return localStorage.getItem('token');
}

function showLoading() {
    const spinner = document.createElement('div');
    spinner.className = 'spinner-overlay';
    spinner.innerHTML = '<div class="spinner-border" role="status"></div>';
    document.body.appendChild(spinner);
}

function hideLoading() {
    const spinner = document.querySelector('.spinner-overlay');
    if (spinner) {
        spinner.remove();
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
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 3000);
}

// Table loading functions
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

// Helper: Convert string to Title Case (capitalize first letter of each word)
function toTitleCase(input) {
    if (!input) return '';
    return String(input)
        .toLowerCase()
        .replace(/\b[\p{L}]/gu, (c) => c.toUpperCase());
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

// Dashboard functions
async function loadDashboardStats() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/admin/dashboard-stats`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (!response.ok) throw new Error('Failed to load dashboard stats');

        const data = await response.json();

        // Update statistics
        document.getElementById('todayAppointments').textContent = data.todayAppointments;
        document.getElementById('activeEmployees').textContent = data.activeEmployees;
        document.getElementById('totalQueries').textContent = data.totalQueries;
        document.getElementById('monthlyRevenue').textContent = formatCurrency(data.monthlyRevenue);
        await loadUpcomingAppointments();
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

            // Clean up any existing modal backdrops before switching sections
            cleanupModalBackdrops();

            // Load section content
            switch (targetSection) {
                case 'dashboard':
                    loadDashboardStats();
                    break;
                case 'appointments':
                    loadAppointments();
                    break;
                case 'medical-records':
                    loadMedicalRecords();
                    break;
                case 'employees':
                    loadEmployees();
                    break;
                case 'clients':
                    loadClients();
                    break;
                case 'services':
                    loadServices();
                    break;
                case 'reports':
                    loadReports();
                    break;
                case 'newsletter':
                    loadNewsletter();
                    break;
                case 'settings':
                    loadSettings();
                    break;
                case 'system-users':
                    loadSystemUsers();
                    break;
                case 'audit-log':
                    initAuditLog();
                    break;
                case 'inventory':
                    loadInventory();
                    break;
            }
        });
    });
}

// Initialize components
function initializeSidebar() {
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');

    sidebarCollapse.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        content.classList.toggle('active');
    });

    // Close sidebar on mobile when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 992) {
            if (!sidebar.contains(e.target) && !sidebarCollapse.contains(e.target)) {
                sidebar.classList.remove('active');
                content.classList.remove('active');
            }
        }
    });
}

function handleLogout() {
    console.log('handleLogout function called');
    const logoutLink = document.getElementById('logoutLink');
    console.log('Logout link found:', logoutLink);

    if (logoutLink) {
        // Remove any existing event listeners to prevent duplicates
        logoutLink.removeEventListener('click', window.logout);

        // Add the event listener
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Logout link clicked via event listener');
            window.logout();
        });

        console.log('Logout event listener attached successfully');
    } else {
        console.error('Logout link not found');
    }
}

function setAdminName() {
    const userName = localStorage.getItem('userName');
    const adminNameElement = document.getElementById('adminName');
    if (adminNameElement && userName) {
        adminNameElement.textContent = userName;
    }
}

function initializeDashboard() {
    // Check authentication
    if (!getToken()) {
        window.location.href = '/login.html';
        return;
    }

    // Set admin name
    setAdminName();

    // Initialize components
    handleNavigation();
    initializeSidebar();
    handleLogout();
    initializeServiceForm();
    initializeServiceButtons();

    // Load initial dashboard data
    loadDashboardStats();
}

// Make functions globally available
window.loadAppointments = loadAppointments;
window.loadEmployees = loadEmployees;
window.loadClients = loadClients;
window.loadServices = loadServices;
window.loadReports = loadReports;
window.loadNewsletter = loadNewsletter;
window.loadSettings = loadSettings;
window.loadInventory = loadInventory;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    if (!getToken()) {
        window.location.href = '/frontend/pages/login.html';
        return;
    }

    // Use Bootstrap defaults for modals; no custom backdrop overrides

    // Set admin name
    setAdminName();

    // Initialize all components
    handleNavigation();
    initializeSidebar();
    handleLogout();
    initializeServiceForm();
    initializeServiceButtons();

    // Test if forms exist
    console.log('Testing form existence:');
    console.log('inventoryForm:', document.getElementById('inventoryForm'));
    console.log('reorderInventoryForm:', document.getElementById('reorderInventoryForm'));
    console.log('useInventoryForm:', document.getElementById('useInventoryForm'));

    initializeInventoryForms();
    initializeAddInventoryButton(); // Initialize add button on page load
    initializeSettings();
    
    // Initialize appointment management
    initializeAppointmentForms();
    initializeAddAppointmentButton();
    loadServicesDropdown(); // Load services for dropdown

    // Load initial dashboard data
    loadDashboardStats();
});

// Section loading functions
async function loadAppointments() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/admin/appointments`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (!response.ok) throw new Error('Failed to load appointments');

        const data = await response.json();
        const appointmentsSection = document.getElementById('appointments-section');

        let html = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Recent Appointments</h5>
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Client</th>
                                    <th>Service</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
        `;

        data.forEach(appointment => {
            html += `
                <tr>
                    <td>${formatDate(appointment.date)}</td>
                    <td>${appointment.time}</td>
                    <td>${appointment.client_name}</td>
                    <td>
                        ${appointment.pet_name || ''}
                        <div class="small text-muted">${formatPetAge(appointment.pet_age)}</div>
                    </td>
                    <td>${appointment.service_name}</td>
                    <td><span class="badge bg-${getStatusColor(appointment.status)}">${appointment.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="viewAppointment(${appointment.id})">View</button>
                        <button class="btn btn-sm btn-danger" onclick="cancelAppointment(${appointment.id})">Cancel</button>
                    </td>
                </tr>
            `;
        });

        html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        appointmentsSection.innerHTML = html;
    } catch (error) {
        showError('Error loading appointments');
        console.error(error);
    } finally {
        hideLoading();
    }
}

let allEmployees = [];

async function loadEmployees() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/admin/employees`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        if (!response.ok) throw new Error('Failed to load employees');
        allEmployees = await response.json();
        renderEmployeesTable(allEmployees);
    } catch (error) {
        showError('Error loading employees');
        console.error(error);
    } finally {
        hideLoading();
    }
}

function renderEmployeesTable(employees) {
    const employeesSection = document.getElementById('employees-section');
    // If not already rendered, render the card, search, and table structure
    if (!document.getElementById('employeeSearch')) {
        let html = `
        <div class="card">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h5 class="card-title">Employees</h5>
                    <button class="btn btn-primary" onclick="showAddEmployeeModal()">Add Employee</button>
                </div>
                <div class="mb-3">
                    <input type="text" class="form-control" id="employeeSearch" placeholder="Search employees by name, position, email, or phone...">
                </div>
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Specialization</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="employeesTableBody"></tbody>
                    </table>
                </div>
            </div>
        </div>`;
        employeesSection.innerHTML = html;
        // Add search event
        const searchInput = document.getElementById('employeeSearch');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const query = this.value.toLowerCase();
                const filtered = allEmployees.filter(emp => {
                    const fullName = [emp.first_name, emp.last_name].filter(Boolean).join(' ').toLowerCase();
                    const position = (emp.specialization || emp.position || '').toLowerCase();
                    return fullName.includes(query) ||
                        position.includes(query) ||
                        (emp.email && emp.email.toLowerCase().includes(query)) ||
                        (emp.phone && emp.phone.toLowerCase().includes(query));
                });
                renderEmployeesTableBody(filtered);
            });
        }
    }
    renderEmployeesTableBody(employees);
}

function renderEmployeesTableBody(employees) {
    const tbody = document.getElementById('employeesTableBody');
    if (!tbody) return;
    let html = '';
    employees.forEach(employee => {
        const fullName = [employee.first_name, employee.last_name].filter(Boolean).join(' ') || employee.name || '';
        html += `
            <tr>
                <td>${fullName}</td>
                <td>${employee.role || ''}</td>
                <td>${employee.specialization || ''}</td>
                <td>${employee.email || ''}</td>
                <td>${employee.phone || ''}</td>
                <td><span class="badge bg-${employee.status === 'active' ? 'success' : 'danger'}">${employee.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="showEditEmployeeModal(${employee.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteEmployee(${employee.id})">Delete</button>
                </td>
            </tr>`;
    });
    tbody.innerHTML = html;
}

function cleanEmployeePayload(payload) {
    // Convert empty strings to null for optional fields
    Object.keys(payload).forEach(key => {
        if (payload[key] === '') payload[key] = null;
    });
    return payload;
}

function showEmployeeModal(employee = null) {
    // Remove any existing modal from DOM to ensure clean state
    let oldModal = document.getElementById('employeeModal');
    if (oldModal) {
        oldModal.parentNode.removeChild(oldModal);
    }
    let modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'employeeModal';
    modal.tabIndex = -1;
    modal.innerHTML = `
    <div class="modal-dialog">
        <div class="modal-content">
            <form id="employeeForm">
                <div class="modal-header">
                    <h5 class="modal-title">${employee ? 'Edit' : 'Add'} Employee</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="employeeId" value="${employee ? employee.id : ''}">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">First Name</label>
                            <input type="text" class="form-control" id="employeeFirstName" value="${employee ? employee.first_name || '' : ''}" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Last Name</label>
                            <input type="text" class="form-control" id="employeeLastName" value="${employee ? employee.last_name || '' : ''}" required>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Role</label>
                        <select class="form-select" id="employeeRole">
                            <option value="vet" ${employee && employee.role === 'vet' ? 'selected' : ''}>Vet</option>
                            <option value="staff" ${employee && employee.role === 'staff' ? 'selected' : ''}>Staff</option>
                            <option value="admin" ${employee && employee.role === 'admin' ? 'selected' : ''}>Admin</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Specialization</label>
                        <input type="text" class="form-control" id="employeeSpecialization" value="${employee ? employee.specialization || '' : ''}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-control" id="employeeEmail" value="${employee ? employee.email || '' : ''}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Phone</label>
                        <input type="text" class="form-control" id="employeePhone" value="${employee ? employee.phone || '' : ''}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Status</label>
                        <select class="form-select" id="employeeStatus">
                            <option value="active" ${!employee || employee.status === 'active' ? 'selected' : ''}>Active</option>
                            <option value="inactive" ${employee && employee.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        </div>
    </div>`;
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    // Handle form submit
    modal.querySelector('#employeeForm').onsubmit = async function(e) {
        e.preventDefault();
        const id = modal.querySelector('#employeeId').value;
        let payload = {
            first_name: modal.querySelector('#employeeFirstName').value,
            last_name: modal.querySelector('#employeeLastName').value,
            role: modal.querySelector('#employeeRole').value,
            specialization: modal.querySelector('#employeeSpecialization').value,
            email: modal.querySelector('#employeeEmail').value,
            phone: modal.querySelector('#employeePhone').value,
            status: modal.querySelector('#employeeStatus').value
        };
        payload = cleanEmployeePayload(payload);
        try {
            showLoading();
            let response;
            if (id) {
                response = await fetch(`${API_BASE_URL}/admin/employees/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: JSON.stringify(payload)
                });
            } else {
                response = await fetch(`${API_BASE_URL}/admin/employees`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: JSON.stringify(payload)
                });
            }
            if (!response.ok) throw new Error('Failed to save employee');
            await loadEmployees();
            const bsModal = bootstrap.Modal.getInstance(modal);
            bsModal.hide();
        } catch (error) {
            showError('Error saving employee');
            console.error(error);
        } finally {
            hideLoading();
        }
    };
}

async function loadClients() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/admin/clients`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (!response.ok) throw new Error('Failed to load clients');

        const data = await response.json();
        const clientsSection = document.getElementById('clients-section');

        let html = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Clients</h5>
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Pets</th>
                                    <th>Last Visit</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
        `;

        data.forEach(client => {
            html += `
                <tr>
                    <td>${client.name}</td>
                    <td>${client.email}</td>
                    <td>${client.phone}</td>
                    <td>${client.pets.join(', ')}</td>
                    <td>${client.last_visit ? formatDate(client.last_visit) : 'Never'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="viewClient(${client.id})">View</button>
                        <button class="btn btn-sm btn-info" onclick="viewClientHistory(${client.id})">History</button>
                    </td>
                </tr>
            `;
        });

        html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        clientsSection.innerHTML = html;
    } catch (error) {
        showError('Error loading clients');
        console.error(error);
    } finally {
        hideLoading();
    }
}

async function loadServices() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/admin/services`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (!response.ok) throw new Error('Failed to load services');

        const data = await response.json();
        const servicesTableBody = document.getElementById('servicesTableBody');

        if (!servicesTableBody) {
            console.error('Services table body not found');
            return;
        }

        // Update statistics
        const totalServices = data.length;
        const activeServices = data.filter(service => service.status === 'active').length;
        const totalRevenue = data.reduce((sum, service) => sum + parseFloat(service.price || 0), 0);
        const avgPrice = totalServices > 0 ? totalRevenue / totalServices : 0;

        document.getElementById('totalServicesCount').textContent = totalServices;
        document.getElementById('activeServicesCount').textContent = activeServices;
        document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
        document.getElementById('avgPrice').textContent = formatCurrency(avgPrice);

        // Clear existing table content
        servicesTableBody.innerHTML = '';

        if (data.length === 0) {
            servicesTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No services found</td></tr>';
            return;
        }

        // Populate table
        data.forEach(service => {
            const isActive = service.status === 'active';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${service.name}</td>
                <td>${service.description || ''}</td>
                <td>${service.duration} mins</td>
                <td>${formatCurrency(service.price)}</td>
                <td><span class="badge bg-${isActive ? 'success' : 'danger'}">${isActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editService(${service.id})">
                        <i class='bx bx-edit'></i> Edit
                    </button>
                    <button class="btn btn-sm btn-${isActive ? 'danger' : 'success'}" onclick="toggleServiceStatus(${service.id})">
                        <i class='bx bx-${isActive ? 'x' : 'check'}'></i> ${isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteService(${service.id})">
                        <i class='bx bx-trash'></i> Delete
                    </button>
                </td>
            `;
            servicesTableBody.appendChild(row);
        });

        // Update pagination info
        document.getElementById('servicesShowingStart').textContent = '1';
        document.getElementById('servicesShowingEnd').textContent = data.length;
        document.getElementById('servicesTotalShowing').textContent = data.length;

    } catch (error) {
        showError('Error loading services');
        console.error(error);
    } finally {
        hideLoading();
    }
}

async function loadReports() {
    try {
        showLoading();
        const reportsSection = document.getElementById('reports-section');

        let html = `
            <div class="row">
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Revenue Report</h5>
                            <div class="mb-3">
                                <label class="form-label">Date Range</label>
                                <select class="form-select" id="revenueReportRange">
                                    <option value="week">Last Week</option>
                                    <option value="month">Last Month</option>
                                    <option value="year">Last Year</option>
                                </select>
                            </div>
                            <button class="btn btn-primary" onclick="generateRevenueReport()">Generate Report</button>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Appointment Report</h5>
                            <div class="mb-3">
                                <label class="form-label">Date Range</label>
                                <select class="form-select" id="appointmentReportRange">
                                    <option value="week">Last Week</option>
                                    <option value="month">Last Month</option>
                                    <option value="year">Last Year</option>
                                </select>
                            </div>
                            <button class="btn btn-primary" onclick="generateAppointmentReport()">Generate Report</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Service Performance</h5>
                            <div class="mb-3">
                                <label class="form-label">Date Range</label>
                                <select class="form-select" id="serviceReportRange">
                                    <option value="week">Last Week</option>
                                    <option value="month">Last Month</option>
                                    <option value="year">Last Year</option>
                                </select>
                            </div>
                            <button class="btn btn-primary" onclick="generateServiceReport()">Generate Report</button>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Client Analytics</h5>
                            <div class="mb-3">
                                <label class="form-label">Date Range</label>
                                <select class="form-select" id="clientReportRange">
                                    <option value="week">Last Week</option>
                                    <option value="month">Last Month</option>
                                    <option value="year">Last Year</option>
                                </select>
                            </div>
                            <button class="btn btn-primary" onclick="generateClientReport()">Generate Report</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-12 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Export Data</h5>
                            <p class="text-muted mb-3">Download the full raw datasets as CSV files.</p>
                            <button class="btn btn-success me-2 mb-2" onclick="exportData('appointments')">
                                <i class='bx bx-download'></i> Export Appointments
                            </button>
                            <button class="btn btn-success me-2 mb-2" onclick="exportData('patients')">
                                <i class='bx bx-download'></i> Export Patients
                            </button>
                            <button class="btn btn-primary mb-2" onclick="exportData('all')">
                                <i class='bx bx-download'></i> Export All Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        reportsSection.innerHTML = html;
    } catch (error) {
        showError('Error loading reports section');
        console.error(error);
    } finally {
        hideLoading();
    }
}

async function loadNewsletter() {
    try {
        showLoading();
        const newsletterSection = document.getElementById('newsletter-section');

        // Show placeholder message for future implementation
        let html = `
            <div class="row">
                <div class="col-12">
            <div class="card">
                        <div class="card-body text-center">
                            <div class="mb-4">
                                <i class='bx bxs-envelope' style="font-size: 4rem; color: #6c757d;"></i>
                    </div>
                            <h4 class="card-title">Newsletter Management Coming Soon</h4>
                            <p class="card-text text-muted">
                                The newsletter management system is currently under development and will be available in a future update.
                                <br>This will include email campaign creation, subscriber management, and analytics.
                            </p>
                            <div class="mt-4">
                    <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <div class="border rounded p-3">
                                            <i class='bx bx-edit text-primary'></i>
                                            <h6 class="mt-2">Compose Newsletters</h6>
                                            <small class="text-muted">Create and send email campaigns</small>
                                </div>
                            </div>
                                    <div class="col-md-4 mb-3">
                                        <div class="border rounded p-3">
                                            <i class='bx bx-group text-success'></i>
                                            <h6 class="mt-2">Subscriber Management</h6>
                                            <small class="text-muted">Manage email subscribers</small>
                        </div>
                                </div>
                                    <div class="col-md-4 mb-3">
                                        <div class="border rounded p-3">
                                            <i class='bx bx-bar-chart text-info'></i>
                                            <h6 class="mt-2">Analytics & Reports</h6>
                                            <small class="text-muted">Track campaign performance</small>
                            </div>
                        </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        newsletterSection.innerHTML = html;
    } catch (error) {
        showError('Error loading newsletter section');
        console.error(error);
    } finally {
        hideLoading();
    }
}

async function loadSettings() {
    try {
        showLoading();
        const settingsSection = document.getElementById('settings-section');

        // Show placeholder message for future implementation
        let html = `
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-body text-center">
                            <div class="mb-4">
                                <i class='bx bxs-cog' style="font-size: 4rem; color: #6c757d;"></i>
                                </div>
                            <h4 class="card-title">Settings Coming Soon</h4>
                            <p class="card-text text-muted">
                                The settings section is currently under development and will be available in a future update.
                                <br>This will include business settings, email configuration, appointment preferences, and system options.
                            </p>
                            <div class="mt-4">
                                <div class="row">
                                    <div class="col-md-3 mb-3">
                                        <div class="border rounded p-3">
                                            <i class='bx bx-building-house text-primary'></i>
                                            <h6 class="mt-2">Business Settings</h6>
                                            <small class="text-muted">Configure clinic information</small>
                                </div>
                                </div>
                                    <div class="col-md-3 mb-3">
                                        <div class="border rounded p-3">
                                            <i class='bx bx-envelope text-success'></i>
                                            <h6 class="mt-2">Email Settings</h6>
                                            <small class="text-muted">Email notifications & templates</small>
                                </div>
                        </div>
                                    <div class="col-md-3 mb-3">
                                        <div class="border rounded p-3">
                                            <i class='bx bx-calendar text-warning'></i>
                                            <h6 class="mt-2">Appointment Settings</h6>
                                            <small class="text-muted">Scheduling preferences</small>
                    </div>
                </div>
                                    <div class="col-md-3 mb-3">
                                        <div class="border rounded p-3">
                                            <i class='bx bx-cog text-info'></i>
                                            <h6 class="mt-2">System Settings</h6>
                                            <small class="text-muted">System configuration</small>
                                </div>
                                        </div>
                                        </div>
                                    </div>
                                </div>
                    </div>
                </div>
            </div>
        `;

        settingsSection.innerHTML = html;
    } catch (error) {
        showError('Error loading settings');
        console.error(error);
    } finally {
        hideLoading();
    }
}

// Action handlers
window.viewAppointment = (id) => console.log('View appointment:', id);
window.cancelAppointment = (id) => console.log('Cancel appointment:', id);
window.editEmployee = (id) => console.log('Edit employee:', id);
window.toggleEmployeeStatus = (id) => console.log('Toggle employee status:', id);
window.viewClient = (id) => console.log('View client:', id);
window.viewClientHistory = (id) => console.log('View client history:', id);
window.editService = (id) => console.log('Edit service:', id);
window.toggleServiceStatus = (id) => console.log('Toggle service status:', id);
window.generateRevenueReport = async() => {
    try {
        showLoading();
        const range = document.getElementById('revenueReportRange').value;
        const response = await fetch(`${API_BASE_URL}/admin/reports/revenue?range=${range}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        if (!response.ok) throw new Error('Failed to generate revenue report');

        const data = await response.json();
        displayRevenueReport(data.data);
    } catch (error) {
        showError('Error generating revenue report');
        console.error(error);
    } finally {
        hideLoading();
    }
};

window.generateAppointmentReport = async() => {
    try {
        showLoading();
        const range = document.getElementById('appointmentReportRange').value;
        const response = await fetch(`${API_BASE_URL}/admin/reports/appointments?range=${range}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        if (!response.ok) throw new Error('Failed to generate appointment report');

        const data = await response.json();
        displayAppointmentReport(data.data);
    } catch (error) {
        showError('Error generating appointment report');
        console.error(error);
    } finally {
        hideLoading();
    }
};

window.generateServiceReport = async() => {
    try {
        showLoading();
        const range = document.getElementById('serviceReportRange').value;
        const response = await fetch(`${API_BASE_URL}/admin/reports/services?range=${range}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        if (!response.ok) throw new Error('Failed to generate service report');

        const data = await response.json();
        displayServiceReport(data.data);
    } catch (error) {
        showError('Error generating service report');
        console.error(error);
    } finally {
        hideLoading();
    }
};

window.generateClientReport = async() => {
    try {
        showLoading();
        const range = document.getElementById('clientReportRange').value;
        const response = await fetch(`${API_BASE_URL}/admin/reports/clients?range=${range}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        if (!response.ok) throw new Error('Failed to generate client report');

        const data = await response.json();
        displayClientReport(data.data);
    } catch (error) {
        showError('Error generating client report');
        console.error(error);
    } finally {
        hideLoading();
    }
};
window.viewNewsletter = (id) => console.log('View newsletter:', id);
window.viewStats = (id) => console.log('View stats:', id);
window.showAddEmployeeModal = function() {
    showEmployeeModal();
};

window.showEditEmployeeModal = async function(id) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/admin/employees/${id}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (!response.ok) throw new Error('Failed to fetch employee');
        const employee = await response.json();
        showEmployeeModal(employee);
    } catch (error) {
        showError('Error loading employee');
        console.error(error);
    } finally {
        hideLoading();
    }
};

// Holds the most recently generated report so it can be exported to CSV
let currentReport = { type: null, data: [] };

// Report Display Functions
function displayRevenueReport(data) {
    currentReport = { type: 'revenue', data };
    const reportsSection = document.getElementById('reports-section');
    const totalRevenue = data.reduce((sum, item) => sum + parseFloat(item.revenue || 0), 0);
    const totalAppointments = data.reduce((sum, item) => sum + parseInt(item.appointments || 0), 0);

    let html = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center">
                    <h3>Revenue Report</h3>
                    <div>
                        <button class="btn btn-success me-2" onclick="exportReport()"><i class='bx bx-download'></i> Export CSV</button>
                        <button class="btn btn-secondary" onclick="loadReports()">Back to Reports</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card bg-primary text-white">
                    <div class="card-body">
                        <h5 class="card-title">Total Revenue</h5>
                        <h3>${formatCurrency(totalRevenue)}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <h5 class="card-title">Total Appointments</h5>
                        <h3>${totalAppointments}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-info text-white">
                    <div class="card-body">
                        <h5 class="card-title">Average Revenue</h5>
                        <h3>${formatCurrency(totalAppointments > 0 ? totalRevenue / totalAppointments : 0)}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-warning text-white">
                    <div class="card-body">
                        <h5 class="card-title">Days Tracked</h5>
                        <h3>${data.length}</h3>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Daily Revenue Breakdown</h5>
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Appointments</th>
                                        <th>Revenue</th>
                                        <th>Average per Appointment</th>
                                    </tr>
                                </thead>
                                <tbody>
    `;

    data.forEach(item => {
        const avgRevenue = item.appointments > 0 ? item.revenue / item.appointments : 0;
        html += `
            <tr>
                <td>${formatDate(item.date)}</td>
                <td>${item.appointments}</td>
                <td>${formatCurrency(item.revenue)}</td>
                <td>${formatCurrency(avgRevenue)}</td>
            </tr>
        `;
    });

    html += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    reportsSection.innerHTML = html;
}

function displayAppointmentReport(data) {
    currentReport = { type: 'appointments', data };
    const reportsSection = document.getElementById('reports-section');
    const totalAppointments = data.length;
    const completedAppointments = data.filter(item => item.status === 'completed').length;
    const pendingAppointments = data.filter(item => item.status === 'pending').length;
    const cancelledAppointments = data.filter(item => item.status === 'cancelled').length;

    let html = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center">
                    <h3>Appointment Report</h3>
                    <div>
                        <button class="btn btn-success me-2" onclick="exportReport()"><i class='bx bx-download'></i> Export CSV</button>
                        <button class="btn btn-secondary" onclick="loadReports()">Back to Reports</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card bg-primary text-white">
                    <div class="card-body">
                        <h5 class="card-title">Total Appointments</h5>
                        <h3>${totalAppointments}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <h5 class="card-title">Completed</h5>
                        <h3>${completedAppointments}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-warning text-white">
                    <div class="card-body">
                        <h5 class="card-title">Pending</h5>
                        <h3>${pendingAppointments}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-danger text-white">
                    <div class="card-body">
                        <h5 class="card-title">Cancelled</h5>
                        <h3>${cancelledAppointments}</h3>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Appointment Details</h5>
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Client</th>
                                        <th>Service</th>
                                        <th>Status</th>
                                        <th>Payment Status</th>
                                    </tr>
                                </thead>
                                <tbody>
    `;

    data.forEach(item => {
        html += `
            <tr>
                <td>${formatDate(item.appointment_date)}</td>
                <td>${item.appointment_time}</td>
                <td>${item.client_name}</td>
                <td>${item.service_name}</td>
                <td><span class="badge bg-${getStatusColor(item.status)}">${item.status}</span></td>
                <td><span class="badge bg-${item.status === 'completed' ? 'success' : 'warning'}">${item.status === 'completed' ? 'paid' : 'pending'}</span></td>
            </tr>
        `;
    });

    html += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    reportsSection.innerHTML = html;
}

function displayServiceReport(data) {
    currentReport = { type: 'services', data };
    const reportsSection = document.getElementById('reports-section');
    const totalServices = data.length;
    const totalBookings = data.reduce((sum, item) => sum + parseInt(item.total_bookings || 0), 0);
    const totalRevenue = data.reduce((sum, item) => sum + parseFloat(item.total_revenue || 0), 0);
    const avgBookings = totalServices > 0 ? totalBookings / totalServices : 0;

    let html = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center">
                    <h3>Service Performance Report</h3>
                    <div>
                        <button class="btn btn-success me-2" onclick="exportReport()"><i class='bx bx-download'></i> Export CSV</button>
                        <button class="btn btn-secondary" onclick="loadReports()">Back to Reports</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card bg-primary text-white">
                    <div class="card-body">
                        <h5 class="card-title">Total Services</h5>
                        <h3>${totalServices}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <h5 class="card-title">Total Bookings</h5>
                        <h3>${totalBookings}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-info text-white">
                    <div class="card-body">
                        <h5 class="card-title">Total Revenue</h5>
                        <h3>${formatCurrency(totalRevenue)}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-warning text-white">
                    <div class="card-body">
                        <h5 class="card-title">Avg Bookings/Service</h5>
                        <h3>${avgBookings.toFixed(1)}</h3>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Service Performance Details</h5>
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Service Name</th>
                                        <th>Price</th>
                                        <th>Total Bookings</th>
                                        <th>Total Revenue</th>
                                        <th>Average Revenue per Booking</th>
                                    </tr>
                                </thead>
                                <tbody>
    `;

    data.forEach(item => {
        const avgRevenue = item.total_bookings > 0 ? item.total_revenue / item.total_bookings : 0;
        html += `
            <tr>
                <td>${item.name}</td>
                <td>${formatCurrency(item.price)}</td>
                <td>${item.total_bookings}</td>
                <td>${formatCurrency(item.total_revenue)}</td>
                <td>${formatCurrency(avgRevenue)}</td>
            </tr>
        `;
    });

    html += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    reportsSection.innerHTML = html;
}

function displayClientReport(data) {
    currentReport = { type: 'clients', data };
    const reportsSection = document.getElementById('reports-section');
    const totalClients = data.length;
    const totalAppointments = data.reduce((sum, item) => sum + parseInt(item.total_appointments || 0), 0);
    const totalSpent = data.reduce((sum, item) => sum + parseFloat(item.total_spent || 0), 0);
    const avgSpent = totalClients > 0 ? totalSpent / totalClients : 0;

    let html = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center">
                    <h3>Client Analytics Report</h3>
                    <div>
                        <button class="btn btn-success me-2" onclick="exportReport()"><i class='bx bx-download'></i> Export CSV</button>
                        <button class="btn btn-secondary" onclick="loadReports()">Back to Reports</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card bg-primary text-white">
                    <div class="card-body">
                        <h5 class="card-title">Total Clients</h5>
                        <h3>${totalClients}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <h5 class="card-title">Total Appointments</h5>
                        <h3>${totalAppointments}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-info text-white">
                    <div class="card-body">
                        <h5 class="card-title">Total Revenue</h5>
                        <h3>${formatCurrency(totalSpent)}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-warning text-white">
                    <div class="card-body">
                        <h5 class="card-title">Average Spent/Client</h5>
                        <h3>${formatCurrency(avgSpent)}</h3>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Client Details</h5>
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Client Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Total Appointments</th>
                                        <th>Total Spent</th>
                                        <th>Average per Visit</th>
                                    </tr>
                                </thead>
                                <tbody>
    `;

    data.forEach(item => {
        const avgPerVisit = item.total_appointments > 0 ? item.total_spent / item.total_appointments : 0;
        html += `
            <tr>
                <td>${item.first_name}</td>
                <td>${item.email}</td>
                <td>${item.phone || 'N/A'}</td>
                <td>${item.total_appointments}</td>
                <td>${formatCurrency(item.total_spent)}</td>
                <td>${formatCurrency(avgPerVisit)}</td>
            </tr>
        `;
    });

    html += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    reportsSection.innerHTML = html;
}

// Export the most recently generated report to a CSV download
window.exportReport = function() {
    if (!currentReport.type || !Array.isArray(currentReport.data) || currentReport.data.length === 0) {
        showError('No report data available to export. Please generate a report first.');
        return;
    }

    // Wrap each value in quotes and escape embedded quotes for safe CSV
    const cell = (value) => `"${String(value == null ? '' : value).replace(/"/g, '""')}"`;
    const money = (value) => Number(value || 0).toFixed(2);

    let columns = [];
    let rows = [];

    switch (currentReport.type) {
        case 'revenue':
            columns = ['Date', 'Appointments', 'Revenue', 'Average per Appointment'];
            rows = currentReport.data.map(item => [
                item.date,
                item.appointments,
                money(item.revenue),
                money(item.appointments > 0 ? item.revenue / item.appointments : 0)
            ]);
            break;
        case 'appointments':
            columns = ['Date', 'Time', 'Client', 'Service', 'Status', 'Payment Status'];
            rows = currentReport.data.map(item => [
                item.appointment_date,
                item.appointment_time,
                item.client_name,
                item.service_name,
                item.status,
                item.status === 'completed' ? 'paid' : 'pending'
            ]);
            break;
        case 'services':
            columns = ['Service Name', 'Price', 'Total Bookings', 'Total Revenue', 'Average Revenue per Booking'];
            rows = currentReport.data.map(item => [
                item.name,
                money(item.price),
                item.total_bookings,
                money(item.total_revenue),
                money(item.total_bookings > 0 ? item.total_revenue / item.total_bookings : 0)
            ]);
            break;
        case 'clients':
            columns = ['Client Name', 'Email', 'Phone', 'Total Appointments', 'Total Spent', 'Average per Visit'];
            rows = currentReport.data.map(item => [
                item.first_name,
                item.email,
                item.phone || 'N/A',
                item.total_appointments,
                money(item.total_spent),
                money(item.total_appointments > 0 ? item.total_spent / item.total_appointments : 0)
            ]);
            break;
        default:
            showError('Unknown report type.');
            return;
    }

    const csv = [columns, ...rows].map(row => row.map(cell).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentReport.type}-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

window.deleteEmployee = async function(id) {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/admin/employees/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (!response.ok) throw new Error('Failed to delete employee');
        await loadEmployees();
    } catch (error) {
        showError('Error deleting employee');
        console.error(error);
    } finally {
        hideLoading();
    }
};

async function loadUpcomingAppointments() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/appointments?filter=all&limit=5&page=1`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (!response.ok) throw new Error('Failed to fetch upcoming appointments');
        const data = await response.json();
        const tbody = document.getElementById('upcomingAppointmentsTableBody');
        tbody.innerHTML = '';
        if (data.appointments && data.appointments.length > 0) {
            data.appointments
                .sort((a, b) => new Date(a.appointment_date + 'T' + a.appointment_time) - new Date(b.appointment_date + 'T' + b.appointment_time))
                .forEach(apt => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${formatDate(apt.appointment_date)}</td>
                        <td>${apt.appointment_time}</td>
                        <td>${apt.client_name}<br><small class='text-muted'>${apt.client_email || ''}</small></td>
                        <td>${apt.pet_name}</td>
                        <td>${apt.service_name || ''}</td>
                        <td><span class="badge bg-${getStatusColor(apt.status)}">${apt.status}</span></td>
                    `;
                    tbody.appendChild(tr);
                });
        } else {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="6" class="text-center text-muted">No upcoming appointments</td>';
            tbody.appendChild(tr);
        }
    } catch (error) {
        const tbody = document.getElementById('upcomingAppointmentsTableBody');
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Failed to load appointments</td></tr>';
        console.error('Error loading upcoming appointments:', error);
    }
}

async function loadSystemUsers() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        if (!response.ok) throw new Error('Failed to load system users');
        const users = await response.json();
        renderSystemUsersTable(users);
    } catch (error) {
        showError('Error loading system users');
        console.error(error);
    } finally {
        hideLoading();
    }
}

function renderSystemUsersTable(users) {
    const section = document.getElementById('system-users-section');
    let html = `
        <div class="card">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h5 class="card-title">System Users (Admins & Vets)</h5>
                    <button class="btn btn-primary" onclick="showAddSystemUserModal()">Add System User</button>
                </div>
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>`;
    users.forEach(user => {
        html += `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>${user.phone || ''}</td>
                <td><span class="badge bg-${user.status === 'active' ? 'success' : 'danger'}">${user.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="showEditSystemUserModal(${user.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteSystemUser(${user.id})">Delete</button>
                </td>
            </tr>`;
    });
    html += `</tbody></table></div></div></div>`;
    section.innerHTML = html;
}

window.showAddSystemUserModal = function() {
    showSystemUserModal();
};

window.showEditSystemUserModal = async function(id) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (!response.ok) throw new Error('Failed to fetch user');
        const user = await response.json();
        showSystemUserModal(user);
    } catch (error) {
        showError('Error loading user');
        console.error(error);
    } finally {
        hideLoading();
    }
};

window.deleteSystemUser = async function(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (!response.ok) throw new Error('Failed to delete user');
        loadSystemUsers();
    } catch (error) {
        showError('Error deleting user');
        console.error(error);
    } finally {
        hideLoading();
    }
};

function showSystemUserModal(user = null) {
    // Remove any existing modal from DOM to ensure clean state
    let oldModal = document.getElementById('systemUserModal');
    if (oldModal) {
        oldModal.parentNode.removeChild(oldModal);
    }
    let modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'systemUserModal';
    modal.tabIndex = -1;
    modal.innerHTML = `
    <div class="modal-dialog">
        <div class="modal-content">
            <form id="systemUserForm">
                <div class="modal-header">
                    <h5 class="modal-title">${user ? 'Edit' : 'Add'} System User</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="systemUserId" value="${user ? user.id : ''}">
                    <div class="mb-3">
                        <label class="form-label">Name</label>
                        <input type="text" class="form-control" id="systemUserName" value="${user ? user.name : ''}" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-control" id="systemUserEmail" value="${user ? user.email : ''}" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Role</label>
                        <select class="form-select" id="systemUserRole" required>
                            <option value="admin" ${user && user.role === 'admin' ? 'selected' : ''}>Admin</option>
                            <option value="vet" ${user && user.role === 'vet' ? 'selected' : ''}>Vet</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Phone</label>
                        <input type="text" class="form-control" id="systemUserPhone" value="${user ? user.phone || '' : ''}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Specialization</label>
                        <input type="text" class="form-control" id="systemUserSpecialization" value="${user ? user.specialization || '' : ''}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Status</label>
                        <select class="form-select" id="systemUserStatus">
                            <option value="active" ${user && user.status === 'active' ? 'selected' : ''}>Active</option>
                            <option value="inactive" ${user && user.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Password ${user ? '(leave blank to keep unchanged)' : ''}</label>
                        <input type="password" class="form-control" id="systemUserPassword" autocomplete="new-password" ${user ? '' : 'required'}>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        </div>
    </div>`;
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    // Handle form submit
    modal.querySelector('#systemUserForm').onsubmit = async function(e) {
        e.preventDefault();
        const id = modal.querySelector('#systemUserId').value;
        let payload = {
            name: modal.querySelector('#systemUserName').value,
            email: modal.querySelector('#systemUserEmail').value,
            role: modal.querySelector('#systemUserRole').value,
            phone: modal.querySelector('#systemUserPhone').value,
            specialization: modal.querySelector('#systemUserSpecialization').value,
            status: modal.querySelector('#systemUserStatus').value
        };
        const password = modal.querySelector('#systemUserPassword').value;
        if (password) payload.password = password;
        // Clean payload
        Object.keys(payload).forEach(key => {
            if (payload[key] === '') payload[key] = null;
        });
        try {
            showLoading();
            let response;
            if (id) {
                response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: JSON.stringify(payload)
                });
            } else {
                response = await fetch(`${API_BASE_URL}/admin/users`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: JSON.stringify(payload)
                });
            }
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save user');
            }
            
            const result = await response.json();
            showSuccess(result.message || 'User saved successfully!');
            await loadSystemUsers();
            const bsModal = bootstrap.Modal.getInstance(modal);
            bsModal.hide();
        } catch (error) {
            showError('Error saving user: ' + error.message);
            console.error(error);
        } finally {
            hideLoading();
        }
    };
}

// --- SERVICES SECTION LOGIC ---

// Open Add Service Modal
window.showAddServiceModal = function() {
    clearServiceModal();
    document.getElementById('serviceModalLabel').textContent = 'Add Service';
    new bootstrap.Modal(document.getElementById('serviceModal')).show();
};

// Open Edit Service Modal
window.editService = async function(id) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/admin/services/${id}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (!response.ok) throw new Error('Failed to fetch service');
        const service = await response.json();
        fillServiceModal(service);
        document.getElementById('serviceModalLabel').textContent = 'Edit Service';
        new bootstrap.Modal(document.getElementById('serviceModal')).show();
    } catch (error) {
        showError('Error loading service');
        console.error(error);
    } finally {
        hideLoading();
    }
};

// Fill modal with service data
function fillServiceModal(service) {
    document.getElementById('serviceModalId').value = service.id;
    document.getElementById('serviceName').value = service.name;
    document.getElementById('serviceDescription').value = service.description;
    document.getElementById('serviceDuration').value = service.duration;
    document.getElementById('servicePrice').value = service.price;
    document.getElementById('serviceStatus').value = service.status || 'active';
}

// Clear modal for new service
function clearServiceModal() {
    document.getElementById('serviceModalId').value = '';
    document.getElementById('serviceName').value = '';
    document.getElementById('serviceDescription').value = '';
    document.getElementById('serviceDuration').value = '';
    document.getElementById('servicePrice').value = '';
    document.getElementById('serviceStatus').value = 'active';
}

// Handle Add/Edit Service Form
function initializeServiceForm() {
    const serviceForm = document.getElementById('serviceForm');
    if (serviceForm) {
        serviceForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const id = document.getElementById('serviceModalId').value;
            const payload = {
                name: document.getElementById('serviceName').value,
                description: document.getElementById('serviceDescription').value,
                duration: document.getElementById('serviceDuration').value,
                price: document.getElementById('servicePrice').value,
                status: document.getElementById('serviceStatus').value
            };
            try {
                showLoading();
                let response;
                if (id) {
                    response = await fetch(`${API_BASE_URL}/admin/services/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getToken()}`
                        },
                        body: JSON.stringify(payload)
                    });
                } else {
                    response = await fetch(`${API_BASE_URL}/admin/services`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getToken()}`
                        },
                        body: JSON.stringify(payload)
                    });
                }
                if (!response.ok) throw new Error('Failed to save service');
                bootstrap.Modal.getInstance(document.getElementById('serviceModal')).hide();
                await loadServices();
            } catch (error) {
                showError('Error saving service');
                console.error(error);
            } finally {
                hideLoading();
            }
        });
    }
}

// Delete Service
window.deleteService = async function(id) {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/admin/services/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (!response.ok) throw new Error('Failed to delete service');
        await loadServices();
    } catch (error) {
        showError('Error deleting service');
        console.error(error);
    } finally {
        hideLoading();
    }
};

// Toggle Service Status
window.toggleServiceStatus = async function(id) {
    try {
        showLoading();
        // Fetch current service
        const response = await fetch(`${API_BASE_URL}/admin/services/${id}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (!response.ok) throw new Error('Failed to fetch service');
        const service = await response.json();
        // Toggle status
        const newStatus = service.status === 'active' ? 'inactive' : 'active';
        const updateRes = await fetch(`${API_BASE_URL}/admin/services/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({...service, status: newStatus })
        });
        if (!updateRes.ok) throw new Error('Failed to update service status');
        await loadServices();
    } catch (error) {
        showError('Error updating service status');
        console.error(error);
    } finally {
        hideLoading();
    }
};

// Initialize service buttons and filters
function initializeServiceButtons() {
    // Refresh Services
    const refreshServicesBtn = document.getElementById('refreshServices');
    if (refreshServicesBtn) {
        refreshServicesBtn.addEventListener('click', loadServices);
    }

    // Export Services to CSV
    const exportServicesBtn = document.getElementById('exportServices');
    if (exportServicesBtn) {
        exportServicesBtn.addEventListener('click', async function() {
            try {
                showLoading();
                const response = await fetch(`${API_BASE_URL}/admin/services`, {
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                });
                if (!response.ok) throw new Error('Failed to fetch services');
                const data = await response.json();
                let csv = 'Name,Description,Duration,Price,Status\n';
                data.forEach(s => {
                    csv += `"${s.name}","${s.description}",${s.duration},${s.price},${s.status}\n`;
                });
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'services.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (error) {
                showError('Error exporting services');
                console.error(error);
            } finally {
                hideLoading();
            }
        });
    }

    // Add Service Button
    const addServiceBtn = document.getElementById('addServiceBtn');
    if (addServiceBtn) {
        addServiceBtn.addEventListener('click', showAddServiceModal);
    }

    // Filtering (basic search by name/description)
    const serviceSearchInput = document.getElementById('serviceSearch');
    if (serviceSearchInput) {
        serviceSearchInput.addEventListener('input', function() {
            loadServices();
        });
    }
}

// =====================
// Inventory Management
// =====================

async function loadInventory() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/admin/inventory`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (!response.ok) throw new Error('Failed to fetch inventory');
        const data = await response.json();
        console.log('Inventory data received:', data);
        console.log('Inventory data type:', typeof data);
        console.log('Inventory data.data:', data.data);
        console.log('Is data.data an array?', Array.isArray(data.data));

        // Ensure we have an array to work with
        let items = [];
        if (data && Array.isArray(data)) {
            items = data;
        } else if (data && data.data && Array.isArray(data.data)) {
            items = data.data;
        } else if (data && Array.isArray(data.inventory)) {
            items = data.inventory;
        } else {
            console.warn('No valid inventory array found in response:', data);
            items = [];
        }

        renderInventoryTable(items);
    } catch (error) {
        showError('Error loading inventory');
        console.error(error);
    } finally {
        hideLoading();
    }
}

function renderInventoryTable(items) {
    const tbody = document.getElementById('inventoryTableBody');
    tbody.innerHTML = '';

    // Ensure items is an array
    if (!Array.isArray(items)) {
        console.error('renderInventoryTable: items is not an array:', items);
        items = [];
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
        let statusClass = '';
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
                <button class="btn btn-sm btn-info me-1" onclick="showEditInventoryModal(${item.id})" title="Edit"><i class='bx bx-edit'></i></button>
                <button class="btn btn-sm btn-warning me-1" onclick="showReorderInventoryModal(${item.id})" title="Reorder"><i class='bx bx-plus-medical'></i></button>
                <button class="btn btn-sm btn-secondary me-1" onclick="showUseInventoryModal(${item.id})" title="Use Stock"><i class='bx bx-package'></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteInventoryItem(${item.id})" title="Delete"><i class='bx bx-trash'></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Global modal instances
let inventoryModal = null;
let reorderInventoryModal = null;

// Function to clean up modal backdrops
function cleanupModalBackdrops() {
    // Remove any existing modal backdrops
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());

    // Remove modal-open class from body
    document.body.classList.remove('modal-open');

    // Remove any inline styles that might be blocking interaction
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

    // Hide any visible modals
    const visibleModals = document.querySelectorAll('.modal.show');
    visibleModals.forEach(modal => {
        modal.classList.remove('show');
        modal.style.display = 'none';
    });

    // Force remove any remaining overlay elements
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
        if (element.style.position === 'fixed' &&
            (element.style.zIndex === '1055' || element.style.zIndex === '1050')) {
            element.remove();
        }
    });

    // Remove any elements with modal-backdrop class
    const modalBackdrops = document.querySelectorAll('.modal-backdrop');
    modalBackdrops.forEach(backdrop => backdrop.remove());

    // Remove any fixed position overlays
    const fixedOverlays = document.querySelectorAll('[style*="position: fixed"]');
    fixedOverlays.forEach(overlay => {
        if (overlay.style.zIndex === '1055' || overlay.style.zIndex === '1050' || overlay.style.zIndex === '1040') {
            overlay.remove();
        }
    });

    // Reset modal instances
    inventoryModal = null;
    reorderInventoryModal = null;

    console.log('Modal backdrops cleaned up');
}

// Function to prevent Bootstrap from creating backdrops
function preventBootstrapBackdrops() {
    // Override Bootstrap's modal backdrop creation
    if (window.bootstrap && window.bootstrap.Modal) {
        const originalModal = window.bootstrap.Modal;
        window.bootstrap.Modal = function(element, options) {
            // Force backdrop to false to prevent Bootstrap from creating it
            const newOptions = {...options, backdrop: false };
            return new originalModal(element, newOptions);
        };
    }
}

// Function to monitor and remove backdrops
function monitorAndRemoveBackdrops() {
    // Set up a mutation observer to watch for backdrop creation
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && node.classList &&
                        (node.classList.contains('modal-backdrop') ||
                            (node.style && node.style.position === 'fixed' &&
                                (node.style.zIndex === '1050' || node.style.zIndex === '1055')))) {
                        console.log('Removing detected backdrop:', node);
                        node.remove();
                    }
                });
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Emergency cleanup function (can be called from console)
window.emergencyModalCleanup = function() {
    cleanupModalBackdrops();
    alert('Modal cleanup completed!');
};

// Handle Escape key to close modals
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        if (inventoryModal) {
            inventoryModal.hide();
        }
        if (reorderInventoryModal) {
            reorderInventoryModal.hide();
        }
        cleanupModalBackdrops();
    }
});

// Add event listeners for modal close buttons
document.addEventListener('DOMContentLoaded', function() {
    // Inventory modal close buttons
    const inventoryModalElement = document.getElementById('inventoryModal');
    if (inventoryModalElement) {
        // Close button (X)
        const closeBtn = inventoryModalElement.querySelector('.btn-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                inventoryModalElement.style.display = 'none';
                inventoryModalElement.classList.remove('show');
                inventoryModalElement.style.position = '';
                inventoryModalElement.style.top = '';
                inventoryModalElement.style.left = '';
                inventoryModalElement.style.transform = '';
                inventoryModalElement.style.backgroundColor = '';
                inventoryModalElement.style.borderRadius = '';
                inventoryModalElement.style.boxShadow = '';
                inventoryModalElement.style.maxHeight = '';
                inventoryModalElement.style.overflowY = '';
                cleanupModalBackdrops();
            });
        }

        // Cancel button
        const cancelBtn = inventoryModalElement.querySelector('.btn-secondary');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function() {
                inventoryModalElement.style.display = 'none';
                inventoryModalElement.classList.remove('show');
                inventoryModalElement.style.position = '';
                inventoryModalElement.style.top = '';
                inventoryModalElement.style.left = '';
                inventoryModalElement.style.transform = '';
                inventoryModalElement.style.backgroundColor = '';
                inventoryModalElement.style.borderRadius = '';
                inventoryModalElement.style.boxShadow = '';
                inventoryModalElement.style.maxHeight = '';
                inventoryModalElement.style.overflowY = '';
                cleanupModalBackdrops();
            });
        }
    }

    // Reorder modal close buttons
    const reorderModalElement = document.getElementById('reorderInventoryModal');
    if (reorderModalElement) {
        // Close button (X)
        const closeBtn = reorderModalElement.querySelector('.btn-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                reorderModalElement.style.display = 'none';
                reorderModalElement.classList.remove('show');
                cleanupModalBackdrops();
            });
        }

        // Cancel button
        const cancelBtn = reorderModalElement.querySelector('.btn-secondary');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function() {
                reorderModalElement.style.display = 'none';
                reorderModalElement.classList.remove('show');
                cleanupModalBackdrops();
            });
        }
    }
});

window.showAddInventoryModal = function() {
    console.log('showAddInventoryModal called - FUNCTION EXECUTED!');

    // Aggressive cleanup before showing modal
    cleanupModalBackdrops();

    // Force remove any Bootstrap backdrops that might have been created
    const bootstrapBackdrops = document.querySelectorAll('.modal-backdrop.fade.show');
    bootstrapBackdrops.forEach(backdrop => backdrop.remove());

    // Ensure body is not locked
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.body.classList.remove('modal-open');

    clearInventoryModal();
    document.getElementById('inventoryModalLabel').textContent = 'Add Inventory Item';

    // Get the modal element
    const modalElement = document.getElementById('inventoryModal');
    console.log('Modal element found:', modalElement);

    if (!modalElement) {
        console.error('Modal element not found!');
        return;
    }

    // Show modal without backdrop - just the modal itself
    console.log('Setting modal styles...');
    modalElement.style.display = 'block';
    modalElement.style.zIndex = '9999';
    modalElement.classList.add('show');
    modalElement.style.position = 'fixed';
    modalElement.style.top = '50%';
    modalElement.style.left = '50%';
    modalElement.style.transform = 'translate(-50%, -50%)';
    modalElement.style.maxHeight = '90vh';
    modalElement.style.overflowY = 'auto';

    console.log('Modal shown without backdrop');
    console.log('Modal display style:', modalElement.style.display);
    console.log('Modal classes:', modalElement.className);

    // Add click outside modal to close functionality
    modalElement.addEventListener('click', function(e) {
        if (e.target === modalElement) {
            console.log('Clicked outside modal - closing');
            modalElement.style.display = 'none';
            modalElement.classList.remove('show');
            cleanupModalBackdrops();
        }
    });
};

window.showEditInventoryModal = async function(id) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/admin/inventory`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (!response.ok) throw new Error('Failed to fetch inventory');
        const data = await response.json();
        const item = (data.data || []).find(i => i.id == id);
        if (!item) throw new Error('Item not found');
        fillInventoryModal(item);
        document.getElementById('inventoryModalLabel').textContent = 'Edit Inventory Item';

        // Aggressive cleanup before showing modal
        cleanupModalBackdrops();

        // Force remove any Bootstrap backdrops that might have been created
        const bootstrapBackdrops = document.querySelectorAll('.modal-backdrop.fade.show');
        bootstrapBackdrops.forEach(backdrop => backdrop.remove());

        // Ensure body is not locked
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.body.classList.remove('modal-open');

        // Get the modal element
        const modalElement = document.getElementById('inventoryModal');
        console.log('Modal element found:', modalElement);

        if (!modalElement) {
            console.error('Modal element not found!');
            return;
        }

        // Show modal without backdrop - just the modal itself
        modalElement.style.display = 'block';
        modalElement.style.zIndex = '9999';
        modalElement.classList.add('show');
        modalElement.style.position = 'fixed';
        modalElement.style.top = '50%';
        modalElement.style.left = '50%';
        modalElement.style.transform = 'translate(-50%, -50%)';
        modalElement.style.maxHeight = '90vh';
        modalElement.style.overflowY = 'auto';

        console.log('Modal shown without backdrop');
    } catch (error) {
        showError('Error loading inventory item');
        console.error(error);
    } finally {
        hideLoading();
    }
};

function fillInventoryModal(item) {
    document.getElementById('inventoryId').value = item.id;
    document.getElementById('inventoryName').value = item.name;
    document.getElementById('inventoryCategory').value = item.category;
    document.getElementById('inventoryQuantity').value = item.quantity;
    document.getElementById('inventoryUnitPrice').value = item.unit_price;
    document.getElementById('inventoryReorderLevel').value = item.reorder_level;
}

function clearInventoryModal() {
    document.getElementById('inventoryId').value = '';
    document.getElementById('inventoryName').value = '';
    document.getElementById('inventoryCategory').value = '';
    document.getElementById('inventoryQuantity').value = '';
    document.getElementById('inventoryUnitPrice').value = '';
    document.getElementById('inventoryReorderLevel').value = '';
}

// Initialize inventory form handlers
function initializeInventoryForms() {
    console.log('Initializing inventory forms...');

    // Add/Edit Inventory Form
    const inventoryForm = document.getElementById('inventoryForm');
    console.log('Inventory form found:', inventoryForm);

    if (inventoryForm) {
        // Add event listener directly to the form
        inventoryForm.addEventListener('submit', async function(e) {
            console.log('Inventory form submitted - EVENT TRIGGERED!');
            e.preventDefault();
            e.stopPropagation();

            const id = document.getElementById('inventoryId').value;
            const payload = {
                name: document.getElementById('inventoryName').value,
                category: document.getElementById('inventoryCategory').value,
                quantity: document.getElementById('inventoryQuantity').value,
                unitPrice: document.getElementById('inventoryUnitPrice').value,
                reorderLevel: document.getElementById('inventoryReorderLevel').value
            };

            console.log('Form payload:', payload);

            try {
                showLoading();
                let response;
                if (id) {
                    console.log('Updating inventory item with ID:', id);
                    response = await fetch(`${API_BASE_URL}/admin/inventory/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getToken()}`
                        },
                        body: JSON.stringify(payload)
                    });
                } else {
                    console.log('Creating new inventory item');
                    response = await fetch(`${API_BASE_URL}/admin/inventory`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getToken()}`
                        },
                        body: JSON.stringify(payload)
                    });
                }

                console.log('Response status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Response error:', errorText);
                    throw new Error(`Failed to save inventory item: ${response.status}`);
                }

                const result = await response.json();
                console.log('Success result:', result);

                // Close modal manually
                const modalElement = document.getElementById('inventoryModal');
                if (modalElement) {
                    modalElement.style.display = 'none';
                    modalElement.classList.remove('show');
                    modalElement.style.position = '';
                    modalElement.style.top = '';
                    modalElement.style.left = '';
                    modalElement.style.transform = '';
                    modalElement.style.backgroundColor = '';
                    modalElement.style.borderRadius = '';
                    modalElement.style.boxShadow = '';
                    modalElement.style.maxHeight = '';
                    modalElement.style.overflowY = '';
                }

                cleanupModalBackdrops();
                showSuccess(result.message || 'Inventory item saved successfully!');
                await loadInventory();
            } catch (error) {
                console.error('Error in form submission:', error);
                showError('Error saving inventory item: ' + error.message);
            } finally {
                hideLoading();
            }
        });

        console.log('Inventory form event listener attached');

        // Also add click handler to submit button as backup
        const submitBtn = inventoryForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.addEventListener('click', function(e) {
                console.log('Inventory submit button clicked!');
            });
        }

        // Add cancel button functionality
        const cancelBtn = inventoryForm.querySelector('.btn-secondary');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function(e) {
                console.log('Inventory cancel button clicked!');
                e.preventDefault();

                // Close modal manually
                const modalElement = document.getElementById('inventoryModal');
                if (modalElement) {
                    modalElement.style.display = 'none';
                    modalElement.classList.remove('show');
                }

                cleanupModalBackdrops();
            });
        }


    } else {
        console.error('Inventory form not found!');
    }

    // Reorder Inventory Form
    const reorderInventoryForm = document.getElementById('reorderInventoryForm');
    console.log('Reorder inventory form found:', reorderInventoryForm);

    if (reorderInventoryForm) {
        // Add event listener directly to the form
        reorderInventoryForm.addEventListener('submit', async function(e) {
            console.log('Reorder form submitted - EVENT TRIGGERED!');
            e.preventDefault();
            e.stopPropagation();

            const id = document.getElementById('reorderInventoryId').value;
            const quantity = document.getElementById('reorderQuantity').value;

            console.log('Reorder payload:', { id, quantity });

            try {
                showLoading();
                const response = await fetch(`${API_BASE_URL}/admin/inventory/${id}/reorder`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: JSON.stringify({ quantity })
                });

                console.log('Reorder response status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Reorder response error:', errorText);
                    throw new Error(`Failed to reorder inventory: ${response.status}`);
                }

                const result = await response.json();
                console.log('Reorder success result:', result);

                // Close modal manually
                const modalElement = document.getElementById('reorderInventoryModal');
                if (modalElement) {
                    modalElement.style.display = 'none';
                    modalElement.classList.remove('show');
                }

                cleanupModalBackdrops();
                showSuccess(result.message || 'Inventory reordered successfully!');
                await loadInventory();
            } catch (error) {
                console.error('Error in reorder form submission:', error);
                showError('Error reordering inventory: ' + error.message);
            } finally {
                hideLoading();
            }
        });

        console.log('Reorder inventory form event listener attached');

        // Also add click handler to submit button as backup
        const reorderSubmitBtn = reorderInventoryForm.querySelector('button[type="submit"]');
        if (reorderSubmitBtn) {
            reorderSubmitBtn.addEventListener('click', function(e) {
                console.log('Reorder submit button clicked!');
            });
        }

        // Add cancel button functionality
        const reorderCancelBtn = reorderInventoryForm.querySelector('.btn-secondary');
        if (reorderCancelBtn) {
            reorderCancelBtn.addEventListener('click', function(e) {
                console.log('Reorder cancel button clicked!');
                e.preventDefault();

                // Close modal manually
                const modalElement = document.getElementById('reorderInventoryModal');
                if (modalElement) {
                    modalElement.style.display = 'none';
                    modalElement.classList.remove('show');
                }

                cleanupModalBackdrops();
            });
        }


    } else {
        console.error('Reorder inventory form not found!');
    }

    // Use Inventory Form
    const useInventoryForm = document.getElementById('useInventoryForm');
    console.log('Use inventory form found:', useInventoryForm);

    if (useInventoryForm) {
        // Add event listener directly to the form
        useInventoryForm.addEventListener('submit', async function(e) {
            console.log('Use inventory form submitted - EVENT TRIGGERED!');
            e.preventDefault();
            e.stopPropagation();

            const id = document.getElementById('useInventoryId').value;
            const quantity = document.getElementById('useQuantity').value;

            console.log('Use inventory payload:', { id, quantity });

            try {
                showLoading();
                const response = await fetch(`${API_BASE_URL}/admin/inventory/${id}/use`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: JSON.stringify({ quantity })
                });

                console.log('Use inventory response status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Use inventory response error:', errorText);
                    throw new Error(`Failed to use inventory: ${response.status}`);
                }

                const result = await response.json();
                console.log('Use inventory success result:', result);

                // Close modal manually
                const modalElement = document.getElementById('useInventoryModal');
                if (modalElement) {
                    modalElement.style.display = 'none';
                    modalElement.classList.remove('show');
                }

                cleanupModalBackdrops();
                showSuccess(result.message || 'Inventory used successfully!');
                await loadInventory();
            } catch (error) {
                console.error('Error in use inventory form submission:', error);
                showError('Error using inventory: ' + error.message);
            } finally {
                hideLoading();
            }
        });

        console.log('Use inventory form event listener attached');

        // Also add click handler to submit button as backup
        const useSubmitBtn = useInventoryForm.querySelector('button[type="submit"]');
        if (useSubmitBtn) {
            useSubmitBtn.addEventListener('click', function(e) {
                console.log('Use inventory submit button clicked!');
            });
        }

        // Add cancel button functionality
        const useCancelBtn = useInventoryForm.querySelector('.btn-secondary');
        if (useCancelBtn) {
            useCancelBtn.addEventListener('click', function(e) {
                console.log('Use inventory cancel button clicked!');
                e.preventDefault();

                // Close modal manually
                const modalElement = document.getElementById('useInventoryModal');
                if (modalElement) {
                    modalElement.style.display = 'none';
                    modalElement.classList.remove('show');
                }

                cleanupModalBackdrops();
            });
        }


    } else {
        console.error('Use inventory form not found!');
    }
}

// Delete Inventory Item
window.deleteInventoryItem = async function(id) {
    if (!confirm('Are you sure you want to delete this inventory item?')) return;
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/admin/inventory/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (!response.ok) throw new Error('Failed to delete inventory item');
        const result = await response.json();
        showSuccess(result.message || 'Inventory item deleted successfully!');
        await loadInventory();
    } catch (error) {
        showError('Error deleting inventory item');
        console.error(error);
    } finally {
        hideLoading();
    }
};

// Reorder Inventory
window.showUseInventoryModal = function(id) {
    console.log('showUseInventoryModal called with ID:', id);
    document.getElementById('useInventoryId').value = id;
    document.getElementById('useQuantity').value = '';

    // Clean up any existing backdrops first
    cleanupModalBackdrops();

    // Get the modal element
    const modalElement = document.getElementById('useInventoryModal');
    console.log('Use inventory modal element found:', modalElement);

    if (!modalElement) {
        console.error('Use inventory modal element not found!');
        return;
    }

    // Show modal without backdrop - just the modal itself
    modalElement.style.display = 'block';
    modalElement.style.zIndex = '9999';
    modalElement.classList.add('show');
    modalElement.style.position = 'fixed';
    modalElement.style.top = '50%';
    modalElement.style.left = '50%';
    modalElement.style.transform = 'translate(-50%, -50%)';
    modalElement.style.maxHeight = '90vh';
    modalElement.style.overflowY = 'auto';

    console.log('Use inventory modal shown without backdrop');

    // Add click outside modal to close functionality
    modalElement.addEventListener('click', function(e) {
        if (e.target === modalElement) {
            console.log('Clicked outside use inventory modal - closing');
            modalElement.style.display = 'none';
            modalElement.classList.remove('show');
            cleanupModalBackdrops();
        }
    });
};

window.showReorderInventoryModal = function(id) {
    console.log('showReorderInventoryModal called with ID:', id);
    document.getElementById('reorderInventoryId').value = id;
    document.getElementById('reorderQuantity').value = '';

    // Clean up any existing backdrops first
    cleanupModalBackdrops();

    // Get the modal element
    const modalElement = document.getElementById('reorderInventoryModal');
    console.log('Reorder inventory modal element found:', modalElement);

    if (!modalElement) {
        console.error('Reorder inventory modal element not found!');
        return;
    }

    // Show modal without backdrop - just the modal itself
    modalElement.style.display = 'block';
    modalElement.style.zIndex = '9999';
    modalElement.classList.add('show');
    modalElement.style.position = 'fixed';
    modalElement.style.top = '50%';
    modalElement.style.left = '50%';
    modalElement.style.transform = 'translate(-50%, -50%)';
    modalElement.style.maxHeight = '90vh';
    modalElement.style.overflowY = 'auto';

    console.log('Reorder inventory modal shown without backdrop');

    // Add click outside modal to close functionality
    modalElement.addEventListener('click', function(e) {
        if (e.target === modalElement) {
            console.log('Clicked outside reorder inventory modal - closing');
            modalElement.style.display = 'none';
            modalElement.classList.remove('show');
            cleanupModalBackdrops();
        }
    });
};

// Remove old form event listeners - they're now handled in initializeInventoryForms()

// Initialize add inventory button when inventory section is loaded
function initializeAddInventoryButton() {
    const addInventoryBtn = document.getElementById('addInventoryBtn');
    console.log('Add inventory button found:', addInventoryBtn);
    if (addInventoryBtn) {
        // Remove any existing event listeners
        const newBtn = addInventoryBtn.cloneNode(true);
        addInventoryBtn.parentNode.replaceChild(newBtn, addInventoryBtn);

        // Get the new button reference
        const currentBtn = document.getElementById('addInventoryBtn');

        currentBtn.addEventListener('click', function() {
            console.log('Add inventory button clicked!');
            showAddInventoryModal();
        });
        console.log('Add inventory button event listener attached');
    } else {
        console.error('Add inventory button not found!');
    }
}

// Navigation: show inventory section
const inventorySidebarLink = document.querySelector('[data-section="inventory"]');
if (inventorySidebarLink) {
    inventorySidebarLink.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
        document.getElementById('inventory-section').classList.add('active');
        loadInventory();
        initializeAddInventoryButton(); // Initialize the add button
    });
}

// =====================
// Settings Management
// =====================

// Settings Tab Navigation
function initializeSettingsTabs() {
    const settingsNav = document.getElementById('settingsNav');
    if (settingsNav) {
        settingsNav.addEventListener('click', function(e) {
            if (e.target.classList.contains('list-group-item')) {
                e.preventDefault();
                const tab = e.target.getAttribute('data-settings-tab');
                showSettingsTab(tab);
            }
        });
    }
}

function showSettingsTab(tabName) {
    // Update navigation
    document.querySelectorAll('#settingsNav .list-group-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-settings-tab="${tabName}"]`).classList.add('active');

    // Show selected tab content
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(`${tabName}-settings`).classList.add('active');

    // Load settings data for the tab
    loadSettingsData(tabName);
}

async function loadSettingsData(tabName) {
    // Show placeholder message for future implementation
    const tabElement = document.getElementById(`${tabName}-settings`);
    if (tabElement) {
        tabElement.innerHTML = `
            <div class="text-center py-5">
                <div class="mb-4">
                    <i class='bx bxs-cog' style="font-size: 3rem; color: #6c757d;"></i>
                </div>
                <h5>${tabName.charAt(0).toUpperCase() + tabName.slice(1)} Settings</h5>
                <p class="text-muted">
                    This settings section is currently under development and will be available in a future update.
                </p>
                <div class="mt-3">
                    <span class="badge bg-secondary">Coming Soon</span>
                </div>
            </div>
        `;
    }
}

function populateSettingsForm(tabName, data) {
    switch (tabName) {
        case 'clinic':
            document.getElementById('clinicName').value = data.name || '';
            document.getElementById('clinicPhone').value = data.phone || '';
            document.getElementById('clinicEmail').value = data.email || '';
            document.getElementById('clinicAddress').value = data.address || '';
            document.getElementById('clinicCity').value = data.city || '';
            document.getElementById('clinicState').value = data.state || '';
            document.getElementById('clinicZip').value = data.zip || '';
            document.getElementById('clinicWebsite').value = data.website || '';
            break;
        case 'email':
            document.getElementById('smtpHost').value = data.smtpHost || '';
            document.getElementById('smtpPort').value = data.smtpPort || '';
            document.getElementById('smtpUser').value = data.smtpUser || '';
            document.getElementById('smtpPass').value = data.smtpPass || '';
            document.getElementById('fromEmail').value = data.fromEmail || '';
            document.getElementById('fromName').value = data.fromName || '';
            break;
        case 'appointments':
            document.getElementById('businessHoursStart').value = data.businessHoursStart || '09:00';
            document.getElementById('businessHoursEnd').value = data.businessHoursEnd || '17:00';
            document.getElementById('appointmentDuration').value = data.appointmentDuration || 30;
            document.getElementById('advanceBookingDays').value = data.advanceBookingDays || 30;

            // Set working days
            const workingDays = data.workingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
            ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
                const checkbox = document.getElementById(day);
                if (checkbox) {
                    checkbox.checked = workingDays.includes(day);
                }
            });
            break;
        case 'system':
            document.getElementById('emailNotifications').checked = data.emailNotifications !== false;
            document.getElementById('smsNotifications').checked = data.smsNotifications === true;
            document.getElementById('appointmentReminders').checked = data.appointmentReminders !== false;
            document.getElementById('twoFactorAuth').checked = data.twoFactorAuth === true;
            document.getElementById('sessionTimeout').checked = data.sessionTimeout !== false;
            document.getElementById('sessionTimeoutMinutes').value = data.sessionTimeoutMinutes || 60;
            document.getElementById('maxLoginAttempts').value = data.maxLoginAttempts || 5;
            break;
    }
}

// Form Submissions
function initializeSettingsForms() {
    // Clinic Form
    const clinicForm = document.getElementById('clinicForm');
    if (clinicForm) {
        clinicForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await saveSettings('clinic', {
                name: document.getElementById('clinicName').value,
                phone: document.getElementById('clinicPhone').value,
                email: document.getElementById('clinicEmail').value,
                address: document.getElementById('clinicAddress').value,
                city: document.getElementById('clinicCity').value,
                state: document.getElementById('clinicState').value,
                zip: document.getElementById('clinicZip').value,
                website: document.getElementById('clinicWebsite').value
            });
        });
    }

    // Email Form
    const emailForm = document.getElementById('emailForm');
    if (emailForm) {
        emailForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await saveSettings('email', {
                smtpHost: document.getElementById('smtpHost').value,
                smtpPort: document.getElementById('smtpPort').value,
                smtpUser: document.getElementById('smtpUser').value,
                smtpPass: document.getElementById('smtpPass').value,
                fromEmail: document.getElementById('fromEmail').value,
                fromName: document.getElementById('fromName').value
            });
        });
    }

    // Appointment Settings Form
    const appointmentSettingsForm = document.getElementById('appointmentSettingsForm');
    if (appointmentSettingsForm) {
        appointmentSettingsForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const workingDays = [];
            ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
                if (document.getElementById(day).checked) {
                    workingDays.push(day);
                }
            });

            await saveSettings('appointments', {
                businessHoursStart: document.getElementById('businessHoursStart').value,
                businessHoursEnd: document.getElementById('businessHoursEnd').value,
                appointmentDuration: document.getElementById('appointmentDuration').value,
                advanceBookingDays: document.getElementById('advanceBookingDays').value,
                workingDays: workingDays
            });
        });
    }

    // System Form
    const systemForm = document.getElementById('systemForm');
    if (systemForm) {
        systemForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await saveSettings('system', {
                emailNotifications: document.getElementById('emailNotifications').checked,
                smsNotifications: document.getElementById('smsNotifications').checked,
                appointmentReminders: document.getElementById('appointmentReminders').checked,
                twoFactorAuth: document.getElementById('twoFactorAuth').checked,
                sessionTimeout: document.getElementById('sessionTimeout').checked,
                sessionTimeoutMinutes: document.getElementById('sessionTimeoutMinutes').value,
                maxLoginAttempts: document.getElementById('maxLoginAttempts').value
            });
        });
    }
}

async function saveSettings(category, data) {
    // Show placeholder message for future implementation
    showSuccess(`${category.charAt(0).toUpperCase() + category.slice(1)} settings will be available in a future update!`);
}

// Test Email Functionality
function initializeTestEmail() {
    const testEmailBtn = document.getElementById('testEmailBtn');
    if (testEmailBtn) {
        testEmailBtn.addEventListener('click', function() {
            showSuccess('Test email functionality will be available in a future update!');
        });
    }
}

// Backup & Export Functionality
function initializeBackupExport() {
    // Export Appointments
    const exportAppointmentsBtn = document.getElementById('exportAppointmentsBtn');
    if (exportAppointmentsBtn) {
        exportAppointmentsBtn.addEventListener('click', () => exportData('appointments'));
    }

    // Export Patients
    const exportPatientsBtn = document.getElementById('exportPatientsBtn');
    if (exportPatientsBtn) {
        exportPatientsBtn.addEventListener('click', () => exportData('patients'));
    }

    // Export All Data
    const exportAllBtn = document.getElementById('exportAllBtn');
    if (exportAllBtn) {
        exportAllBtn.addEventListener('click', () => exportData('all'));
    }

    // Clear Cache
    const clearCacheBtn = document.getElementById('clearCacheBtn');
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', clearCache);
    }

    // System Info
    const systemInfoBtn = document.getElementById('systemInfoBtn');
    if (systemInfoBtn) {
        systemInfoBtn.addEventListener('click', showSystemInfo);
    }
}

// Build a CSV string from an array of plain row objects (columns = keys of the rows)
function rowsToCsv(rows) {
    if (!Array.isArray(rows) || rows.length === 0) return '';
    // Union of keys across rows so partial rows don't lose columns
    const keys = [...new Set(rows.flatMap(r => Object.keys(r)))];
    const cell = (v) => `"${(v == null ? '' : (typeof v === 'object' ? JSON.stringify(v) : String(v))).replace(/"/g, '""')}"`;
    const lines = [keys.map(cell).join(',')];
    rows.forEach(r => lines.push(keys.map(k => cell(r[k])).join(',')));
    return lines.join('\n');
}

// Trigger a browser download of a CSV string
function downloadCsvFile(filename, csv) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Export raw datasets (appointments / patients / medical-records / audit-logs / inventory / all) to CSV downloads
window.exportData = async function(type) {
    const today = new Date().toISOString().slice(0, 10);

    // Fetch a dataset and normalise the various response shapes to an array of rows
    const fetchRows = async(path) => {
        const res = await fetch(`${API_BASE_URL}/admin/${path}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (!res.ok) throw new Error(`Failed to fetch ${path}`);
        const data = await res.json();
        if (Array.isArray(data)) return data;
        return data.appointments || data.logs || data.inventory || data.data || [];
    };

    try {
        showLoading();
        let exported = 0;
        const exportOne = async(path, query, filename) => {
            const rows = await fetchRows(query ? `${path}?${query}` : path);
            if (rows.length) {
                downloadCsvFile(filename, rowsToCsv(rows));
                exported++;
            }
        };

        if (type === 'appointments' || type === 'all') {
            // High limit so we get every appointment, not just the first page
            await exportOne('appointments', 'page=1&limit=100000', `appointments-${today}.csv`);
        }
        if (type === 'patients' || type === 'all') {
            await exportOne('patients', '', `patients-${today}.csv`);
        }
        if (type === 'medical-records' || type === 'all') {
            // High limit so we get every record, not just the first page
            await exportOne('medical-records', 'page=1&limit=100000', `medical-records-${today}.csv`);
        }
        if (type === 'inventory' || type === 'all') {
            await exportOne('inventory', '', `inventory-${today}.csv`);
        }
        if (type === 'services' || type === 'all') {
            await exportOne('services', '', `services-${today}.csv`);
        }
        if (type === 'audit-logs') {
            // The audit-logs endpoint caps limit at 500, so page through it to get everything.
            // Respect the active category filter.
            const entity = document.getElementById('auditEntityFilter') ?
                document.getElementById('auditEntityFilter').value : '';
            const pageSize = 500;
            let offset = 0;
            let allLogs = [];
            while (true) {
                const query = `limit=${pageSize}&offset=${offset}${entity ? `&entity=${encodeURIComponent(entity)}` : ''}`;
                const res = await fetch(`${API_BASE_URL}/admin/audit-logs?${query}`, {
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                });
                if (!res.ok) throw new Error('Failed to fetch audit-logs');
                const { logs, total } = await res.json();
                allLogs = allLogs.concat(logs || []);
                offset += pageSize;
                if (!logs || logs.length < pageSize || allLogs.length >= total) break;
            }
            if (allLogs.length) {
                downloadCsvFile(`audit-logs-${today}.csv`, rowsToCsv(allLogs));
                exported++;
            }
        }

        if (exported === 0) {
            showError('No data available to export.');
        } else {
            showSuccess('Export complete. Check your downloads.');
        }
    } catch (error) {
        showError('Error exporting data');
        console.error(error);
    } finally {
        hideLoading();
    }
};

async function clearCache() {
    showSuccess('Cache clearing functionality will be available in a future update!');
}

async function showSystemInfo() {
    showSuccess('System information will be available in a future update!');
}

// Initialize Settings
function initializeSettings() {
    initializeSettingsTabs();
    initializeSettingsForms();
    initializeTestEmail();
    initializeBackupExport();

    // Load initial settings
    loadSettingsData('clinic');
}

// Navigation: show settings section
const settingsSidebarLink = document.querySelector('[data-section="settings"]');
if (settingsSidebarLink) {
    settingsSidebarLink.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
        document.getElementById('settings-section').classList.add('active');
        initializeSettings();
    });
}

// Appointment Management Functions
async function loadServicesDropdown() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/services`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load services');
        
        const data = await response.json();
        const serviceSelect = document.getElementById('serviceId');
        
        if (serviceSelect) {
            serviceSelect.innerHTML = '<option value="">Select Service</option>';
            data.forEach(service => {
                serviceSelect.innerHTML += `<option value="${service.id}">${service.name}</option>`;
            });
        }
    } catch (error) {
        console.error('Error loading services:', error);
        showError('Failed to load services');
    }
}

async function showAddAppointmentModal() {
    // Use the showAppointmentModal function from appointments.js for consistency
    if (typeof showAppointmentModal === 'function') {
        await showAppointmentModal();
    } else {
        // Fallback if appointments.js is not loaded
        const modal = new bootstrap.Modal(document.getElementById('appointmentModal'));
        document.getElementById('appointmentModalLabel').textContent = 'Add New Appointment';
        document.getElementById('appointmentForm').reset();
        document.getElementById('appointmentId').value = '';
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('appointmentDate').value = today;
        
        // Set default time to current time + 1 hour
        const now = new Date();
        now.setHours(now.getHours() + 1);
        const timeString = now.toTimeString().slice(0, 5);
        document.getElementById('appointmentTime').value = timeString;
        
        // Load services dropdown
        await loadServicesDropdown();
        
        modal.show();
    }
}

function initializeAddAppointmentButton() {
    const addAppointmentBtn = document.getElementById('addAppointmentBtn');
    if (addAppointmentBtn) {
        addAppointmentBtn.addEventListener('click', showAddAppointmentModal);
    }
}

function initializeAppointmentForms() {
    const appointmentForm = document.getElementById('appointmentForm');
    if (appointmentForm) {
        // Prevent double submission
        let isSubmitting = false;
        
        // Auto-title-case on blur for key fields
        ['clientName', 'petName', 'petBreed'].forEach(function(fieldId) {
            const el = document.getElementById(fieldId);
            if (el) {
                el.addEventListener('blur', function() {
                    el.value = toTitleCase(el.value.trim());
                });
            }
        });

        appointmentForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                // Prevent double submission
                if (isSubmitting) {
                    return;
                }
                
                isSubmitting = true;
                
                try {
                const normalizedClientName = toTitleCase(document.getElementById('clientName').value.trim());
                const normalizedPetName = toTitleCase(document.getElementById('petName').value.trim());
                const normalizedPetBreed = toTitleCase(document.getElementById('petBreed').value.trim());

                // Reflect back normalized values for UI consistency
                document.getElementById('clientName').value = normalizedClientName;
                document.getElementById('petName').value = normalizedPetName;
                document.getElementById('petBreed').value = normalizedPetBreed;

                const formData = {
                    client_name: normalizedClientName,
                    client_email: document.getElementById('clientEmail').value,
                    client_phone: document.getElementById('clientPhone').value,
                    pet_name: normalizedPetName,
                    pet_type: document.getElementById('petType').value,
                    pet_breed: normalizedPetBreed,
                    service_id: document.getElementById('serviceId').value,
                    appointment_date: document.getElementById('appointmentDate').value,
                    appointment_time: document.getElementById('appointmentTime').value,
                    status: document.getElementById('status').value,
                    price: document.getElementById('price').value,
                    payment_status: document.getElementById('paymentStatus').value,
                    notes: document.getElementById('notes').value
                };
                
                // Validate price field
                if (!formData.price || parseFloat(formData.price) <= 0) {
                    showError('Please enter a valid price greater than 0');
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/admin/appointments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok) {
                    // Close modal first - using multiple fallback methods
                    const modalElement = document.getElementById('appointmentModal');
                    if (modalElement) {
                        // Method 1: Try jQuery first (most reliable)
                        if (typeof $ !== 'undefined') {
                            try {
                                $(modalElement).modal('hide');
                            } catch (e) {
                                console.log('jQuery modal close failed, trying manual close');
                            }
                        }
                        
                        // Method 2: Manual close (always works)
                        modalElement.style.display = 'none';
                        modalElement.classList.remove('show');
                        document.body.classList.remove('modal-open');
                        
                        // Remove backdrop
                        const backdrops = document.querySelectorAll('.modal-backdrop');
                        backdrops.forEach(backdrop => backdrop.remove());
                        
                        // Remove modal-open class from body
                        document.body.classList.remove('modal-open');
                    }
                    
                    // Reset form
                    appointmentForm.reset();
                    
                    // Show success message
                    showSuccess('Appointment created successfully!');
                    
                    // Reload appointments and dashboard stats
                    await loadAppointments();
                    loadDashboardStats(); // Refresh dashboard stats including monthly revenue
                } else {
                    showError(result.message || 'Failed to create appointment');
                }
            } catch (error) {
                console.error('Error in appointment form submission:', error);
                // Only show error if it's not a modal-related error
                if (!error.message || (!error.message.includes('Modal') && !error.message.includes('bootstrap'))) {
                    showError('Error creating appointment');
                }
            } finally {
                isSubmitting = false;
            }
        });
    }

    // Initialize reschedule form
    const rescheduleForm = document.getElementById('rescheduleForm');
    if (rescheduleForm) {
        let isRescheduleSubmitting = false;
        
        rescheduleForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Prevent double submission
            if (isRescheduleSubmitting) {
                return;
            }
            
            isRescheduleSubmitting = true;
            
            try {
                const appointmentId = document.getElementById('rescheduleAppointmentId').value;
                const newDate = document.getElementById('rescheduleDate').value;
                const newTime = document.getElementById('rescheduleTime').value;
                
                const formData = {
                    appointment_date: newDate,
                    appointment_time: newTime
                };

                const response = await fetch(`${API_BASE_URL}/admin/appointments/${appointmentId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok) {
                    // Close modal first
                    const modalElement = document.getElementById('rescheduleModal');
                    if (modalElement) {
                        // Method 1: Try jQuery first (most reliable)
                        if (typeof $ !== 'undefined') {
                            try {
                                $(modalElement).modal('hide');
                            } catch (e) {
                                console.log('jQuery modal close failed, trying manual close');
                            }
                        }
                        
                        // Method 2: Manual close (always works)
                        modalElement.style.display = 'none';
                        modalElement.classList.remove('show');
                        document.body.classList.remove('modal-open');
                        
                        // Remove backdrop
                        const backdrops = document.querySelectorAll('.modal-backdrop');
                        backdrops.forEach(backdrop => backdrop.remove());
                        
                        // Remove modal-open class from body
                        document.body.classList.remove('modal-open');
                    }
                    
                    // Reset form
                    rescheduleForm.reset();
                    
                    // Show success message
                    showSuccess('Appointment rescheduled successfully!');
                    
                    // Reload appointments
                    await loadAppointments();
                } else {
                    showError(result.message || 'Failed to reschedule appointment');
                }
            } catch (error) {
                console.error('Error in reschedule form submission:', error);
                showError('Error rescheduling appointment');
            } finally {
                isRescheduleSubmitting = false;
            }
        });
    }

    // Initialize complete appointment functionality
    window.completeAppointment = function(id) {
        if (confirm('Are you sure you want to mark this appointment as completed?')) {
            completeAppointmentStatus(id);
        }
    };

    async function completeAppointmentStatus(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/appointments/${id}`, {
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
                // Reload appointments to update the table
                if (typeof loadAppointments === 'function') {
                    await loadAppointments();
                }
            } else {
                throw new Error('Failed to complete appointment');
            }
        } catch (error) {
            console.error('Error completing appointment:', error);
            showError('Failed to complete appointment');
        }
    }

    // Medical Records Management
    async function loadMedicalRecords(search = '') {
        try {
            showTableLoading('medicalRecordsTableBody', 'Loading medical records...');
            
            let url = `${API_BASE_URL}/admin/medical-records`;
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
            console.error('Error loading medical records:', error);
            showError('Error loading medical records');
            showTableLoading('medicalRecordsTableBody', 'Error loading medical records');
        }
    }

    // Expose for any external calls used in navigation handlers
    window.loadMedicalRecords = loadMedicalRecords;

    function renderMedicalRecordsTable(records) {
        const tbody = document.getElementById('medicalRecordsTableBody');
        
        if (!tbody) {
            console.error('Medical records table body not found!');
            return;
        }
        
        tbody.innerHTML = '';

        if (!records.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No medical records found.</td></tr>';
            return;
        }

        records.forEach(record => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatDate(record.record_date)}</td>
                <td>${record.patient_name}</td>
                <td>${record.owner_name}</td>
                <td>${record.diagnosis}</td>
                <td>${record.treatment}</td>
                <td>${record.vet_name || 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-info me-1" onclick="viewMedicalRecord(${record.id})" title="View">
                        <i class='bx bx-show'></i>
                    </button>
                    <button class="btn btn-sm btn-primary me-1" onclick="editMedicalRecord(${record.id})" title="Edit">
                        <i class='bx bx-edit'></i>
                    </button>
                    <button class="btn btn-sm btn-danger me-1" onclick="deleteMedicalRecord(${record.id})" title="Delete">
                        <i class='bx bx-trash'></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

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

            // Load patients dropdown
            await loadPatientsDropdown();

            // Show modal
            const bootstrapModal = new bootstrap.Modal(modal);
            bootstrapModal.show();
        }
    }

    // Show edit medical record modal
    async function showEditMedicalRecordModal(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/medical-records/${id}`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            if (!response.ok) throw new Error('Failed to load medical record');

            const record = await response.json();
            
            // Fill form with record data
            fillMedicalRecordForm(record);
            
            // Load patients dropdown
            await loadPatientsDropdown();
            
            // Update modal title
            document.getElementById('medicalRecordModalLabel').textContent = 'Edit Medical Record';
            
            // Show modal
            const modal = document.getElementById('medicalRecordModal');
            const bootstrapModal = new bootstrap.Modal(modal);
            bootstrapModal.show();
        } catch (error) {
            showError('Error loading medical record');
            console.error(error);
        }
    }

    // Load patients dropdown
    async function loadPatientsDropdown() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/patients`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            if (!response.ok) throw new Error('Failed to load patients');

            const patients = await response.json();
            const select = document.getElementById('recordPatient');
            const searchInput = document.getElementById('recordPatientSearch');
            if (!select) return;

            function renderOptions(list) {
                const previousValue = select.value;
                select.innerHTML = '<option value="">Select Patient</option>';
                list.forEach(patient => {
                    const option = document.createElement('option');
                    option.value = patient.id;
                    option.textContent = `${patient.pet_name} (${patient.client_name})`;
                    option.dataset.pet = patient.pet_name || '';
                    option.dataset.owner = patient.client_name || '';
                    option.dataset.phone = patient.client_phone || patient.phone || '';
                    option.dataset.species = patient.pet_type || '';
                    option.dataset.breed = patient.pet_breed || '';
                    option.dataset.age = (patient.pet_age !== undefined && patient.pet_age !== null) ? patient.pet_age : '';
                    select.appendChild(option);
                });
                // Restore previous selection if still present
                if (previousValue) {
                    select.value = previousValue;
                }
            }

            // Initial render
            renderOptions(patients);

            // Hook up client-side search filter
            if (searchInput) {
                searchInput.oninput = function() {
                    const q = this.value.toLowerCase();
                    const filtered = patients.filter(p =>
                        (p.pet_name || '').toLowerCase().includes(q) ||
                        (p.client_name || '').toLowerCase().includes(q) ||
                        (p.pet_type || '').toLowerCase().includes(q) ||
                        (p.pet_breed || '').toLowerCase().includes(q)
                    );
                    renderOptions(filtered);
                    // Trigger autofill based on current selection after filtering
                    if (select.value) {
                        applySelectionToForm();
                    }
                };
            }

            function applySelectionToForm() {
                const selectedOption = select.options[select.selectedIndex];
                if (!selectedOption || !selectedOption.value) {
                    return;
                }
                const formEl = document.getElementById('medicalRecordForm');
                if (!formEl) return;
                const ownerNameEl = formEl.querySelector('#ownerName');
                const ownerPhoneEl = formEl.querySelector('#ownerPhone');
                const petSpeciesEl = formEl.querySelector('#petSpecies');
                const petBreedEl = formEl.querySelector('#petBreed');
                if (ownerNameEl) ownerNameEl.value = selectedOption.dataset.owner || ownerNameEl.value;
                if (ownerPhoneEl) ownerPhoneEl.value = selectedOption.dataset.phone || ownerPhoneEl.value;
                if (petSpeciesEl) petSpeciesEl.value = selectedOption.dataset.species || petSpeciesEl.value;
                if (petBreedEl) petBreedEl.value = selectedOption.dataset.breed || petBreedEl.value;
                setAgeInputs(parseFloat(selectedOption.dataset.age) || 0);
            }

            // Autofill on change
            select.addEventListener('change', applySelectionToForm);

            // If a value was preselected (e.g., editing), autofill now
            if (select.value) {
                applySelectionToForm();
            }
        } catch (error) {
            console.error('Error loading patients:', error);
        }
    }

    // Fill medical record form
    function fillMedicalRecordForm(record) {
        document.getElementById('recordId').value = record.id;
        document.getElementById('recordPatient').value = record.patient_id || '';
        document.getElementById('recordDate').value = record.record_date;
        document.getElementById('ownerName').value = record.owner_name || '';
        document.getElementById('ownerPhone').value = record.owner_phone || '';
        document.getElementById('petSpecies').value = record.pet_species || '';
        document.getElementById('petBreed').value = record.pet_breed || '';
        setAgeInputs(parseFloat(record.pet_age) || 0);
        document.getElementById('recordDiagnosis').value = record.diagnosis || '';
        document.getElementById('recordTreatment').value = record.treatment || '';
        document.getElementById('recordPrescription').value = record.prescription || '';
        document.getElementById('recordNotes').value = record.notes || '';
    }

    // Initialize medical record form
    function initializeMedicalRecordForm() {
        const form = document.getElementById('medicalRecordForm');
        if (form) {
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const patientSelect = document.getElementById('recordPatient');
                const selectedOption = patientSelect ? patientSelect.options[patientSelect.selectedIndex] : null;
                const derivedPatientName = selectedOption ? (selectedOption.dataset.pet || (selectedOption.textContent || '').split(' (')[0]) : '';

                const formData = {
                    patient_id: document.getElementById('recordPatient').value,
                    patient_name: derivedPatientName || null,
                    record_date: document.getElementById('recordDate').value,
                    owner_name: document.getElementById('ownerName').value,
                    owner_phone: document.getElementById('ownerPhone').value,
                    pet_species: document.getElementById('petSpecies').value,
                    pet_breed: document.getElementById('petBreed').value,
                    pet_age: getAgeFromInputs(),
                    diagnosis: document.getElementById('recordDiagnosis').value,
                    treatment: document.getElementById('recordTreatment').value,
                    prescription: document.getElementById('recordPrescription').value,
                    notes: document.getElementById('recordNotes').value
                };

                const recordId = document.getElementById('recordId').value;
                const isEdit = recordId !== '';

                try {
                    const url = isEdit 
                        ? `${API_BASE_URL}/admin/medical-records/${recordId}`
                        : `${API_BASE_URL}/admin/medical-records`;
                    
                    const method = isEdit ? 'PUT' : 'POST';

                    const response = await fetch(url, {
                        method: method,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getToken()}`
                        },
                        body: JSON.stringify(formData)
                    });

                    if (response.ok) {
                        showSuccess(`Medical record ${isEdit ? 'updated' : 'created'} successfully!`);
                        
                        // Close modal
                        const modal = document.getElementById('medicalRecordModal');
                        let bsModal = null;
                        try {
                            if (bootstrap && bootstrap.Modal) {
                                if (typeof bootstrap.Modal.getOrCreateInstance === 'function') {
                                    bsModal = bootstrap.Modal.getOrCreateInstance(modal);
                                } else if (typeof bootstrap.Modal.getInstance === 'function') {
                                    bsModal = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
                                } else {
                                    bsModal = new bootstrap.Modal(modal);
                                }
                            }
                        } catch (e) {
                            // fallback ignored
                        }
                        if (bsModal && typeof bsModal.hide === 'function') {
                            bsModal.hide();
                        } else {
                            // Try triggering native close button
                            const closeBtn = modal.querySelector('.btn-close,[data-bs-dismiss="modal"]');
                            if (closeBtn) {
                                closeBtn.click();
                            }
                            // Fallback manual close
                            modal.classList.remove('show');
                            modal.setAttribute('aria-hidden', 'true');
                            modal.style.display = 'none';
                            document.body.classList.remove('modal-open');
                            document.body.style.overflow = '';
                            document.body.style.paddingRight = '';
                            const backdrops = document.querySelectorAll('.modal-backdrop');
                            backdrops.forEach(b => b.remove());
                        }
                        
                        // Reload medical records
                        await loadMedicalRecords();
                    } else {
                        const error = await response.json();
                        throw new Error(error.message || 'Failed to save medical record');
                    }
                } catch (error) {
                    showError(error.message);
                    console.error('Error saving medical record:', error);
                }
            });
        }
    }

    // Initialize add medical record button
    function initializeAddMedicalRecordButton() {
        const addBtn = document.getElementById('addRecordBtn');
        if (addBtn) {
            addBtn.addEventListener('click', showAddMedicalRecordModal);
        }
    }

    // Initialize medical record search
    function initializeMedicalRecordSearch() {
        const searchInput = document.getElementById('recordSearch');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    loadMedicalRecords(this.value);
                }, 500);
            });
        }
    }

    // Global functions for medical records
    window.editMedicalRecord = function(id) {
        showEditMedicalRecordModal(id);
    };

    window.deleteMedicalRecord = function(id) {
        if (confirm('Are you sure you want to delete this medical record? This action cannot be undone.')) {
            deleteMedicalRecordById(id);
        }
    };

    window.viewMedicalRecord = async function(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/medical-records/${id}`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (!response.ok) throw new Error('Failed to load record');
            const record = await response.json();
            ensureViewRecordModal();
            fillViewRecordModal(record);
            const modal = new bootstrap.Modal(document.getElementById('viewRecordModal'));
            modal.show();
        } catch (e) {
            showError('Failed to load record');
            console.error(e);
        }
    }

    function ensureViewRecordModal() {
        if (document.getElementById('viewRecordModal')) return;
        const modalHtml = `
        <div class="modal fade" id="viewRecordModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Medical Record</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <div class="row g-3">
                  <div class="col-md-6"><strong>Date:</strong> <span id="vrDate"></span></div>
                  <div class="col-md-6"><strong>Vet:</strong> <span id="vrVet"></span></div>
                  <div class="col-md-6"><strong>Patient:</strong> <span id="vrPatient"></span></div>
                  <div class="col-md-6"><strong>Owner:</strong> <span id="vrOwner"></span></div>
                  <div class="col-md-6"><strong>Owner Phone:</strong> <span id="vrOwnerPhone"></span></div>
                  <div class="col-md-6"><strong>Species:</strong> <span id="vrSpecies"></span></div>
                  <div class="col-md-6"><strong>Breed:</strong> <span id="vrBreed"></span></div>
                  <div class="col-12"><strong>Diagnosis:</strong><div id="vrDiagnosis" class="border rounded p-2 mt-1"></div></div>
                  <div class="col-12"><strong>Treatment:</strong><div id="vrTreatment" class="border rounded p-2 mt-1"></div></div>
                  <div class="col-12"><strong>Prescription:</strong><div id="vrPrescription" class="border rounded p-2 mt-1"></div></div>
                  <div class="col-12"><strong>Notes:</strong><div id="vrNotes" class="border rounded p-2 mt-1"></div></div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    function fillViewRecordModal(r) {
        const byId = (id) => document.getElementById(id);
        byId('vrDate').textContent = r.record_date || '';
        byId('vrVet').textContent = r.vet_name || 'N/A';
        byId('vrPatient').textContent = r.patient_name || '';
        byId('vrOwner').textContent = r.owner_name || '';
        byId('vrOwnerPhone').textContent = r.owner_phone || '';
        byId('vrSpecies').textContent = r.pet_species || '';
        byId('vrBreed').textContent = r.pet_breed || '';
        byId('vrDiagnosis').textContent = r.diagnosis || '';
        byId('vrTreatment').textContent = r.treatment || '';
        byId('vrPrescription').textContent = r.prescription || '';
        byId('vrNotes').textContent = r.notes || '';
    }

    async function deleteMedicalRecordById(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/medical-records/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            if (response.ok) {
                showSuccess('Medical record deleted successfully!');
                await loadMedicalRecords();
            } else {
                throw new Error('Failed to delete medical record');
            }
        } catch (error) {
            showError('Error deleting medical record');
            console.error(error);
        }
    }

    // Initialize medical records functionality
    function initializeMedicalRecords() {
        initializeMedicalRecordForm();
        initializeAddMedicalRecordButton();
        initializeMedicalRecordSearch();
        // Ensure records load immediately without requiring a search
        try {
            loadMedicalRecords('');
        } catch (e) {
            console.warn('Initial medical records load failed:', e);
        }
    }

    // Add medical records initialization to the main initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initializeMedicalRecords();
        });
    } else {
        initializeMedicalRecords();
    }

}

// ─── Audit Log ───────────────────────────────────────────────────────────────

let auditOffset = 0;
const AUDIT_PAGE_SIZE = 50;
let auditTotal = 0;
let auditInitialized = false;

function initAuditLog() {
    if (auditInitialized) { loadAuditLogs(); return; }
    auditInitialized = true;

    document.getElementById('auditEntityFilter').addEventListener('change', () => {
        auditOffset = 0;
        loadAuditLogs();
    });
    document.getElementById('auditRefreshBtn').addEventListener('click', () => {
        auditOffset = 0;
        loadAuditLogs();
    });
    document.getElementById('auditPrevBtn').addEventListener('click', () => {
        if (auditOffset >= AUDIT_PAGE_SIZE) {
            auditOffset -= AUDIT_PAGE_SIZE;
            loadAuditLogs();
        }
    });
    document.getElementById('auditNextBtn').addEventListener('click', () => {
        if (auditOffset + AUDIT_PAGE_SIZE < auditTotal) {
            auditOffset += AUDIT_PAGE_SIZE;
            loadAuditLogs();
        }
    });

    loadAuditLogs();
}

async function loadAuditLogs() {
    const tbody = document.getElementById('auditLogTableBody');
    const entity = document.getElementById('auditEntityFilter').value;
    tbody.innerHTML = '<tr><td colspan="6" class="text-center"><div class="spinner-border spinner-border-sm text-primary"></div></td></tr>';

    try {
        const params = new URLSearchParams({ limit: AUDIT_PAGE_SIZE, offset: auditOffset });
        if (entity) params.set('entity', entity);
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/admin/audit-logs?${params}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch audit logs');
        const { logs, total } = await res.json();
        auditTotal = total;

        if (!logs.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No log entries found.</td></tr>';
        } else {
            tbody.innerHTML = logs.map(log => `
                <tr>
                    <td class="text-nowrap small">${formatAuditDateTime(log.created_at)}</td>
                    <td class="small">${log.user_name || '—'}</td>
                    <td><span class="badge bg-${log.user_role === 'admin' ? 'danger' : 'info'}">${log.user_role || '—'}</span></td>
                    <td>${auditActionBadge(log.action)}</td>
                    <td class="small text-capitalize">${(log.entity || '').replace('_', ' ')}</td>
                    <td class="small">${log.description || ''}</td>
                </tr>
            `).join('');
        }

        const from = auditTotal === 0 ? 0 : auditOffset + 1;
        const to = Math.min(auditOffset + AUDIT_PAGE_SIZE, auditTotal);
        document.getElementById('auditLogCount').textContent = `Showing ${from}–${to} of ${auditTotal} entries`;
        document.getElementById('auditPrevBtn').disabled = auditOffset === 0;
        document.getElementById('auditNextBtn').disabled = auditOffset + AUDIT_PAGE_SIZE >= auditTotal;
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Failed to load audit logs.</td></tr>`;
        console.error('Audit log load error:', err);
    }
}

function auditActionBadge(action) {
    const map = { CREATE: 'success', UPDATE: 'warning', DELETE: 'danger' };
    return `<span class="badge bg-${map[action] || 'secondary'}">${action || '—'}</span>`;
}

function formatAuditDateTime(ts) {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}