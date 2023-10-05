// Hide all the special tags in preview mode
if (typenow != "post") {
    console.log("Triggered, typenow:".typenow)
    const specialTags1 = document.querySelectorAll('.tts-tag');
    specialTags1.forEach(function(tag) {
        tag.style.display = 'none';
    });
} else { // Execute only when the you are editing a post
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
    const secondSpans = doc.querySelectorAll('[data-quote]');
    // break
    const thirdSpans = doc.querySelectorAll('[data-time]');
    // read
    const fourthSpans = doc.querySelectorAll('[data-text]');
    // audio
    const fifthSpans = doc.querySelectorAll('[data-audio]');
    // noread
    const sixthSpans = doc.querySelectorAll('[data-noread]');
    // voice
    const seventhSpans = doc.querySelectorAll('[data-voice]');
    let changed = false;
    // emp
    firstSpans.forEach((span) => {
        let isValid = /\/emp \w+ '/.test(span.textContent);
        if (!isValid) {
            span.outerHTML = span.textContent;
            changed = true;
        }
    });
    // '
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
    // read
    fourthSpans.forEach((span) => {
        let isValid = /\/read ;[^;]+;/.test(span.textContent);
        if (!isValid) {
            span.outerHTML = span.textContent;
            changed = true;
        }
    });
    fifthSpans.forEach((span) => {
        let isValid = /\/audio '[^']+'/.test(span.textContent);
        if (!isValid) {
            span.outerHTML = span.textContent;
            changed = true;
        }
    });
    sixthSpans.forEach((span) => {
        let isValid = /\/noread '/.test(span.textContent);
        if (!isValid) {
            span.outerHTML = span.textContent;
            changed = true;
        }
    seventhSpans.forEach((span) => {
        let isValid = /\/voice '[^']+'/.test(span.textContent);
        if (!isValid) {
            span.outerHTML = span.textContent;
            changed = true;
        }
    });
    });
  
    if (changed) {
        props.setAttributes({ content: doc.body.innerHTML });
    }
}
let debouncedFunction = _.debounce(function(props) {
    if (props.attributes && props.attributes.content) {
        // Wrap break -one <span>
        let newContent = props.attributes.content.replace(/(?!<span class="tts-tag" data-time="\d+ms">)\/break (\d+)ms(?!<\/span>)/g, '<span class="tts-tag" data-time="$1ms">/break $1ms</span>');
        // Wrap emp -two <span>
        newContent = newContent.replace(/(?!<span class="tts-tag" data-level="[^"]+">)\/emp ([^']+) '([^']+)'(?!<\/span>)/g, '<span class="tts-tag" data-level="$1">/emp $1 \'</span>$2<span class="tts-tag" data-quote="true">\'</span>');
        // Wrap read to be read but not visible -one <span>
        newContent = newContent.replace(/(?!<span class="tts-tag" data-text="true">)\/read ;([^;]+);(?!<\/span>)/g, '<span class="tts-tag" data-text="true">/read ;$1;</span>');
        // Wrap audio -one <span>
        newContent = newContent.replace(/(?!<span class="tts-tag" data-audio="true">)\/audio '([^']+)'(?!<\/span>)/g, '<span class="tts-tag" data-audio="true">/audio \'$1\'</span>');
        // Wrap text no to be read but visible -one <span>
        newContent = newContent.replace(/(?!<span class="tts-tag" data-noread="true">)\/noread '([^']+)'(?!<\/span>)/g, '<span class="tts-tag" data-noread="true">/noread \'</span>$1<span class="tts-tag" data-quote="true">\'</span>');
        // Wrap voice -one <span>
        newContent = newContent.replace(/(?!<span class="tts-tag" data-voice="[^']+">)\/voice '([^']+)'(?!<\/span>)/g, '<span class="tts-tag" data-voice="$1">/voice \'$1\'</span>');
        if (props.attributes.content != newContent) {
            console.log(newContent);
        }
        props.setAttributes({ content: newContent });
    }
    checkAndRemoveClasses(props)
}, 300);
// Execute only if in the admin area 

const addSpecialClass = createHigherOrderComponent((BlockEdit) => {
    return (props) => {
        // Check if the block has a 'content' attribute
        debouncedFunction(props)
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
            showButton.classList.add("hidden");
        });

        closeButton.addEventListener("click", function(event) {
            event.preventDefault();
            popup.classList.add("hidden");
            showButton.classList.remove("hidden");
        });
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