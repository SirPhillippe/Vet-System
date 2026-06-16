document.addEventListener("DOMContentLoaded", () => {
    console.log("Query form script loaded");

    const submitQueryBtn = document.getElementById("submitQuery");
    console.log("Submit button element:", submitQueryBtn);

    if (submitQueryBtn) {
        // Clone and replace the button to remove all existing event listeners
        const newSubmitBtn = submitQueryBtn.cloneNode(true);
        submitQueryBtn.parentNode.replaceChild(newSubmitBtn, submitQueryBtn);

        // Add single event listener to the new button
        newSubmitBtn.addEventListener("click", async() => {
            const name = document.getElementById("queryName").value;
            const email = document.getElementById("queryEmail").value;
            const message = document.getElementById("queryMessage").value;

            // Validate required fields
            if (!name || !email || !message) {
                alert("Please fill in all fields");
                return;
            }

            try {
                const res = await fetch("http://localhost:5000/api/queries/submit", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, message })
                });

                const data = await res.json();

                if (res.ok) {
                    alert("Query submitted successfully! We'll get back to you soon.");
                    // Clear the form fields manually
                    document.getElementById("queryName").value = "";
                    document.getElementById("queryEmail").value = "";
                    document.getElementById("queryMessage").value = "";
                } else {
                    alert(data.error || "Failed to submit query");
                }
            } catch (err) {
                console.error("Query submission error:", err);
                alert("Something went wrong while submitting your query");
            }
        });
    } else {
        console.error("Submit button not found!");
    }
});