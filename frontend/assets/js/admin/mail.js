$(document).ready(function() {
    // Show queries section when sidebar clicked
    $('[data-section="queries"]').on('click', function() {
        $('.content-section').removeClass('active');
        $('#queries-section').addClass('active');
        loadQueries();
    });

    // Load queries
    function loadQueries() {
        $.get('/api/queries', function(queries) {
            let rows = '';
            queries.forEach(query => {
                rows += `
                    <tr class="${query.status === 'unread' ? 'table-warning' : ''}">
                        <td>${new Date(query.created_at).toLocaleString()}</td>
                        <td>${query.name}</td>
                        <td>${query.email}</td>
                        <td>${query.subject}</td>
                        <td>${query.message.length > 40 ? query.message.substring(0, 40) + '...' : query.message}</td>
                        <td>${query.status}</td>
                        <td>
                            <button class="btn btn-sm btn-info view-query-btn" data-id="${query.id}">View</button>
                            <button class="btn btn-sm btn-success mark-complete-btn" data-id="${query.id}" ${query.status === 'complete' ? 'disabled' : ''}>Mark as Complete</button>
                            <button class="btn btn-sm btn-danger delete-query-btn" data-id="${query.id}">Delete</button>
                        </td>
                    </tr>
                `;
            });
            $('#queriesTableBody').html(rows);
        });
    }

    // View query
    $(document).on('click', '.view-query-btn', function() {
        const id = $(this).data('id');
        $.get('/api/queries', function(queries) {
            const query = queries.find(q => q.id == id);
            if (query) {
                $('#queryDate').text(new Date(query.created_at).toLocaleString());
                $('#queryFrom').text(query.name);
                $('#queryEmail').text(query.email);
                $('#querySubject').text(query.subject);
                $('#queryMessage').text(query.message);
                $('#queryModal').modal('show');
            }
        });
    });

    // Mark as complete
    $(document).on('click', '.mark-complete-btn', function() {
        const id = $(this).data('id');
        $.ajax({
            url: `/api/queries/${id}`,
            type: 'PATCH',
            contentType: 'application/json',
            data: JSON.stringify({ status: 'complete' }),
            success: loadQueries
        });
    });

    // Delete query
    $(document).on('click', '.delete-query-btn', function() {
        const id = $(this).data('id');
        if (confirm('Are you sure you want to delete this query?')) {
            $.ajax({
                url: `/api/queries/${id}`,
                type: 'DELETE',
                success: loadQueries
            });
        }
    });

    // Optionally, load queries on page load
    // loadQueries();
});