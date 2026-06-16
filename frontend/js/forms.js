// Newsletter Form Handler
document.getElementById('newsletterForm').addEventListener('submit', async(e) => {
    e.preventDefault();

    const email = document.getElementById('newsletterEmail').value;

    try {
        const response = await fetch(window.API_BASE_URL + '/newsletter/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Successfully subscribed to newsletter!');
            document.getElementById('newsletterEmail').value = '';
        } else {
            // Only show error if it's not a duplicate subscription
            if (data.error !== "Already subscribed") {
                alert(data.error || 'Failed to subscribe to newsletter');
            } else {
                alert('You are already subscribed to our newsletter!');
            }
        }
    } catch (error) {
        console.error('Error:', error);
        // Don't show error alert to user, just log it
    }
});

// Query Form Handler
document.getElementById('queryForm').addEventListener('submit', async(e) => {
    e.preventDefault();

    const name = document.getElementById('queryName').value;
    const email = document.getElementById('queryEmail').value;
    const message = document.getElementById('queryMessage').value;

    try {
        const response = await fetch(window.API_BASE_URL + '/queries/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, message })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Your query has been submitted successfully!');
            document.getElementById('queryName').value = '';
            document.getElementById('queryEmail').value = '';
            document.getElementById('queryMessage').value = '';
        } else {
            // Only show error if it's a real error
            if (data.error && !data.error.includes("already exists")) {
                alert(data.error || 'Failed to submit query');
            }
        }
    } catch (error) {
        console.error('Error:', error);
        // Don't show error alert to user, just log it
    }
});