// Function to expand the input box with text inside it 
function autoExpand(input) {  
    input.style.width = 'auto';
    let stretchedWidth = input.scrollWidth;
    stretchedWidth += 10;
    input.style.width = stretchedWidth + 'px';
}
// Show hidden password
function togglePasswordVisibility() {
    var inputElement = document.getElementById("azure_key");
    if (inputElement.type === "password") {
      inputElement.type = "text";
    } else {
      inputElement.type = "password";
    }
}
var key_show_button = document.getElementById("key_visibility");
key_show_button.addEventListener("click",togglePasswordVisibility);

// Check the url to see if editing a post or not
if (window.location.href.indexOf('/post.php')=== -1) {
    const specialTags1 = document.querySelectorAll('.tts-tag');
    specialTags1.forEach(function(tag) {
        tag.style.display = 'none';
    });
} else { 
// Dual mode for special tags
const { addFilter } = wp.hooks;
const { createHigherOrderComponent } = wp.compose;

// Remove the class when needed
function checkAndRemoveClasses(props) {
    let content = props.attributes.content;
    let parser = new DOMParser();
    let doc = parser.parseFromString(content, 'text/html');
    // emp
    const firstSpans = Array.from(doc.querySelectorAll('[data-level]'));
    const secondSpans = Array.from(doc.querySelectorAll('[data-quote]'));
    // break
    const thirdSpans = Array.from(doc.querySelectorAll('[data-time]'));
    // read
    const fourthSpans = Array.from(doc.querySelectorAll('[data-text]'));
    // audio
    const fifthSpans = Array.from(doc.querySelectorAll('[data-audio]'));
    // noread
    const sixthSpans = Array.from(doc.querySelectorAll('[data-noread]'));
    // voice
    const seventhSpans = Array.from(doc.querySelectorAll('[data-voice]'));
    let changed = false;
    // emp
    firstSpans.forEach((span) => {
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
    // '/
    secondSpans.forEach((span) => {
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
    thirdSpans.forEach((span) => {
        let isValid = /\{break\s+\d+ms\}/.test(span.textContent);
        if (!isValid) {
            span.outerHTML = span.textContent;
            changed = true;
        }
    });
    // read
    fourthSpans.forEach((span) => {
        let isValid = /\{read\s+;[^;]+;\}/.test(span.textContent);
        if (!isValid) {
            span.outerHTML = span.textContent;
            changed = true;
        }
    });
    fifthSpans.forEach((span) => {
        let isValid = /\{audio\s+'[^']+'\}/.test(span.textContent);
        if (!isValid) {
            span.outerHTML = span.textContent;
            changed = true;
        }
    });
    sixthSpans.forEach((span) => {
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
    seventhSpans.forEach((span) => {
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
// Debounce to improve the performance
let debouncedFunction = _.debounce(function(props) {
    if (props.attributes && props.attributes.content) {
        // Wrap break -one <span>
        let newContent = props.attributes.content.replace(/(?!<span class="tts-tag" data-time="\d+ms">)\{break (\d+)ms\}(?!<\/span>)/g, '<span class="tts-tag" data-time="$1ms">{break $1ms}</span>');
        // Wrap emp -two <span>
        newContent = newContent.replace(/(?!<span class="tts-tag" data-level="[^"]+">)\{emp\s+([^']+)\s+'([^']+)'\}(?!<\/span>)/g, '<span class="tts-tag" data-level="$1">{emp $1 \'</span>$2<span class="tts-tag" data-quote="true">\'}</span>');
        // Wrap read to be read but not visible -one <span>
        newContent = newContent.replace(/(?!<span class="tts-tag" data-text="true">)\{read\s+;([^;]+);\}(?!<\/span>)/g, '<span class="tts-tag" data-text="true">{read ;$1;}</span>');
        // Wrap audio -one <span>
        newContent = newContent.replace(/(?!<span class="tts-tag" data-audio="true">)\{audio\s+'([^']+)'\}(?!<\/span>)/g, '<span class="tts-tag" data-audio="true">{audio \'$1\'}</span>');
        // Wrap text no to be read but visible -one <span>
        newContent = newContent.replace(/(?!<span class="tts-tag" data-noread="true">)\{noread\s+'([^']+)'\}(?!<\/span>)/g, '<span class="tts-tag" data-noread="true">{noread \'</span>$1<span class="tts-tag" data-quote="true">\'}</span>');
        // Wrap voice -one <span>
        newContent = newContent.replace(/(?!<span class="tts-tag" data-voice="[^']+">)\{voice\s+'([^']+)'\}(?!<\/span>)/g, '<span class="tts-tag" data-voice="$1">{voice \'$1\'}</span>');
        if (props.attributes.content != newContent) {
            console.log(newContent);
        }
        props.setAttributes({ content: newContent });
    }
    checkAndRemoveClasses(props)
}, 300); 

const addSpecialClass = createHigherOrderComponent((BlockEdit) => {
    return (props) => {
        // Check if the block has a 'content' attribute
        debouncedFunction(props)
        const result = wp.element.createElement(BlockEdit,props);
        return result;
    };
}, 'addSpecialClass');

addFilter('editor.BlockEdit', 'tts/add-special-class', addSpecialClass);

// Text to speech menu
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
        // Show the settings
        popup.classList.remove("hidden");
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
    var manualSubmitButton = document.getElementById("manualSubmit");
    if (manualSubmitButton) {
        manualSubmitButton.addEventListener("click", function() {
            document.getElementById("loading").style.display = "block"; // Show that its loading
            console.log(document.getElementById("loading"));
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
                    document.getElementById("loading").style.display = "none"; // hide the loading element
                    return response.json();
                })
                .then(function(data) {
                    console.log(data);
                })
                .catch(function(error) {
                    document.getElementById("loading").style.display = "none";
                    console.error("Error:", error);
                });
            } else {
                console.error("Settings container not found");
            }
        });
    }
});
}