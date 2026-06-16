document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    console.log("✅ App.js Loaded Successfully");

    // 🔹 Ensure Home, Services, and About Sections Load
    if (!document.getElementById("home") || !document.getElementById("services") || !document.getElementById("about")) {
        console.error("❌ Home/Services/About Sections Missing!");
    }

    const homeSection = document.getElementById("home");
    const servicesSection = document.getElementById("services");
    const aboutSection = document.getElementById("about");

    if (homeSection) {
        console.log("✅ Home section found!");
    } else {
        console.error("❌ Home section missing in HTML!");
    }

    if (servicesSection) {
        console.log("✅ Services section found!");
    } else {
        console.error("❌ Services section missing in HTML!");
    }

    if (aboutSection) {
        console.log("✅ About section found!");
    } else {
        console.error("❌ About section missing in HTML!");
    }


    // 🔹 Handle Back to Top Button
    const backToTopButton = document.getElementById("backToTop");
    if (backToTopButton) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 200) {
                backToTopButton.classList.add("visible");
            } else {
                backToTopButton.classList.remove("visible");
            }
        });

        backToTopButton.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // 🔹 Handle Login
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async(e) => {
            e.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            try {
                const res = await fetch(window.API_BASE_URL + '/auth/login', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();
                if (res.ok) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("role", data.role);

                    // Redirect based on role
                    if (data.role === "admin") {
                        window.location.href = "/frontend/pages/admin/dashboard.html";
                    } else if (data.role === "vet") {
                        window.location.href = "/frontend/pages/vet_dashboard.html";
                    } else {
                        window.location.href = "/frontend/pages/client_dashboard.html";
                    }
                } else {
                    alert(data.error || "Login failed");
                }
            } catch (err) {
                console.error("Login error:", err);
                alert("Something went wrong");
            }
        });
    }

    // 🔹 Handle Query Form Submission
    const submitQueryBtn = document.getElementById("submitQuery");
    if (submitQueryBtn) {
        submitQueryBtn.addEventListener("click", async() => {
            const name = document.getElementById("queryName").value;
            const email = document.getElementById("queryEmail").value;
            const message = document.getElementById("queryMessage").value;

            // Validate required fields
            if (!name || !email || !message) {
                alert("Please fill in all fields");
                return;
            }

            try {
                const res = await fetch(window.API_BASE_URL + '/queries/submit', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, message })
                });

                const data = await res.json();
                if (res.ok) {
                    alert("Query submitted successfully! We'll get back to you soon.");
                    document.getElementById("queryForm").reset();
                } else {
                    alert(data.error || "Failed to submit query");
                }
            } catch (err) {
                console.error("Query submission error:", err);
                alert("Something went wrong while submitting your query");
            }
        });
    }

    // 🔹 Handle Newsletter Subscription
    const newsletterForm = document.getElementById("newsletterForm");
    if (newsletterForm) {
        newsletterForm.addEventListener("submit", async(e) => {
            e.preventDefault();
            const email = document.getElementById("newsletterEmail").value;

            try {
                const res = await fetch(window.API_BASE_URL + '/newsletter/subscribe', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email })
                });

                const data = await res.json();
                if (res.ok) {
                    alert("Successfully subscribed to our newsletter!");
                    newsletterForm.reset();
                } else {
                    if (data.error === "Already subscribed") {
                        alert("You are already subscribed to our newsletter!");
                    } else {
                        alert(data.error || "Failed to subscribe to newsletter");
                    }
                }
            } catch (err) {
                console.error("Newsletter subscription error:", err);
                alert("Something went wrong while subscribing to the newsletter");
            }
        });
    }

    // 🔹 Handle Registering a Vet
    const registerVetForm = document.getElementById("registerVetForm");
    if (registerVetForm) {
        registerVetForm.addEventListener("submit", async(e) => {
            e.preventDefault();
            const vetName = document.getElementById("vetName").value;
            const vetEmail = document.getElementById("vetEmail").value;
            const vetPassword = document.getElementById("vetPassword").value;

            if (!token) {
                alert("You must be logged in as an admin.");
                return;
            }

            try {
                const res = await fetch(window.API_BASE_URL + '/auth/register-vet', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ name: vetName, email: vetEmail, password: vetPassword })
                });

                if (res.ok) {
                    alert("Vet account created successfully!");
                    window.location.reload();
                } else {
                    alert("Failed to create vet account.");
                }
            } catch (err) {
                console.error("Vet registration error:", err);
                alert("Something went wrong.");
            }
        });
    }

    // 🔹 Handle "Book an Appointment" Button
    const bookAppointmentBtn = document.getElementById("bookAppointment");
    if (bookAppointmentBtn) {
        bookAppointmentBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (!token) {
                window.location.href = "./pages/login.html";
            } else {
                window.location.href = "./pages/client_dashboard.html";
            }
        });
    }
});