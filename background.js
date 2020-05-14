// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.runtime.onInstalled.addListener(function() {
    console.log("Installed");  
});


chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
        if (tab.url.indexOf("facebook.com/") !=-1) {
            console.log('chrome.tabs.onUpdated.addListener', JSON.stringify(changeInfo), JSON.stringify(tab));
            chrome.tabs.executeScript(tabId, {file: "jquery-3.5.0.min.js"});
            chrome.tabs.executeScript(tabId, {file: "real_script.js"});
        }
    }
  });