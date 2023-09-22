<?php
/**
 * Plugin Name: TTSarticles 
 * Plugin URI: https://yourwebsite.com
 * Description: This plugin creates a button for all admins on a wordpress webste that allows them to make a podcast out of their article.
 * Version: 1.3
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
    add_meta_box('my_custom_meta_box', 'My Settings Popup', 'my_settings_popup_callback', 'post');
}
add_action('add_meta_boxes', 'add_my_custom_meta_box');

// add page content
function my_settings_popup_callback() {
    ?>
    <div class="wrap">
        <h2>My Settings Popup</h2>
        <button id="showSettingsPopup">Show Settings</button>
        <div id="settingsPopup" class="hidden">
            <h3>Settings</h3>
            <button id="closeSettingsPopup">Close</button>
            <!-- Your settings here -->
            <form id="settingsForm" onsubmit="return false;">
                <label for="language">Language:</label>
                <input type="text" id="language" name="language">
                <label for="setting2">Setting 2:</label>
                <input type="text" id="setting2" name="setting2">
                <!-- Submit button -->
                <input type="submit" value="Save Settings">
            </form>
        </div>
    </div>
    <?php
}





function handle_ajax_request() {
    $language = sanitize_text_field($_POST['language']);
    $setting2 = sanitize_text_field($_POST['setting2']);
    error_log("My function is being run.");
    // Process data here
    // Your Azure subscription key
    $subscriptionKey = 'a8a1dcfbc0734c7094090da3535dc740';

    // Your Azure endpoint
    $endpoint = 'https://eastus.api.cognitive.microsoft.com/sts/v1.0/issuetoken';

    // Set up cURL
    $ch = curl_init($endpoint);

    // SSML
    $ssml = '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" xml:lang="en-US">
    <voice name="Microsoft Server Speech Text to Speech Voice (en-US, AriaNeural)">
    <prosody rate="-10.00%">I want to tell you a secret.</prosody>
    <break strength="x-strong"/><prosody rate="5.00%" pitch="+20.00%">I am not a human.</prosody>
    </voice>
    </speak>';

    // Set up the headers
    $headers = [
        'Authorization: Bearer ' . $subscriptionKey,
        'Content-Type: application/ssml+xml',
        'X-Microsoft-OutputFormat: audio-16khz-64kbitrate-mono-mp3',
        'User-Agent: SpeechFilda'
    ];

    // Set up cURL options
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $ssml); //Using this in the function
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

    // Execute the request and get the audio data
    $result = curl_exec($ch);
    // Error handling
    /*if (curl_errno($ch)) {
        // Failed, handle this case
        wp_send_json_error(['message' => 'Failed to make API request: ' . curl_error($ch)]);
    } else {
        // Success, handle this case
        wp_send_json_success(['message' => 'Podcast appended.']);
    }*/
    // Check for errors
    if (curl_errno($ch)) {
        echo 'Error:' . curl_error($ch);
    } else {
        // Save the audio data as an MP3 file
        file_put_contents('C:\Users\ficak\Local Sites\ttspodcast\logs\php\output.mp3', $result);
    }

    // Close cURL
    curl_close($ch);

}
add_action('wp_ajax_my_ajax_action', 'handle_ajax_request');


// USE META BOXES INSTEAD OF ADMIN MENU