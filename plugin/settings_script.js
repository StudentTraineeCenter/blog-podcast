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
    var manualSubmitButton = document.getElementById("manualSubmit");
    if (manualSubmitButton) {
        manualSubmitButton.addEventListener("click", function() {
            var settingsContainer = document.getElementById("settingsContainer");
            var inputs = settingsContainer.querySelectorAll("input[type='text']");
            var formData = new FormData();
            var postId = document.querySelector("#post_ID").value;  // Get post ID from hidden field
            inputs.forEach(function(input) {
                formData.append(input.name, input.value);
            });
            if (formData) {
                formData.append('action', 'my_ajax_action');  // Append action
                formData.append('post_id', postId);  // Append post ID
                console.log("Recieved parameters")
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
                console.error("Settings conatiner not found");
            }
        });
    }
});