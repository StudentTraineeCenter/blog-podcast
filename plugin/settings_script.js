document.addEventListener("DOMContentLoaded", function() {
    var showButton = document.getElementById("showSettingsPopup");
    var closeButton = document.getElementById("closeSettingsPopup");
    var popup = document.getElementById("settingsPopup");

    showButton.addEventListener("click", function() {
        popup.classList.remove("hidden");
    });

    closeButton.addEventListener("click", function() {
        popup.classList.add("hidden");
    });
});
