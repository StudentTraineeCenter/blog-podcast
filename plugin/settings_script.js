// Dual mode for special tags
const { addFilter } = wp.hooks;
const { createHigherOrderComponent } = wp.compose;
// Remove the class when needed
function checkAndRemoveClasses(props) {
    let content = props.attributes.content;
    let parser = new DOMParser();
    let doc = parser.parseFromString(content, 'text/html');
    // emp
    const firstSpans = doc.querySelectorAll('[data-level]');
    const secondSpans = doc.querySelectorAll('[data-quote="true"]');
    // Break
    const thirdSpans = doc.querySelectorAll('[data-time]')
    // txt
    const fourthSpans = doc.querySelectorAll('[data-text]')
    
    let changed = false;
    // emp
    firstSpans.forEach((span) => {
        let isValid = /\/emp \w+ '/.test(span.textContent);
        if (!isValid) {
            span.outerHTML = span.textContent;
            changed = true;
        }
    });
  
    secondSpans.forEach((span) => {
        let isValid = /'/.test(span.textContent);
        if (!isValid) {
            span.outerHTML = span.textContent;
            changed = true;
        }
    });
    // break
    thirdSpans.forEach((span) => {
        let isValid = /\/break \d+ms/.test(span.textContent);
        if (!isValid) {
            span.outerHTML = span.textContent;
            changed = true;
        }
    });
    // txt
    fourthSpans.forEach((span) => {
        let isValid = /\/txt ;([^;<\/]+);/.test(span.textContent);
        if (!isValid) {
            span.outerHTML = span.textContent;
            changed = true;
        }
    });
  
    if (changed) {
        props.setAttributes({ content: doc.body.innerHTML });
    }
}
const addSpecialClass = createHigherOrderComponent((BlockEdit) => {
    return (props) => {
        // Check if the block has a 'content' attribute
        if (props.attributes && props.attributes.content) {
            // Wrap break -one <span>
            let newContent = props.attributes.content.replace(/(?!<span class="tts-tag" data-time="\d+ms">)\/break (\d+)ms(?!<\/span>)/g, '<span class="tts-tag" data-time="$1ms">/break $1ms</span>');
            // Wrap emp -two <span>
            newContent = newContent.replace(/(?!<span class="tts-tag" data-level="[^"]+">)\/emp ([^']+) '([^']+)'(?!<\/span>)/g, '<span class="tts-tag" data-level="$1">/emp $1 \'</span>$2<span class="tts-tag" data-quote="true">\'</span>');
            // Wrap txt -one <span>
            newContent = newContent.replace(/(?!<span class="tts-tag" data-text="true">)\/txt ;([^;<\/]+);(?!<\/span>)/g, '<span class="tts-tag" data-text="true">/txt ;$1;</span>');
            if (props.attributes.content != newContent) {
                console.log(newContent);
            }
            props.setAttributes({ content: newContent });
        }
        checkAndRemoveClasses(props);
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
            var language = settingsContainer.querySelector("input[name='language']:checked").value;
            var gender = settingsContainer.querySelector("input[name='gender']:checked").value;
            var speed = settingsContainer.querySelector("input[name='speed']").value;
            var alttext = settingsContainer.querySelector("input[name='alttext']").checked ? "true" : "false";
            var volume =  settingsContainer.querySelector("select[name='volume']").value;
            var formData = new FormData();
            var postId = document.querySelector("#post_ID").value;  // Get post ID from hidden field
            var inputs = [
                {name: 'language', value: language},
                {name: 'gender', value: gender},
                {name: 'speed', value: speed},
                {name: 'alttext', value: alttext},
                {name: 'volume', value: volume}
            ];
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