document.addEventListener("DOMContentLoaded", function() {
    var showButton = document.getElementById("showSettingsPopup");
    var closeButton = document.getElementById("closeSettingsPopup");
    var popup = document.getElementById("settingsPopup");
    console.log("DOMContentLoaded event fired")
    // Check if buttons and popup exist in the DOM
    if(showButton && closeButton && popup) {
        showButton.addEventListener("click", function(event) {
            event.preventDefault();
            popup.classList.remove("hidden");
        });

        closeButton.addEventListener("click", function(event) {
            event.preventDefault();
            popup.classList.add("hidden");
        });
    } else {
        console.error("Buttons or popup not found");
    }
    document.addEventListener("submit", function(event) {
        if (event.target && event.target.id === 'settingsForm') {
            event.preventDefault(); // prevent page reload
            var form = document.getElementById("settingsForm");
            
            if(form) {
                console.log("form is not none")
                var formData = new FormData(form);
                formData.append('action', 'my_ajax_action');  // Append action

                fetch(ajaxurl, {
                    method: 'POST',
                    body: formData,
                })
                .then(function(response) {
                    return response.json();
                })
                .then(function(data) {
                    console.log(data);
                })
                .catch(function(error) {
                    console.error("Error:", error);
                });
            } else {
                console.error("Form not found");
            }
        }
    });
});
