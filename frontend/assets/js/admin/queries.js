// Queries Management JavaScript
$(document).ready(function() {
            let currentQueries = [];
            let currentPage = 1;
            let queriesPerPage = 10;
            let totalQueries = 0;

            // Initialize queries section
            let queriesInitialized = false;

            function initializeQueries() {
                if (queriesInitialized) {
                    loadQueries();
                    return;
                }

                loadQueries();
                setupEventListeners();
                setupFilters();
                queriesInitialized = true;
            }

            // Load queries with pagination and filtering
            async function loadQueries(page = 1, filters = {}) {
                try {
                    showLoading();

                    const queryParams = new URLSearchParams({
                        page: page,
                        limit: queriesPerPage,
                        ...filters
                    });

                    const response = await fetch(`${window.API_BASE_URL}/queries?${queryParams}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Failed to load queries');
                    }

                    const data = await response.json();
                    currentQueries = data.queries || data;
                    totalQueries = data.total || currentQueries.length;
                    currentPage = page;

                    renderQueriesTable();
                    renderPagination();
                    updateStats(data.stats);
                } catch (error) {
                    console.error('Error loading queries:', error);
                    showError('Failed to load queries');
                } finally {
                    hideLoading();
                }
            }

            // Render queries table
            function renderQueriesTable() {
                const tbody = $('#queriesTableBody');
                let html = '';

                if (currentQueries.length === 0) {
                    html = `
                <tr>
                    <td colspan="7" class="text-center text-muted">
                        <i class='bx bx-message-square-dots fs-1'></i>
                        <p class="mt-2">No queries found</p>
                    </td>
                </tr>
            `;
                } else {
                    currentQueries.forEach(query => {
                                const statusBadge = getStatusBadge(query.status);
                                const priorityClass = getPriorityClass(query.status);

                                html += `
                    <tr class="${priorityClass}">
                        <td>${formatDate(query.created_at)}</td>
                        <td>
                            <div class="d-flex align-items-center">
                                <div class="avatar-sm me-2">
                                    <i class='bx bxs-user-circle fs-4'></i>
                                </div>
                                <div>
                                    <strong>${escapeHtml(query.name)}</strong>
                                    <br><small class="text-muted">${escapeHtml(query.email)}</small>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="message-preview">
                                ${escapeHtml(query.message.length > 60 ? query.message.substring(0, 60) + '...' : query.message)}
                            </div>
                        </td>
                        <td>${statusBadge}</td>
                        <td>
                            <div class="btn-group" role="group">
                                <button class="btn btn-sm btn-outline-primary view-query-btn" 
                                        data-id="${query.id}" 
                                        title="View Details">
                                    <i class='bx bx-show'></i>
                                </button>
                                ${query.status !== 'resolved' ? `
                                    <button class="btn btn-sm btn-outline-success mark-resolved-btn" 
                                            data-id="${query.id}" 
                                            title="Mark as Resolved">
                                        <i class='bx bx-check'></i>
                                    </button>
                                ` : ''}
                                <button class="btn btn-sm btn-outline-info reply-query-btn" 
                                        data-id="${query.id}" 
                                        title="Reply">
                                    <i class='bx bx-reply'></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger delete-query-btn" 
                                        data-id="${query.id}" 
                                        title="Delete">
                                    <i class='bx bx-trash'></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
        }

        tbody.html(html);
    }

    // Get status badge HTML
    function getStatusBadge(status) {
        const statusConfig = {
            'new': { class: 'warning', text: 'New', icon: 'bx-time' },
            'in_progress': { class: 'info', text: 'In Progress', icon: 'bx-loader-alt' },
            'resolved': { class: 'success', text: 'Resolved', icon: 'bx-check-circle' }
        };

        const config = statusConfig[status] || statusConfig['new'];
        return `<span class="badge bg-${config.class}">
                    <i class='bx ${config.icon}'></i> ${config.text}
                </span>`;
    }

    // Get priority class for row styling
    function getPriorityClass(status) {
        switch (status) {
            case 'new': return 'table-warning';
            case 'in_progress': return 'table-info';
            case 'resolved': return 'table-success';
            default: return '';
        }
    }

    // Render pagination
    function renderPagination() {
        const totalPages = Math.ceil(totalQueries / queriesPerPage);
        const pagination = $('#queriesPagination');
        
        if (totalPages <= 1) {
            pagination.html('');
            return;
        }

        let html = '<ul class="pagination pagination-sm">';
        
        // Previous button
        html += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                html += `
                    <li class="page-item ${i === currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }

        // Next button
        html += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
            </li>
        `;

        html += '</ul>';
        pagination.html(html);
        
        // Update showing info
        const start = totalQueries > 0 ? ((currentPage - 1) * queriesPerPage) + 1 : 0;
        const end = Math.min(currentPage * queriesPerPage, totalQueries);
        $('#showingStart').text(start);
        $('#showingEnd').text(end);
        $('#totalShowing').text(totalQueries);
    }

    // Update statistics
    function updateStats(stats = null) {
        if (!stats) {
            // Fallback to counting current queries if no stats provided
            stats = {
                total: currentQueries.length,
                new: currentQueries.filter(q => q.status === 'new').length,
                in_progress: currentQueries.filter(q => q.status === 'in_progress').length,
                resolved: currentQueries.filter(q => q.status === 'resolved').length
            };
        }

        // Update all statistics cards
        $('#totalQueriesCount').text(stats.total || 0);
        $('#newQueriesCount').text(stats.new || 0);
        $('#inProgressCount').text(stats.in_progress || 0);
        $('#resolvedCount').text(stats.resolved || 0);
    }

    // Setup event listeners
    function setupEventListeners() {
        // View query details
        $(document).on('click', '.view-query-btn', function() {
            const id = $(this).data('id');
            viewQueryDetails(id);
        });

        // Mark as resolved
        $(document).on('click', '.mark-resolved-btn', function() {
            const id = $(this).data('id');
            updateQueryStatus(id, 'resolved');
        });

        // Reply to query
        $(document).on('click', '.reply-query-btn', function() {
            const id = $(this).data('id');
            showReplyModal(id);
        });

        // Reply button inside view modal
        $(document).on('click', '#replyFromViewBtn', function() {
            const id = $(this).data('id');
            $('#queryModal').modal('hide');
            showReplyModal(id);
        });

        // Delete query
        $(document).on('click', '.delete-query-btn', function() {
            const id = $(this).data('id');
            showDeleteConfirmation(id);
        });

        // Pagination
        $(document).on('click', '.pagination .page-link', function(e) {
            e.preventDefault();
            const page = $(this).data('page');
            if (page && page > 0) {
                loadQueries(page, getCurrentFilters());
            }
        });

        // Items per page
        $('#queriesPerPage').on('change', function() {
            queriesPerPage = parseInt($(this).val());
            loadQueries(1, getCurrentFilters());
        });

        // Refresh button
        $('#refreshQueries').on('click', function() {
            loadQueries(currentPage, getCurrentFilters());
        });

        // Export button
        $('#exportQueries').on('click', function() {
            exportQueries();
        });
    }

    // Setup filters
    function setupFilters() {
        // Status filter
        $('#statusFilter').on('change', function() {
            loadQueries(1, getCurrentFilters());
        });

        // Search filter
        let searchTimeout;
        $('#querySearch').on('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                loadQueries(1, getCurrentFilters());
            }, 500);
        });

        // Date range filter
        $('#dateRangeFilter').on('change', function() {
            loadQueries(1, getCurrentFilters());
        });
    }

    // Get current filters
    function getCurrentFilters() {
        return {
            status: $('#statusFilter').val(),
            search: $('#querySearch').val(),
            dateRange: $('#dateRangeFilter').val()
        };
    }

    // View query details
    async function viewQueryDetails(id) {
        try {
            const query = currentQueries.find(q => q.id == id);
            if (!query) {
                showError('Query not found');
                return;
            }

            // Populate modal
            $('#queryDate').text(formatDate(query.created_at));
            $('#queryFrom').text(query.name);
            $('#queryEmail').text(query.email);
            $('#querySubject').text('Customer Query'); // Since we don't have subject field
            $('#queryMessage').text(query.message);
            $('#replyFromViewBtn').data('id', query.id);

            // Show modal
            $('#queryModal').modal('show');
        } catch (error) {
            console.error('Error viewing query:', error);
            showError('Failed to load query details');
        }
    }

    // Update query status
    async function updateQueryStatus(id, status) {
        try {
            const response = await fetch(`${window.API_BASE_URL}/queries/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                throw new Error('Failed to update query status');
            }

            showSuccess(`Query marked as ${status}`);
            loadQueries(currentPage, getCurrentFilters());
        } catch (error) {
            console.error('Error updating query status:', error);
            showError('Failed to update query status');
        }
    }

    // Show reply modal
    function showReplyModal(id) {
        const query = currentQueries.find(q => q.id == id);
        if (!query) return;

        $('#replyQueryId').val(id);
        $('#replyToEmail').val(query.email);
        $('#replyToName').val(query.name);
        $('#replyMessage').val('');
        $('#replyModal').modal('show');
    }

    // Send reply
    async function sendReply() {
        const id = $('#replyQueryId').val();
        const replyMessage = $('#replyMessage').val();

        if (!replyMessage.trim()) {
            showError('Please enter a reply message');
            return;
        }

        try {
            const response = await fetch(`${window.API_BASE_URL}/queries/${id}/reply`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ replyMessage })
            });

            if (!response.ok) {
                throw new Error('Failed to send reply');
            }

            showSuccess('Reply sent successfully');
            $('#replyModal').modal('hide');
            loadQueries(currentPage, getCurrentFilters());
        } catch (error) {
            console.error('Error sending reply:', error);
            showError('Failed to send reply');
        }
    }

    // Export queries to CSV
    async function exportQueries() {
        try {
            showLoading();
            
            // Get all queries without pagination for export
            const queryParams = new URLSearchParams({
                limit: 10000, // Large limit to get all queries
                ...getCurrentFilters()
            });

            const response = await fetch(`${window.API_BASE_URL}/queries?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch queries for export');
            }

            const data = await response.json();
            const queries = data.queries || data;

            // Convert to CSV
            const csvContent = convertToCSV(queries);
            
            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `queries_export_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showSuccess('Queries exported successfully');
        } catch (error) {
            console.error('Error exporting queries:', error);
            showError('Failed to export queries');
        } finally {
            hideLoading();
        }
    }

    // Convert queries data to CSV format
    function convertToCSV(queries) {
        const headers = ['ID', 'Date', 'Name', 'Email', 'Message', 'Status'];
        const csvRows = [headers.join(',')];

        queries.forEach(query => {
            const row = [
                query.id,
                formatDateForCSV(query.created_at),
                `"${query.name.replace(/"/g, '""')}"`,
                query.email,
                `"${query.message.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
                query.status
            ];
            csvRows.push(row.join(','));
        });

        return csvRows.join('\n');
    }

    // Format date for CSV export
    function formatDateForCSV(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Delete query
    let isDeleting = false;
    let deleteQueryId = null;
    
    function showDeleteConfirmation(id) {
        deleteQueryId = id;
        $('#deleteConfirmModal').modal('show');
    }
    
    async function deleteQuery(id) {
        if (isDeleting) return; // Prevent double execution
        
        isDeleting = true;
        
        try {
            const response = await fetch(`${window.API_BASE_URL}/queries/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete query');
            }

            showSuccess('Query deleted successfully');
            loadQueries(currentPage, getCurrentFilters());
            $('#deleteConfirmModal').modal('hide');
        } catch (error) {
            console.error('Error deleting query:', error);
            showError('Failed to delete query');
        } finally {
            isDeleting = false;
        }
    }

    // Utility functions
    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showLoading() {
        // Add loading indicator
        if (!$('#queriesLoading').length) {
            $('#queries-section').prepend('<div id="queriesLoading" class="text-center py-3"><div class="spinner-border" role="status"></div></div>');
        }
    }

    function hideLoading() {
        $('#queriesLoading').remove();
    }

    function showSuccess(message) {
        const alert = $(`
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `);
        $('#queries-section').prepend(alert);
        setTimeout(() => alert.alert('close'), 3000);
    }

    function showError(message) {
        const alert = $(`
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `);
        $('#queries-section').prepend(alert);
    }

    // Initialize when queries section is shown
    $('[data-section="queries"]').on('click', function() {
        $('.content-section').removeClass('active');
        $('#queries-section').addClass('active');
        initializeQueries();
    });

    // Handle reply form submission
    $('#replyForm').on('submit', function(e) {
        e.preventDefault();
        sendReply();
    });

    // Handle delete confirmation
    $('#confirmDeleteBtn').on('click', function() {
        if (deleteQueryId) {
            deleteQuery(deleteQueryId);
        }
    });
});