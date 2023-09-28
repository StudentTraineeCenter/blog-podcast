<?php
/**
 * Plugin Name: TTSarticles 
 * Plugin URI: https://yourwebsite.com
 * Description: This plugin creates a button for all admins on a wordpress webste that allows them to make a podcast out of their article.
 * Version: 2.0
 * Author: FilBlack
 * Author URI: https://yourwebsite.com
 */

function enqueue_my_plugin_scripts() {
    // Enqueue CSS
    wp_enqueue_style('my-plugin-style', plugin_dir_url(__FILE__) . 'settings_style.css');

    // Enqueue JavaScript
    wp_enqueue_script('my-plugin-script', plugin_dir_url(__FILE__) . 'settings_script.js', array('jquery'), '1.0', true);
}
add_action('admin_enqueue_scripts', 'enqueue_my_plugin_scripts');

// Add meta box
function add_my_custom_meta_box() {
    add_meta_box('my_custom_meta_box', 'Text to speech', 'my_settings_popup_callback', 'post');
}
add_action('add_meta_boxes', 'add_my_custom_meta_box');

// add page content
function my_settings_popup_callback() {
    ?>
    <div class="wrap">
        <h2>Make voice file</h2>
        <button id="TagToggle">Toggle Tags</button>
        <button id="showSettingsPopup">Show Settings</button>
        <div id="settingsPopup" class="hidden">
            <h3>Settings</h3>
            <button id="closeSettingsPopup">Close</button>
            <!-- Your settings here -->
            <div id="settingsContainer">
                <label for="language">Language:</label>
                <div id="language">
                    <input type="radio" id="english" name="language" value="en-US">
                    <label for="english">English</label>

                    <input type="radio" id="czech" name="language" value="cs-CZ">
                    <label for="czech">Czech</label>
                </div>
                <div id="gender">
                    <input type="radio" id="male" name="gender" value="male">
                    <label for="male">Male</label>

                    <input type="radio" id="female" name="gender" value="female">
                    <label for="female">Female</label>
                </div>
                <label for="speed">Speed:</label>
                <input type="range" id="speed" name="speed" min="50" max="200" value="100">
                <!-- Submit button -->
                <input type="button" value="Save audio file" id="manualSubmit">
            </div>
        </div>
    </div>
    <?php
}
function replace_tag($htmlContent, $tagToFind, $tagToReplaceWith) {
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


function convert_htmltotext($htmlContent) {
    // Create a new DOMDocument object
    $dom = new DOMDocument;
    // Replace all titles, lists and others with <p>
    $tags = array('h4','h3','h2','h1','li');
    foreach ($tags as $tag) {
        $htmlContent = replace_tag($htmlContent,$tag,'p');
    }
    
    // Load the HTML content into the DOMDocument object
    @$dom->loadHTML('<?xml encoding="utf-8" ?>' . $htmlContent, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    
    // Replace the special funciton elements with their SSML
    $special_elements = $dom->getElementsByTagName('span');
    $nodesToReplace = [];
    
    foreach ($special_elements as $element) {
        if ($element->hasAttribute('data-time') || $element->hasAttribute('data-level')) {
            $nodesToReplace[] = $element;
        }
    }
    foreach ($nodesToReplace as $element) {
        // Replace the <span break> element with the proper ssml break
        if ($element->hasAttribute('data-time')) {
            $time = $element->getAttribute('data-time');
            $break = $dom->createElement('break');
            $break ->setAttribute('time',$time);
            $element->parentNode->replaceChild($break,$element);
        }
        // Replace the nextSibling of the emphasis span element with the full ssml sentence
        // Just delete the <span emphasis> elements at the end of the code
        if ($element->hasAttribute('data-level')) {
            $level = $element->getAttribute('data-level');
            $emphasis = $dom->createElement('emphasis');
            $emphasis->setAttribute('level', $level);
            $emphasis->nodeValue = $element->nextSibling->nodeValue;
            $element->parentNode->replaceChild($emphasis, $element->nextSibling);
            $element->parentNode->removeChild($element);
        }   
        if ($element->hasAttribute('data-quote')) {
            $element->parentNode->removeChild($element);
        }
        
    }


    // Find all image tags
    $images = $dom->getElementsByTagName('img');
    
    // Loop through each image tag
    foreach ($images as $image) {
        // Get the 'alt' attribute for the image
        $altText = $image->getAttribute('alt');
        
        // Create a text node with the 'alt' text
        $textNode = $dom->createTextNode("Tady můžeme vidět: $altText");
        
        // Replace the image with the text node
        $image->parentNode->replaceChild($textNode, $image);
    }

    // Remove all other HTML tags
    $modifiedHtml = $dom->saveHTML();

    $textContent = strip_tags($modifiedHtml,'<p><break><emphasis>');
    //Decode wierd characters
    $textContent = html_entity_decode($textContent, ENT_QUOTES, 'UTF-8'); 

    $textContent = trim($textContent); //Trim
    return $textContent;
}



function handle_ajax_request() {
    $language = $_POST['language'];
    $speed = $_POST['speed'];
    $post_id = $_POST['post_id'];
    $gender = $_POST['gender'];
    //Select the voice based on language and gender
    $cz_voice = ($gender == 'male' ? "cs-CZ-AntoninNeural" : "cs-CZ-VlastaNeural");
    $eng_voice = ($gender == 'male' ? "en-US-GuyNeural" : "en-US-JennyNeural");
    $voice = ($language == 'cs-CZ' ? $cz_voice : $eng_voice);
    //Parse the speed
    $rate = floatval($speed) -100;
    if ($rate>0) {
        $rate = "+" . $rate;
    } else {
        $rate ="$rate";
    }
    // Get the html from the post and convert it to readable text  
    $post = get_post($post_id);
    $article_html = $post->post_content;
    $text = convert_htmltotext($article_html);
    // SSML
    $ssml = <<<EOD
    <speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="$language">
        <voice name="$voice">
            <prosody rate="$rate%">
                $text
            </prosody>
        </voice>
    </speak>
    EOD;
    error_log("ssml:$ssml");
    // Process data here
    // Your Azure subscription key
    $subscriptionKey = 'nuh,uh';

    // Your Azure endpoint
    $endpoint1 = 'https://eastus.api.cognitive.microsoft.com/sts/v1.0/issuetoken';
    $endpoint2 = 'https://eastus.tts.speech.microsoft.com/cognitiveservices/v1';

    // Set up cURL
    $ch = curl_init($endpoint1);

    
    // Set up the headers
    $headers1 = [
        'Ocp-Apim-Subscription-Key: ' . $subscriptionKey,
    ];
    
    // Set up cURL options
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    error_log("Curl has been setup");
    // Execute the request and get the audio data
    $result = curl_exec($ch);
    // Check for errors
    if (curl_errno($ch)) {
        wp_send_json_error(['message' => 'Failed to make API request: ' . curl_error($ch)]);

    } else {
        $token = $result;
        error_log("Token recieved");
    }
    $contentLength = strlen($ssml);

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
    curl_setopt($ch, CURLOPT_URL, $endpoint2); //Change the url to the second endpoint

    error_log("Curl has been setup for the second time");
    // Execute the request and get the audio data
    $result = curl_exec($ch);
    // Check for errors
    if (curl_errno($ch)) {
        wp_send_json_error(['message' => 'Failed to make API request: ' . curl_error($ch)]);
    } else {
        // Get WordPress upload directory info
        $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        error_log($httpcode);

        $upload_dir = wp_upload_dir();
        // Create a unique file name
        $filename = wp_unique_filename($upload_dir['path'], 'output.mp3');

        // Full path to the file
        $file_path = $upload_dir['path'] . '/' . $filename;

        // Save the audio data as an MP3 file
        file_put_contents($file_path, $result);
        // File type
        $wp_filetype = wp_check_filetype($filename, null);

        // Prepare an array of post data for the attachment.
        $attachment = array(
            'guid'           => $upload_dir['url'] . '/' . basename($filename),
            'post_mime_type' => $wp_filetype['type'],
            'post_title'     => preg_replace('/\.[^.]+$/', '', basename($filename)),
            'post_content'   => '',
            'post_status'    => 'inherit'
        );
        //get the id of the post 
        $post_id = intval($_POST['post_id']); // Make sure to sanitize and validate

        // Insert the attachment.
        $attach_id = wp_insert_attachment($attachment, $file_path, $post_id);  // $post_id is the ID of the post you're attaching to

        // Make sure to include the WordPress image.php file
        require_once(ABSPATH . 'wp-admin/includes/image.php');

        // Generate the metadata for the attachment
        $attach_data = wp_generate_attachment_metadata($attach_id, $file_path);

        // Update metadata
        wp_update_attachment_metadata($attach_id, $attach_data);
        
        wp_send_json_success(['message' => 'Podcast appended.']);
    }

    // Close cURL
    curl_close($ch);

}
add_action('wp_ajax_my_ajax_action', 'handle_ajax_request');