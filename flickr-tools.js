// ==UserScript==
// @name         Flickr-Tools
// @namespace    http://tampermonkey.net/
// @version      0.11
// @description  little script helpers for Flickr
// @author       EifelDriver
// @include      https://www.flickr.com/photos/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    /**
     * define some vars
     */
    var js_version = '0.11';
    var js_debug = 1;
    var version_file = 'https://raw.githubusercontent.com/eifeldriver/flickr-tools/master/version';
    var watcher = null;

    var actions_css = '' +
        '.my-icon-edit { background: darkgreen url(https://s.yimg.com/ap/build/images/sprites/icons-938e2840.png) -413px -237px no-repeat;' +
        '   width: 18px; height: 18px; text-indent: 100%; white-space: nowrap; overflow: hidden; display: inline-block; position: absolute; ' +
        '   top: 8px; left: 1px; transform: scale(1.5); outline: 1px solid #eee; z-index: 9999; ' +
        '   transition: transform 1.0; } ' +
        '.my-icon-edit.single-img {top: 65px; left: 220px; } ' +
        '.my-icon-edit:hover { background-color: green; } ' +
        '.scaleit { transform: scale(2.0); } ' +
        '.flashit { background-color: lightgreen; }' +
        '';

    var css = actions_css +
        '';

//------------------------------------------------------------

    /**
     * debug output function
     */
    function _debug(txt) {
        if (js_debug) {
            var d = new Date();
            var now = [d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()].join(':');
            console.log(now + ': ' + txt);
        }
    }

    /**
     * check Github version with local version
     */
    function checkForUpdates() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', version_file);
        xhr.onload = function() {
            if (xhr.status == 200) {
                var repo_version = xhr.responseText;
                if (js_version.trim() != repo_version.trim()) {
                    // other version available
                    var info = document.createElement('DIV');
                    info.id = 'dim-tools-update';
                    info.className = 'flashit';
                    info.innerHTML = '<span title="Your version = ' + this_version + ' | New version = ' + repo_version + '">*</span>';
                    var btn = document.querySelector('#dim-tools-button');
                    btn.appendChild(info);
                }
            } else {
                return null;
            }
        };
        xhr.send();
    }

    /**
     * insert custom CSS
     *
     */
    function insertCss(css) {
        var style = document.createElement('STYLE');
        style.innerHTML = css;
        document.querySelector('head').appendChild(style);
    }


//------------------------------------------------------------

    /**
     * get the current view context
     *
     * @returns {string}
     */
    function getCurrentContext() {
        var context = '';
        var div = document.querySelector('#content > div');
        var classes = div.className.split(' ');
        if (classes[0] == 'view') {
            if (classes.length > 1) {
                context = classes[1];
            } else {
                context = ' view-unknown';
            }
        }
        return context;
    }

    /**
     * copy the image url to clipboard
     *
     * @param txt
     * @returns {*}
     */
    function copyToClipboard(txt) {
        var copied = null;
        var scrollX = window.scrollX;
        var scrollY = window.scrollY;
        var elem = document.createElement('TEXTAREA');
        elem.id = 'copy-textarea';
        elem.value = txt;
        document.body.appendChild(elem);
        elem.focus();
        elem.select();
        try {
            copied = document.execCommand('copy');
            var msg = copied ? 'successful' : 'unsuccessful';
            console.log('Copying text command was ' + msg);
        } catch (err) {
            console.log('Oops, unable to copy');
        }
        window.scrollTo(scrollX, scrollY);
        return copied;
    }

    /**
     * copy the image url
     *
     * @param e
     */
    function copyStreamImgUrl(e) {
        e.stopPropagation();
        var icon = e.target;
        var div = icon.parentNode;
        var url = 'https:' + div.style.backgroundImage.split('"')[1];
        if (copyToClipboard(url)) {
            // flash icon
            icon.className += ' flashit scaleit';
            window.setTimeout(function() {
                e.target.className = e.target.className.replace(' flashit', '').replace(' scaleit', '');
            }, 1000);
        }
    }

    /**
     * copy the image url
     *
     * @param e
     */
    function copySingleImgUrl(e) {
        e.stopPropagation();
        var icon = e.target;
        var url = document.querySelector('.view.photo-well-media-scrappy-view > img.main-photo').src;
        if (copyToClipboard(url)) {
            // flash icon
            icon.className += ' flashit scaleit';
            window.setTimeout(function() {
                e.target.className = e.target.className.replace(' flashit', '').replace(' scaleit', '');
            }, 1000);
        }
    }

    /**
     * add copy url icon to any image on the photo stream page
     */
    function addUrlCopyIconOnStreamPage() {
        var imgs = document.querySelectorAll('.view.photo-list-photo-view');
        imgs.forEach( function (img) {
            var icon = document.createElement('SPAN');
            icon.className = 'my-icon-edit';
            icon.title = 'copy img url';
            img.prepend(icon);
            img.addEventListener('click', copyStreamImgUrl);
        });
    }

    /**
     * add the copy url icon to single image view page
     */
    function addUrlCopyIconOnImagePage() {
        var img = document.querySelector('.view.photo-well-media-scrappy-view > img.main-photo');
        var icon = document.createElement('SPAN');
        icon.className = 'my-icon-edit single-img';
        icon.title = 'copy img url';
        document.querySelector('#content').prepend(icon);
        icon.addEventListener('click', copySingleImgUrl);
    }

    /**
     * init the script
     */
    function initFlickrTools() {
        insertCss(css);
        var curr_context = getCurrentContext();
        _debug('context = ' + curr_context);
        switch (curr_context) {
            case 'photostream-page-view':
            case 'album-page-view':
                addUrlCopyIconOnStreamPage();
                break;
            case 'photo-page-scrappy-view': // single photo view
                addUrlCopyIconOnImagePage();
                break;
            default:

                break;
        }
    }

//###########################################################

    /**
     * start script
     */
    initFlickrTools();
    _debug('flickr-tools started');
})();