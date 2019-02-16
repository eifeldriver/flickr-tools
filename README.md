# Flickr Tools
Custom Javascript to add some features to the Flickr website.

# Features
* every image has a copy-icon to get links to the often used resolutions

# Requirements
You have to install a browser addon to add custom script to any website.

I reccommend Tampermonkey:
* [Tampermonkey for Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
* [Tampermonkey for Opera](https://addons.opera.com/de/extensions/details/tampermonkey-beta/)
* [Tampermonkey for Firefox](https://addons.mozilla.org/de/firefox/addon/tampermonkey/)

# Get started
In this tutorial I use "TM" as shortcut for the word "Tampermonkey".

1. Install the addon
Click on the link above and install TM to your favorit browser. After that you see the TM-Icon right top.

2. Add a new script 
Right-click on that new icon in your browser and click on "Create a new script".
![pic1](https://c1.staticflickr.com/8/7844/46390822204_603ee56e06.jpg)

3. Copy source code
All the script logic is placed in one single file. Your find it here in this repository.
You have to copy the raw source code and put it into the new created script inside TM.
[open the RAW view of the source code](https://raw.githubusercontent.com/eifeldriver/flickr-tools/master/flickr-tools.js)

4. Save and test it
Save the copied code inside TM with the shortcut CTRL+S or via TM-menu "File - Sve to disk".
Now call any flickr website / stream to see if the copy-icon is visible.
[Try my Flickr-page to test the copy-icon](https://www.flickr.com/photos/69158532@N06/)

# Final

Now, after any reload of DIM page, the script will be execute automatically.


