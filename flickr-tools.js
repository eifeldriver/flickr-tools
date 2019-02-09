// ==UserScript==
// @name         flickr-tools
// @namespace    http://tampermonkey.net/
// @version      0.21
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
    var js_version = '0.21';
    var js_debug = 1;
    var version_file = 'https://raw.githubusercontent.com/eifeldriver/flickr-tools/master/version';
    var watcher = null;


    var actions_css = '' +
        '.my-icon-edit { background: #444 url(https://s.yimg.com/ap/build/images/sprites/icons-938e2840.png) -412px -236px no-repeat;' +
        '   width: 18px; height: 18px; padding: 1px; text-indent: 100%; white-space: nowrap; overflow: hidden; display: inline-block;' +
        '   position: absolute; top: 5px; left: 5px; z-index: 9999; transition: transform 1.0s, background-color 0.5s; } ' +
        '.my-icon-edit.single-img {top: 65px; left: 220px; } ' +
        '.my-icon-edit:hover { background-color: #f5f6f6; outline: 1px solid #eee; } ' +
        '.my-icon-edit.open { background-color: #f5f6f6; } ' +
        '.my-icon-edit.success { background-color: lightgreen; } ' +
        '.copy-dialog { background: #f5f6f6; position: absolute; left: 5px; top: 27px; color: #fff; z-index: 19999; } ' +
        '.copy-dialog.single-img { left: 220px; top: 85px; } ' +
        '.copy-dialog a { display: inline-block; padding: 2px 5px; margin-right: 2px; color: #999; text-decoration: none; ' +
        '                 transition: background-color 0.2s;}' +
        '.copy-dialog a:hover { background: #999; color: #fff; text-decoration: none;  }' +
        '.ft_scaleit { transform: scale(2.0); } ' +
        '.ft_active { background-color: lightgreen; outline: 1px solid #eee; }' +
        '';

    var css = actions_css +
        '';

    // span.copy-dialog
    var copy_img_dialog = '<!-- actions --><a name="thumb">150</a><a name="low">320</a><a name="small">500</a><a name="med">1024</a><a name="high">1920</a><!-- end -->';


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
                    info.id = 'ft-tools-update';
                    info.className += ' ft_active';
                    info.innerHTML = '<span title="Your version = ' + js_version + ' | New version = ' + repo_version + '">*</span>';
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
     * The copy process using a trick:
     *  - create textarea
     *  - put text inside
     *  - set focus to the element
     *  - mark the text
     *  - use browser copy command
     *  - remove textarea
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
            console.log('Copied text = ' + txt);
        } catch (err) {
            console.log('Oops, unable to copy');
        }
        // delete temp. textarea
        elem.parentNode.removeChild(elem);
        // scroll back to clicked element
        window.scrollTo(scrollX, scrollY);
        return copied;
    }

    /**
     * set actions for the image copy dialog
     */
    function setActionsForCopyImgDialog(dialog) {
        if (dialog && (dialog.className.indexOf('copy-dialog') != -1)) { // process only on .copy-dialog element
            var div = dialog.parentNode;
            var url, needle;
            // check witch context is active
            if (div.id == 'content') { // single image view
                 url = document.querySelector('.view.photo-well-media-scrappy-view > img.main-photo').src;
                 needle = '_b.jpg';
            } else if (div.className.indexOf('photo-list-photo-view') != -1) { // photostream or album view
                 url = 'https:' + div.style.backgroundImage.split('"')[1];
                 needle = '_c.jpg';
            }
            // store img url for later use
            dialog.dataset.imgurl = url;
            // add actions
            dialog.querySelectorAll("a").forEach(
                function (a) {
                    a.addEventListener('click',
                        function(e) {
                            var elem = e.target;
                            var url = elem.parentNode.dataset.imgurl; // from span.copy-dialog
                            switch(elem.name) {
                                case 'thumb': // 150 x 150
                                    url = url.replace(needle, '_q.jpg');
                                    break;
                                case 'low': // 320
                                    url = url.replace(needle, '_n.jpg');
                                    break;
                                case 'small': // 500
                                    url = url.replace(needle, '.jpg');
                                    break;
                                case 'med': // 1024
                                    url = url.replace(needle, '_b.jpg');
                                    break;
                                case 'high': // original
                                    url = url.replace(needle, '_h.jpg');
                                    break;
                                default:
                                    // do nothing
                                    break;
                            }
                            if (copyToClipboard(url)) {
                                // success
                                var dialog = elem.parentNode;
                                var icon = dialog.nextSibling;
                                // mark copy icon green for a short time
                                icon.className = icon.className.replace(' open', '') + ' success';
                                window.setTimeout(function() {
                                    var icon = document.querySelector('.my-icon-edit.success');
                                    icon.className = icon.className.replace(' success', '');
                                }, 1200);
                                closeCopyImgUrlDialog(dialog);
                            }
                        }
                    );
                }
            );
        }
    }

    /**
     * remove the copy image dialog
     * @param icon
     */
    function closeCopyImgUrlDialog(dialog) {
        if (dialog && dialog.className.indexOf('copy-dialog') != -1) { // process only clicks on the copy-icon
            dialog.parentNode.removeChild(dialog);
        }
    }

    /**
     * enable/disable copy dialog
     *
     * Info: icon and dialog are direct DOM siblings !
     * @param e
     */
    function toggleCopyImgUrlDialog(e) {
        e.stopPropagation();
        var icon = e.target;
        if (icon && icon.className.indexOf('my-icon-edit') != -1) { // process only clicks on the copy-icon
            if (icon.className.indexOf(' open') == -1) { // dialog closed
                var dialog = document.createElement('SPAN');
                dialog.className = 'copy-dialog';
                if (icon.parentNode.id == 'content') {
                    dialog.className += ' single-img';
                }
                dialog.innerHTML = copy_img_dialog;
                icon.parentNode.insertBefore(dialog, icon);
                icon.className = icon.className.replace(' open', '') + ' open';
                setActionsForCopyImgDialog(dialog);
            } else { // dialog open
                closeCopyImgUrlDialog(icon.previousSibling);
                icon.className = icon.className.replace(' open', '');
            }
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
            icon.title = 'open copy dialog';
            img.prepend(icon);
            img.addEventListener('click', toggleCopyImgUrlDialog);
        });
    }

    /**
     * add the copy url icon to single image view page
     */
    function addUrlCopyIconOnImagePage() {
        var img = document.querySelector('.view.photo-well-media-scrappy-view > img.main-photo');
        var icon = document.createElement('SPAN');
        icon.className = 'my-icon-edit single-img';
        icon.title = 'open copy dialog';
        document.querySelector('#content').prepend(icon);
        // icon.addEventListener('click', copySingleImgUrl);
        icon.addEventListener('click', toggleCopyImgUrlDialog);
    }

    /**
     * init the script
     *
     * The script have to identify the current context, because the copy dialog must insert in different way
     * for stram7album and single image view. Stream view hold the image url in background-image CSS property and
     * single image view have img tags with the urls.
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