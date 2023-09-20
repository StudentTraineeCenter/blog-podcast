<?php
/**
 * Plugin Name: TTSarticles 
 * Plugin URI: https://yourwebsite.com
 * Description: This plugin creates a button for all admins on a wordpress webste that allows them to make a podcast out of their article.
 * Version: 1.0
 * Author: FilBlack
 * Author URI: https://yourwebsite.com
 */


function enqueue_my_plugin_scripts() {
    // Enqueue CSS
    wp_enqueue_style('my-plugin-style', plugin_dir_url(__FILE__) . 'settings_style.css');

    // Enqueue JavaScript
    wp_enqueue_script('my-plugin-script', plugin_dir_url(__FILE__) . 'setting_script.js', array('jquery'), '1.0', true);
}
add_action('admin_enqueue_scripts', 'enqueue_my_plugin_scripts');

 // add admin menu
function register_my_custom_menu_page() {
    add_menu_page('My Settings Popup', 'Settings Popup', 'manage_options', 'my_settings_popup', 'my_settings_popup_callback');
}

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
        </div>
    </div>
    <?php
}




