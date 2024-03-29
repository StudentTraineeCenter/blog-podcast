<?php
/**
 * Plugin Name: Text-to-speech Podcast
 * Plugin URI: https://github.com/StudentTraineeCenter/blog-podcast
 * Description: Plugin that adds the ability to create a podcast out of any article.
 * Version: 1.0
 * Author: FilBlack
 * Author URI: https://github.com/FilBlack
 */

// Enqueue necessary files for admin
function enqueue_admin_scripts() {
    wp_enqueue_style('my-plugin-style', plugin_dir_url(__FILE__) . 'settings_style.css');
    wp_enqueue_script('my-plugin-script', plugin_dir_url(__FILE__) . 'settings_script.js', array('jquery'), '1.0', true);
    // Enqueue Iodash for debouncing un javascript
    wp_enqueue_script('lodash');
}
add_action('admin_enqueue_scripts', 'enqueue_admin_scripts');

// Remove the tts-tag element in the html that is dipslayed to the user, but keep it for the admin
add_filter('the_content', 'destroy_special_tag');

function destroy_special_tag($content) {
    if (!is_admin()) { 
        $dom = new DOMDocument;
        @$dom->loadHTML('<?xml encoding="utf-8" ?>' . $content, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        $tags = $dom->getElementsByTagName('span');
        $tags_to_destroy =[];
        foreach ($tags as $tag) {
            $special = ('tts-tag' === $tag->getAttribute('class'));
            if ($special) {
                $tags_to_destroy[] = ['Node' => $tag, 'Onlychild' => (!$tag->previousSibling && !$tag->nextSibling)];
            }
        }
        foreach ($tags_to_destroy as $dtag) {
            $parent = $dtag['Node']->parentNode;
            $dtag['Node']->parentNode->removeChild($dtag['Node']);
            if ($dtag['Onlychild']) {
                $parent->parentNode->removeChild($parent);
            }
        }
        $content = $dom->saveHTML();
    }
    return $content;
}
// The folowing few functions are used to add the settings page 
add_action('admin_menu','tts_settings');

function tts_settings(){
    add_menu_page('TTS-Podcast_settings', 'TTS-Podcast', 'manage_options', 'my_plugin_slug', 'tts_settings_page', 'dashicons-controls-volumeon', 99);
}
// Register the settings
add_action('admin_init', 'settings_init');

function settings_init() {
    register_setting('tts-options', 'azure_key');
    register_setting('tts-options', 'starting_theme_url');
    register_setting('tts-options', 'ending_theme_url');
    register_setting('tts-options', 'azure_endpoint');
}
// Function to procces submitting the form 
// Removes the empty fields from submission
function process_tts_form() {
    if (isset($_POST['action']) && $_POST['action'] == 'non_empty_submit') {
        if (!empty($_POST['azure_key'])) {
            update_option('azure_key', sanitize_text_field($_POST['azure_key']));
        }
        update_option('azure_endpoint', sanitize_text_field($_POST['azure_endpoint']));
        update_option('starting_theme_url', esc_url_raw($_POST['starting_theme_url']));
        update_option('ending_theme_url', esc_url_raw($_POST['ending_theme_url']));
        wp_redirect(add_query_arg(
            array('updated' => 'true'),
            wp_get_referer()
        ));
        exit;
    }
}

add_action('admin_post_non_empty_submit', 'process_tts_form');
add_action('admin_post_nopriv_non_empty_submit', 'process_tts_form');

// Be able to set default theme, set the azure key and endpoint 
function tts_settings_page() {
    ?>
    <h1>Text to speech settings</h1>
    <!-- Check if any of the input fields are empty and if they are dont submit the settting -->
    <form id="tts-settings-form" method="post" action="<?php echo admin_url('admin-post.php'); ?>">
        <?php settings_fields('tts-options'); ?>
        <?php do_settings_sections('tts-options'); ?>
        <div>
            <label for="azure_key">Your azure key:</label><br>
            <div id="azure_key_flex">
                <input type="password" id="azure_key" name="azure_key" value="" style="width: 200px;" oninput="autoExpand(this)"><br>
                <button type="button" id="key_visibility">Show</button>
            </div>
        </div>
        <div>
            <label for="azure_endpoint">Your azure endpoint:</label><br>
            <input type="text" id="azure_endpoint" name="azure_endpoint" value="<?php echo get_option('azure_endpoint'); ?>"style="width: 200px;" oninput="autoExpand(this)">
        </div>
        <div>
            <label for="starting_theme_url">Starting theme url:</label><br>
            <input type="text" id="starting_theme_url" name="starting_theme_url" value="<?php echo get_option('starting_theme_url'); ?>"style="width: 200px;" oninput="autoExpand(this)"><br>
        </div>
        <div>
            <label for="ending_theme_url">Ending theme url:</label><br>
            <input type="text" id="ending_theme_url" name="ending_theme_url" value="<?php echo get_option('ending_theme_url'); ?>"style="width: 200px;" oninput="autoExpand(this)">
        </div>
        <input type="hidden" name="action" value="non_empty_submit">
        <?php submit_button('Save Changes', 'primary', 'submit', true, array('id' => 'submitBtn')); ?>
    <span id="message"></span>
    </form>
    <div id="azure_deployment">
        <label for="deploy_button">Deploy your resource to azure and copy the key with the endpoint:</label>
        <button id ="deploy_button" onclick="window.open('https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2FStudentTraineeCenter%2Fblog-podcast%2Fmaster%2Fazure_deploy.json')" target="_blank">
            <img id="deploy_button_image" src="https://aka.ms/deploytoazurebutton" alt="Deploy to Azure">
        </button>
    </div>
    <script>
    document.addEventListener('DOMContentLoaded', (event) => {
        document.getElementById('submitBtn').addEventListener('click', function() {
            document.getElementById('message').textContent = 'Changes Saved';
            setTimeout(() => {
                document.getElementById('message').textContent = '';
            }, 2000); // Remove message after 2 seconds
        });
    });
    </script>
    <?php
}
// The next few functions are used to add the metabox or the options box when editing the post
// Triggers only if in the admin area
function add_my_custom_meta_box() {
    add_meta_box('text_to_speech', 'Text to speech', 'my_settings_popup_callback', 'post','side', 'default');
}
add_action('add_meta_boxes', 'add_my_custom_meta_box');

// The voice file options html 
function my_settings_popup_callback() {
    ?>
    <div class="wrap">
        <button id="TagToggle">Toggle Tags</button>
        <div id="settingsPopup">
            <h3 id="Settings">Settings</h3>
            <!-- Your settings here -->
            <div id="settingsContainer">
                <label>Voice:</label>
                <div id="language">
                    <input type="radio" id="english" name="language" value="en-US"checked>
                    <label for="english">English</label>

                    <input type="radio" id="czech" name="language" value="cs-CZ">
                    <label for="czech">Czech</label>
                </div>
                <div id="gender">
                    <input type="radio" id="male" name="gender" value="male"checked>
                    <label for="male">Male</label>

                    <input type="radio" id="female" name="gender" value="female">
                    <label for="female">Female</label>
                </div>
                <div id="speed_setting">
                    <label for="speed">Speed:</label>
                    <input type="range" id="speed" name="speed" min="50" max="200" value="100">
                    <span id="speed_value">100%</span>
                </div>
                <div id="volume_setting">
                    <label for="volume">Volume:</label>
                    <select id="volume" name="volume">
                        <option value="default">Default</option>
                        <option value="x-soft">X-Soft</option>
                        <option value="soft">Soft</option>
                        <option value="medium">Medium</option>
                        <option value="loud">Loud</option>
                        <option value="x-loud">X-Loud</option>
                </select>
                </div>
                <div id="alltext">
                    <label for="alttext">Include image alt</label>
                    <input type="checkbox" id="alttext" name="alttext" value="true">
                </div>
                <div>
                    <label for="name_box">File name*:</label>
                    <input type="text" id="name_box" name="name_box" value="">
                    <div id="error">&nbsp;</id>
                </div>
                <!-- Submit button -->
                <input type="button" value="Save audio file" id="manualSubmit">
                <div id="loading" class="spinner" style="display:none;"></div>
                <span id="file_save" style="display:none">File saved to media library!</span>
                <span id="something_wrong" style="display:block"></span>
            </div>
            
        </div>
    </div>
    <?php
}
// Setup for the convert_to_html 
// Replaces all the instances of the specified tag with the new tag while keeping the nodeValue
function replace_html_tags($htmlContent, $tagToFind, $tagToReplaceWith) {
    $dom = new DOMDocument;
    @$dom->loadHTML('<?xml encoding="utf-8" ?>' . $htmlContent, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);

    $tags = $dom->getElementsByTagName($tagToFind);

    $tags_to_replace = [];
    foreach ($tags as $tag) {
        $tags_to_replace[] = $tag;
    }

    foreach ($tags_to_replace as $tag) {
        $newTag = $dom->createElement($tagToReplaceWith, $tag->nodeValue);
        $tag->parentNode->replaceChild($newTag, $tag);
    }

    return $dom->saveHTML();
}
// Main function to convert the special span elements to their SSML 
function convert_htmltotext($htmlContent,$alttext,$rate,$volume,$language) {
    // Replace all titles, lists and others with <p>
    // This is done so the voice reads them as a human would 
    $tags = array('h4','h3','h2','h1','li');
    foreach ($tags as $tag) {
        $htmlContent = replace_html_tags($htmlContent,$tag,'p');
    }
    
    // Load the HTML content into the DOMDocument object
    $dom = new DOMDocument;
    @$dom->loadHTML('<?xml encoding="utf-8" ?>' . $htmlContent, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    $xpath = new DOMXPath($dom);

    // Replace the special function elements with their SSML
    $special_elements = $dom->getElementsByTagName('span');
    $elementsToRemove = [];
    $elementsToReplace = [];
    foreach ($special_elements as $element) {
        // Replace the break element with SSML
        if ($element->hasAttribute('data-time')) {
            // Extract the time variable for the SSML from the span 
            $time = $element->nodeValue;
            $time = preg_replace("/{\w+ (\d+)ms}/","$1ms",$time);
            $break = $dom->createElement('break');
            $break->setAttribute('time',$time);
            $elementsToReplace[] = ['newNode' => $break, 'oldNode' => $element];
        }
        // Replace audio with SSML
        if ($element->hasAttribute('data-audio')) {
            // Either href inside <a> or just url 
            $ElementChild = false;
            foreach ($element->childNodes as $child) {
                if ($child->nodeType === XML_ELEMENT_NODE) {
                    $ElementChild = $child;
                    break;
                }
            }
            if ($ElementChild) {
                $url = $ElementChild->getAttribute('href');
            } else {
                // Hande the content of audio
                $url = $element->nodeValue;
                $url = preg_replace("/\{audio\s+/","",$url);
                $url = str_replace("'","",$url);
                $url = substr($url, 0, -1);
            }
            // Add a message so the user knows that the audio wasnt found
            $audio = $dom->createTextNode("</p></prosody><audio src=\"$url\">didn't get your mp3 audio file</audio><prosody rate=\"$rate%\" volume=\"$volume\"><p>");
            $elementsToReplace[] = ['newNode' => $audio, 'oldNode' => $element];
        }
        // Replace the emphasis element with SSML
        if ($element->hasAttribute('data-level')) {
            $level = $element->nodeValue;
            $level = preg_replace("/{emp (\w+)\s*'/","$1",$level);
            $emphasis = $dom->createElement('emphasis');
            $emphasis->setAttribute('level', $level);
            //replace <span>emp</span>'s sibling (the text to be emphasized) with the <emp> element
            $emphasis->nodeValue = $element->nextSibling->nodeValue;
            $elementsToReplace[] = ['newNode' => $emphasis, 'oldNode' => $element->nextSibling];
            $elementsToRemove[] = $element;
        }
        // Replace text to be read with SSML 
        if ($element->hasAttribute('data-text')) {
            $contenttxt = $element->nodeValue;
            $level = preg_replace("/{read\s+(\w*)\s*'[^']+'}/", "$1", $contenttxt);
            $contenttxt = preg_replace("/{read\s*\w*\s*'([^']+)'}/", "$1", $contenttxt);
            // If emphasis is provided, create and emphasis element, otherwise make a text node
            if ($level) {
                $emphasis = $dom->createElement('emphasis');
                $emphasis->setAttribute('level', $level);
                $emphasis->nodeValue = $contenttxt;
                $elementsToReplace[] = ['newNode' => $emphasis, 'oldNode' => $element];
            } else {
                $txt = $dom->createTextNode($contenttxt);
                $elementsToReplace[] = ['newNode' => $txt, 'oldNode' => $element];
            }
        }
        // Remove noread text 
        if ($element->hasAttribute('data-noread')) {
            $sibling = $element->nextSibling;
            $elementsToRemove[] = $element;
            $elementsToRemove[] = $sibling;
        }
        // Replace voice with SSML
        // Need to end paragraph then prosody, switch the voice and intiate prosody and paragraph again
        if ($element->hasAttribute('data-voice')) {
            $gender = $element->nodeValue;
            $gender = preg_replace("/{voice '(w+)'}/","$1",$gender);
            $cz_voice = ($gender == 'male' ? "cs-CZ-AntoninNeural" : "cs-CZ-VlastaNeural");
            $eng_voice = ($gender == 'male' ? "en-US-GuyNeural" : "en-US-JennyNeural");
            $voice = ($language == 'cs-CZ' ? $cz_voice : $eng_voice);
            $velement = $dom->createTextNode("</p></prosody></voice><voice name=\"$voice\"><prosody rate=\"$rate%\" volume=\"$volume\"><p>");
            $elementsToReplace[] = ['newNode' => $velement, 'oldNode' => $element];
        }
        // Remove the ending quotes for all the elements if not deleted already (emp, noread)
        if ($element->hasAttribute('data-quote')) {
            $elementsToRemove[] = $element;
        }
    }
    // Replace what needs to be replaced
    foreach ($elementsToReplace as $item) {
        $item['oldNode']->parentNode->replaceChild($item['newNode'], $item['oldNode']);
    }
    // Delete what needs to be deleted
    foreach ($elementsToRemove as $element) {
        $element->parentNode->removeChild($element);
    }
    
    // If the user selects the checkbox, then use the images alttext, otherwise delete the images
    if ($alttext === "true") {
        $images = $dom->getElementsByTagName('img');
        // Loop through each image tag
        foreach ($images as $image) {
            // Get the 'alt' attribute for the image
            $altText = $image->getAttribute('alt');
            $textNode = $dom->createElement('p');
            $textNode->nodeValue= $altText;
            $image->parentNode->replaceChild($textNode, $image);
        }
    } else {
        $images = $dom->getElementsByTagName('img');
        $length = $images->length;
        for ($i = $length - 1; $i >= 0; $i--) {
            $image = $images->item($i);
            $image->parentNode->removeChild($image);
        } 
    }
    // Remove all empty elements
    $allElements = $xpath->query('//*');
    $preserveTags = ['img', 'br', 'hr','break','audio'];  // Add more tags here if needed
    // Loop through NodeList backwards to avoid index shifting during removal
    for ($i = $allElements->length - 1; $i >= 0; $i--) {
        $element = $allElements->item($i);
        // Skip special empty tags like <img>, <br>, etc.
        if (in_array($element->tagName, $preserveTags)) {
            continue;
        }
        // Check if element is truly empty by trimming text content
        if (!trim($element->nodeValue) && !$element->hasChildNodes()) {
            $element->parentNode->removeChild($element);
        }
    }
    // Remove all other HTML tags
    $modifiedHtml = $dom->saveHTML();

    $textContent = strip_tags($modifiedHtml,'<p><break><emphasis>');
    //Decode wierd characters
    $textContent = html_entity_decode($textContent, ENT_QUOTES, 'UTF-8'); 

    $textContent = trim($textContent); //Trim
    return $textContent;
}

// This is the function that processes the text and sends the appropriate http request to bothe needed azure ednpoint 
// It will recieve the needed variables and text from the javascript ajax call
function handle_ajax_request() {
    // Get all the needed variable to process the request 
    // Only need to sanitize the file_name, the rest are just sliders and options
    $language = $_POST['language'];
    $speed = $_POST['speed'];
    $post_id = $_POST['post_id'];
    $gender = $_POST['gender'];
    $alttext = $_POST['alttext'];
    $volume = $_POST['volume'];
    $given_file_name = sanitize_text_field($_POST['file_name']);
    // Escape the raw urls 
    $ending_theme = esc_url_raw( get_option('ending_theme_url'));
    $starting_theme = esc_url_raw( get_option('starting_theme_url'));
    $endpoint_cookie = esc_url_raw( get_option('azure_endpoint'));
    //Select the voice based on language and gender
    $cz_voice = ($gender == 'male' ? "cs-CZ-AntoninNeural" : "cs-CZ-VlastaNeural");
    $eng_voice = ($gender == 'male' ? "en-US-GuyNeural" : "en-US-JennyNeural");
    $voice = ($language == 'cs-CZ' ? $cz_voice : $eng_voice);
    //Parse the speed
    $rate = floatval($speed) -100;
    if ($rate>0 || $rate == 0) {
        $rate = "+" . $rate;
    } else {
        $rate ="$rate";
    }
    // Convert html from the post to readable text 
    // Get the variables from the settings page and convert to SSML
    $post = get_post($post_id);
    $article_title = get_the_title($post_id);
    $article_html = $post->post_content;
    $starting_theme = $starting_theme ? "<audio src=\"$starting_theme\">didn't get your MP3 audio file</audio>" : "";
    $ending_theme = $ending_theme ? "<audio src=\"$ending_theme\">didn't get your MP3 audio file</audio>" : "";
    // Convert the text to SSML  
    $text = convert_htmltotext($article_html,$alttext,$rate,$volume,$language);
    // SSML with the themes and all the selected options 
    $ssml = <<<EOD
    <speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="$language">
        <voice name="$voice">
            $starting_theme
            <p>$article_title</p>
            <prosody rate="$rate%" volume="$volume">
                $text
            </prosody>
            $ending_theme
        </voice>
    </speak>
    EOD;
    // Illuminati -Ondra
    // First get a token from the users endpoint and then use it to request the audio from the azure tts endpoint
    $subscriptionKey = sanitize_key( get_option('azure_key'));
    if (!$subscriptionKey) {
        wp_send_json_error(['message' => 'Please enter a valid azure key']);
    }
    // Azure endpoint to get auth token
    $endpoint_token = get_option('azure_endpoint');
    if (!$endpoint_token) {
        wp_send_json_error(['message' => 'Please enter a valid azuer endpoint']);
    }
    // Steal the region from the first endpoint and get make the endpoint for the voice file
    $region = explode('.',$endpoint_token)[0];
    $endpoint_cognitive = $region . '.tts.speech.microsoft.com/cognitiveservices/v1'; // Needs to be changed if the structure of the link changes

    // Set up cURL
    $ch = curl_init($endpoint_token);

    // Set up the headers
    $headers1 = [
        'Ocp-Apim-Subscription-Key: ' . $subscriptionKey,
    ];
    
    // Set up cURL options
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    // Execute the request and get the authorization token
    $result = curl_exec($ch);
    // Check for errors
    if (curl_errno($ch)) {
        wp_send_json_error(['message' => 'Failed to make API request: ' . curl_error($ch)]);

    } else {
        $token = $result;
    }
    $contentLength = strlen($ssml);
    // Setup second headers
    $headers2 = [
        'Authorization: Bearer ' . $token,
        'Content-Type: application/ssml+xml',
        'X-Microsoft-OutputFormat: audio-16khz-64kbitrate-mono-mp3',
        'User-Agent: SpeechFilda',
        'Connection: Keep-Alive',
        'Content-length: '. $contentLength
    ];
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers2);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $ssml);
    curl_setopt($ch, CURLOPT_URL, $endpoint_cognitive); //Change the url to the second endpoint

    // Execute the request and get the audio data
    $result = curl_exec($ch);
    // Check for errors
    if (curl_errno($ch)) {
        wp_send_json_error(['message' => 'Failed to make API request: ' . curl_error($ch)]);
    } else {
        // Get WordPress upload directory info
        $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        // Name the file according to the user, otherwise use the name of the post 
        if ($given_file_name) {
            $title = $given_file_name;
        } else {
            $title = $post->post_title;
        }
        $upload_dir = wp_upload_dir();
        $filename = wp_unique_filename($upload_dir['path'], $title.'.mp3');
        $file_path = $upload_dir['path'] . '/' . $filename;
        file_put_contents($file_path, $result);
        $wp_filetype = wp_check_filetype($filename, null);

        // Prepare an array of post data for the attachment.
        $attachment = array(
            'guid'           => $upload_dir['url'] . '/' . basename($filename),
            'post_mime_type' => $wp_filetype['type'],
            'post_title'     => preg_replace('/\.[^.]+$/', '', basename($filename)),
            'post_content'   => '',
            'post_status'    => 'inherit'
        );

        $post_id = intval($_POST['post_id']); 

        // Insert the attachment.
        $attach_id = wp_insert_attachment($attachment, $file_path, $post_id);

        // Change the url for the playbutton 

        // Make sure to include the WordPress image.php file
        require_once(ABSPATH . 'wp-admin/includes/image.php');

        // Generate the metadata for the attachment
        $attach_data = wp_generate_attachment_metadata($attach_id, $file_path);

        // Update metadata
        wp_update_attachment_metadata($attach_id, $attach_data);
        
        wp_send_json_success(['message' => 'Podcast appended.', 'url' => $file_path]);
    }

    // Close cURL
    curl_close($ch);
}
// Add the function to handle the ajax request
add_action('wp_ajax_my_ajax_action', 'handle_ajax_request');