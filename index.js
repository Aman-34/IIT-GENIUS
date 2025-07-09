function sendMail() {
    // Validate form fields
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;
    
    if (!name || !email || !message) {
        alert("Please fill in all required fields");
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("Please enter a valid email address");
        return;
    }

    const params = {
        name: name,
        email: email,
        message: message
    };

    const serviceID = "service_hivjdx9";
    const templateID = "template_nboqg42";

    emailjs.send(serviceID, templateID, params)
        .then(response => {
            // Clear form
            document.getElementById("contactForm").reset();
            
            // Show success message
            alert("Your message has been sent successfully!");
            
            // Log response (for debugging)
            console.log("Email sent successfully:", response);
        })
        .catch(error => {
            // Show error message
            alert("There was an error sending your message. Please try again later.");
            
            // Log error (for debugging)
            console.error("Email send error:", error);
        });
}