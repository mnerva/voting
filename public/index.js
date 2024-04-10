// Attach event listener to the create button
document.getElementById("loginButton").addEventListener("click", function(event) {
    showFormContainer(); // Show the form container and hide the "Login" button
    document.getElementById("messageBox").style.display = "none"; // Hide the message box if it's visible
});