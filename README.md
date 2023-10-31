# STC-blog-podcast
A tool that adds the ability to create a podcast out of any post on a wordpress website.
This plugin is not yet official on wordpress.

# Manual 
Installation:
    Download the zip file with the plugin - plugin.zip  
    Under plugins in wordpress choose Add-New->Upload-plugin and upload plugin.zip  
    Activate the plugin and move on to setup.

Setup:  
    Go to the settings page for TTS-Podcast on the left-side menu  
    Press the "Deploy to Azure" button, it will guide you through creating a speech resource.  
    After you have created the resource, copy the azure key and endpoint to the settings page  
    If you want to, you can provide a link to a publicly hosted mp3 file, can be from the wordpress media library.
    This will serve as the opening or ending theme for the podcast.  
    Save the changes and you are good to go!  

Tags:  
    These are all the available tags that you can use to adjust the voice file:  
        {break xms} -Wait for x miliseconds. x=integer  
        {emp [strong,moderate,none,reduced] 'Text you want to emphasize that will appear in the article'}  
        {read [strong,moderate,none,reduced] 'Text you want to be read but not show in the article}  
        {noread 'This is text in the article that will appear but will not be read'}  
        {voice '[male,female]'} -Change the voice with which the rest of the text will be read  
        {audio 'url'} -Play an mp3 file that is publicly accessible from the web  
            either put in the url or embed the url inside the word  

    You can write the tags anywhere inside the article body.  
    Do not use single quotes inside the tags, the AI will read the text correctly without them.   
    You can toggle the visibility of the tags using the toggle tags button located in settings->post->Text to speech  
    The tags will be completely removed if anyone except an admin is viweing the article.  
    Tags will not affect the yoast SEO as it uses only html visible to the viewer.   

While editing a post, go to settings->Post->Text to Speech:   
    There are options for the podcast created for the individual post.  

Options for each post:  
    Voice   
        English/Czech  
        Male/female  
        If the langauge is different from the content of the post, the AI will still pronounce it, just in a broken accent.  
    Speed:  
        A range from 50% to 200% of normal speaking rate  
    Volume:  
        [Default, X-soft, Soft, Medium, Loud, X-Loud]  
        The Defualt is virtualy the same as Medium, but for each voice the default and therefore most natural volume is different.  
        Default is advised.
    Include image alt:  
        If chosen then the alt text of all images will be read in the voce file.  
        If not chosen then the images will not show up in the voice file at all.  
    File Name*:  
        Optional to name the voice file in the media library  
        If nothing is provided then the post-id is used as the name  

Just press "Save audio file" and the podcast file will appear in the media library.  
After you are happy with the podcast you can add it to the post or do anything else you need to do with it.  


Disclaimers:  
 There is a slight delay between the file being uploaded to the media library and it showing when adding media from the post.  
    This problem is inherent to wordpress, you can still upload it from the media library immediately.  
 The AI will read literally anything, beware of cursewords.   

# Functionality 
The plugin transforms the content of the post along with any special tags into AI-readable SSML;  
It then uses Azure speech services REST API to create an mp3 file out of the SSML;   
The voice file is then uploaded to the media libary.   