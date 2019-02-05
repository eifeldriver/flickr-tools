# Flickr Tools
Javascript to add some features to the Flickr website

# Description
This script add ...

# Requirements
To run this script at Flickr page. You have to install a browser addon for custom script execution.

For example TampaMonkey:
* Chrome : https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
* Opera : https://addons.opera.com/de/extensions/details/tampermonkey-beta/
* Firefox : https://addons.mozilla.org/de/firefox/addon/tampermonkey/

In the following text I use TM as shortcut for TampaMonkey.

* install the addon
* go to the DIM page 
* click right top on the TM icon. 
* Select "add new script".
* copy the raw Javascript code from 'dim-tools.js' 
* inside the new TM script, search for the comment line  **// Your code here...**
* replace this comment with the the copied code
* save it 

Finaly you see this script:
````javascript
    // ==UserScript==
    // @name         New Userscript
    // @namespace    http://tampermonkey.net/
    // @version      0.1
    // @description  try to take over the world!
    // @author       You
    // @match        https://www.flickr.com/*
    // @grant        none
    // ==/UserScript==
    
    (function() {
        'use strict';
    
        ...THE CUSTOM CODE...
    })();
````

Now, after any reload of DIM page, the script will be execute automatically.
