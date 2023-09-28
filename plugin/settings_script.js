// Dual mode for special tags
const { addFilter } = wp.hooks;
const { createHigherOrderComponent } = wp.compose;

const addSpecialClass = createHigherOrderComponent((BlockEdit) => {
    return (props) => {
        // Check if the block has a 'content' attribute
        if (props.attributes && props.attributes.content) {

            let newContent = props.attributes.content.replace(/(?!<span class="tts-tag">)\/break (\d+)ms(?!<\/span>)/g, '<span class="tts-tag">/break $1ms</span>');
            newContent = newContent.replace(/(?!<span class="tts-tag">)\/emp ([^']+) '([^']+)'(?!<\/span>)/g, '<span class="tts-tag">/emp $1 \'</span>$2<span class="tts-tag">\'</span>');
            if (props.attributes.content != newContent) {
                console.log(newContent);
            }
            props.setAttributes({ content: newContent });
        }
        const result = wp.element.createElement(BlockEdit,props);

        return result;
      
    
    };
  }, 'addSpecialClass');
  
addFilter('editor.BlockEdit', 'tts/add-special-class', addSpecialClass);




document.addEventListener("DOMContentLoaded", function() {
    var showButton = document.getElementById("showSettingsPopup");
    var closeButton = document.getElementById("closeSettingsPopup");
    var popup = document.getElementById("settingsPopup");
    var tagToggle = document.getElementById("TagToggle");
    console.log("DOMContentLoaded event fired")
    // Check if buttons and popup exist in the DOM
    if(showButton && closeButton && popup && tagToggle) {
        let active = false;
        tagToggle.addEventListener('click', function() {
            const specialTags = document.querySelectorAll('.tts-tag');
            active = !active;
            specialTags.forEach(function(tag) {
                if (active == true) {
                    tag.style.display = 'inline';
                } else {
                    tag.style.display = 'none';
                }
            });
        });

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
            var inputs = settingsContainer.querySelectorAll("input[type='text'], input[type='range'], input[type='radio']");
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