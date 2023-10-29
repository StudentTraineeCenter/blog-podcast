// Used in the settings page for the whole plugin
// Function to expand the input box with text inside it 
function autoExpand(input) {  
    input.style.width = 'auto';
    let stretchedWidth = input.scrollWidth;
    stretchedWidth += 10;
    input.style.width = stretchedWidth + 'px';
}
// Toggle hidden password
function togglePasswordVisibility() {
    var inputElement = document.getElementById("azure_key");
    if (inputElement.type === "password") {
      inputElement.type = "text";
    } else {
      inputElement.type = "password";
    }
}
var key_show_button = document.getElementById("key_visibility");
if (key_show_button) {
    key_show_button.addEventListener("click",togglePasswordVisibility);
}
// Check the url to see if editing a post or not, if its a post then run the rest of the javascript
if (window.location.href.indexOf('/post.php')=== -1) {
    const specialTags1 = document.querySelectorAll('.tts-tag');
    specialTags1.forEach(function(tag) {
        tag.style.display = 'none';
    });
} else { 
// Setup to edit the blockEdit function
const { addFilter } = wp.hooks;
const { createHigherOrderComponent } = wp.compose;

// Remove the class when a part of the needed regex is missing 
// This is to prevent nested classes and generally adds robustness
function checkAndRemoveClasses(props) {
    let content = props.attributes.content;
    let parser = new DOMParser();
    let doc = parser.parseFromString(content, 'text/html');
    // emp
    const empSpans = Array.from(doc.querySelectorAll('[data-level]'));
    // '
    const quoteSpans = Array.from(doc.querySelectorAll('[data-quote]'));
    // break
    const breakSpans = Array.from(doc.querySelectorAll('[data-time]'));
    // read
    const readSpans = Array.from(doc.querySelectorAll('[data-text]'));
    // audio
    const audioSpans = Array.from(doc.querySelectorAll('[data-audio]'));
    // noread
    const noreadSpans = Array.from(doc.querySelectorAll('[data-noread]'));
    // voice
    const voiceSpans = Array.from(doc.querySelectorAll('[data-voice]'));
    let changed = false;
    // emp
    empSpans.forEach((span) => {
        let isValid = /\{emp\s+\w+\s+'/.test(span.textContent);
        if (!isValid) {
            let nextSibling = span.nextElementSibling;
            console.log(nextSibling)
            if (nextSibling && nextSibling.getAttribute('data-quote')) {
                nextSibling.outerHTML = nextSibling.textContent;
            }
            span.outerHTML = span.textContent;
            changed = true;
        }
    });
    // '
    quoteSpans.forEach((span) => {
        let isValid = /'\}/.test(span.textContent);
        if (!isValid) {
            let previousSibling = span.previousElementSibling;
            console.log(previousSibling);
            if (previousSibling && (previousSibling.hasAttribute('data-level') || previousSibling.hasAttribute('data-noread'))) {
                previousSibling.outerHTML = previousSibling.textContent;
            }
            span.outerHTML = span.textContent;
            changed = true;
        }
    });
    // break
    breakSpans.forEach((span) => {
        let isValid = /\{break\s+\d+ms\}/.test(span.textContent);
        if (!isValid) {
            span.outerHTML = span.textContent;
            changed = true;
        }
    });
    // read
    readSpans.forEach((span) => {
        let isValid = /\{read\s+[^']*\s*'[^']+'\}/.test(span.textContent);
        if (!isValid) {
            span.outerHTML = span.textContent;
            changed = true;
        }
    });
    // audio
    audioSpans.forEach((span) => {
        let isValid = /\{audio\s+'[^']+'\}/.test(span.textContent);
        if (!isValid) {
            span.outerHTML = span.textContent;
            changed = true;
        }
    });
    // noread
    noreadSpans.forEach((span) => {
        let isValid = /\{noread\s+'/.test(span.textContent);
        if (!isValid) {
            let nextSibling = span.nextElementSibling;
            console.log(nextSibling)
            if (nextSibling && nextSibling.getAttribute('data-quote')) {
                nextSibling.outerHTML = nextSibling.textContent;
            }
            span.outerHTML = span.textContent;
            changed = true;
        }
    });
    // voice
    voiceSpans.forEach((span) => {
        let isValid = /\{voice\s+'[^']+'\}/.test(span.textContent);
        if (!isValid) {
            span.outerHTML = span.textContent;
            changed = true;
        }
    });
  
    if (changed) {
        props.setAttributes({ content: doc.body.innerHTML });
    }
}
// Function that adds the class when the proper regex is registered, together with the class removal
// Debounce to improve the performance
let debouncedFunction = _.debounce(function(props) {
    if (props.attributes && props.attributes.content) {
        // Wrap break -one <span>
        let newContent = props.attributes.content.replace(/(?!<span class="tts-tag" data-time="true">)\{break (\d+)ms\}(?!<\/span>)/g, '<span class="tts-tag" data-time="true">{break $1ms}</span>');
        // Wrap emp -two <span>
        newContent = newContent.replace(/(?!<span class="tts-tag" data-level="true">)\{emp\s+([^']+)\s+'([^']+)'\}(?!<\/span>)/g, '<span class="tts-tag" data-level="true">{emp $1 \'</span>$2<span class="tts-tag" data-quote="true">\'}</span>');
        // Wrap read -one <span>
        newContent = newContent.replace(/(?!<span class="tts-tag" data-text="true">)\{read\s+([^']*)\s*'([^']+)'\}(?!<\/span>)/g, function(match,p1,p2) {
            const dataText = p1 ? p1 + " " : "";
            return `<span class="tts-tag" data-text="true">{read ${dataText}'${p2}'}</span>`;
        });        
        // Wrap audio -one <span>
        newContent = newContent.replace(/(?!<span class="tts-tag" data-audio="true">)\{audio\s+'([^']+)'\}(?!<\/span>)/g, '<span class="tts-tag" data-audio="true">{audio \'$1\'}</span>');
        // Wrap text not to be read but be visible -one <span>
        newContent = newContent.replace(/(?!<span class="tts-tag" data-noread="true">)\{noread\s+'([^']+)'\}(?!<\/span>)/g, '<span class="tts-tag" data-noread="true">{noread \'</span>$1<span class="tts-tag" data-quote="true">\'}</span>');
        // Wrap voice -one <span>
        newContent = newContent.replace(/(?!<span class="tts-tag" data-voice="true">)\{voice\s+'([^']+)'\}(?!<\/span>)/g, '<span class="tts-tag" data-voice="true">{voice \'$1\'}</span>');
        if (props.attributes.content != newContent) {
            console.log(newContent);
        }
        props.setAttributes({ content: newContent });
    }
    checkAndRemoveClasses(props)
}, 300); 

// edit the BlockEdit 
const addSpecialClass = createHigherOrderComponent((BlockEdit) => {
    return (props) => {
        // Check if the block has a 'content' attribute
        debouncedFunction(props)
        const result = wp.element.createElement(BlockEdit,props);
        return result;
    };
}, 'addSpecialClass');

addFilter('editor.BlockEdit', 'tts/add-special-class', addSpecialClass);

// Text to speech menu to customize the voice file 
document.addEventListener("DOMContentLoaded", function() {
    var popup = document.getElementById("settingsPopup");
    var tagToggle = document.getElementById("TagToggle");
    console.log("DOMContentLoaded event fired")
    // Check if buttons and popup exist in the DOM
    if(popup && tagToggle) {
        let active = true;
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
        // Show the speed value next to the slider
        var speed_slider = document.getElementById("speed");
        var speed_value = document.getElementById("speed_value");
        function change_speed_value() {
            var speed_set = settingsContainer.querySelector("input[name='speed']").value;
            speed_value.textContent = speed_set + "%" ;
        }
        speed_slider.addEventListener('input', change_speed_value);
    } else {
        console.error("Buttons or popup not found");
    }
    // Send the gathered options and the text of the post to the php using ajax 
    var manualSubmitButton = document.getElementById("manualSubmit");
    if (manualSubmitButton) {
        manualSubmitButton.addEventListener("click", function(e) {
            document.getElementById("loading").style.display = "block"; // Show that its loading
            var settingsContainer = document.getElementById("settingsContainer");
            var language = settingsContainer.querySelector("input[name='language']:checked").value;
            var gender = settingsContainer.querySelector("input[name='gender']:checked").value;
            var speed = settingsContainer.querySelector("input[name='speed']").value;
            var alttext = settingsContainer.querySelector("input[name='alttext']").checked ? "true" : "false";
            var volume =  settingsContainer.querySelector("select[name='volume']").value;
            var file_name = settingsContainer.querySelector("input[name=name_box]").value;
            // Check for invalid filenames
            const reservedCharacters = /[\/\\:\*\?"<>\|]/;
            if (reservedCharacters.test(file_name)) {
                e.preventDefault();
                document.getElementById("error").innerText = 'Invalid filename!';
                setTimeout(function() {
                    document.getElementById("error").innerText = " ";
                  }, 2000);
                document.getElementById("loading").style.display = "none";
                return; 
              }
            var formData = new FormData();
            var postId = document.querySelector("#post_ID").value;  // Get post ID from hidden field
            var inputs = [
                {name: 'language', value: language},
                {name: 'gender', value: gender},
                {name: 'speed', value: speed},
                {name: 'alttext', value: alttext},
                {name: 'volume', value: volume},
                {name: 'file_name', value: file_name}
            ];
            inputs.forEach(function(input) {
                formData.append(input.name, input.value);
            });
            if (formData) {
                formData.append('action', 'my_ajax_action');  // Append action
                formData.append('post_id', postId);  // Append post ID
                // Use the ajax to ping the php 
                fetch(ajaxurl, {
                    method: 'POST',
                    body: formData,
                })
                .then(function(response) {
                    document.getElementById("loading").style.display = "none"; // Hide the loading element
                    return response.json();
                })
                .then(function(data) {
                    console.log(data);
                    if (data.success) {
                        document.getElementById("file_save").style.display = "block"; // Show successful file save
                        setTimeout(function() {
                            document.getElementById("file_save").style.display = "none";
                          }, 2000);
                    } else {
                        var error_message = data.data.message;
                        document.getElementById("something_wrong").innerText = error_message;
                        setTimeout(function() {
                            document.getElementById("something_wrong").innerText = "";
                        }, 3000);
                    }
                })
                .catch(function(error) {
                    document.getElementById("loading").style.display = "none"; // Stop the loading if there is an error
                    console.error("Error:", error);
                });
            } else {
                console.error("Settings container not found");
            }
        });
    }
});
}