// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

var main_tab_id;
var fake_tab_id;

chrome.runtime.onInstalled.addListener(function() {
    console.log("Installed");
    //chrome.tabs.create({ url: 'https://visk.in.ua/?close=1' });
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
      if (request.greeting == "hello") {
        sendResponse({farewell: "goodbye"});
      }
      console.log("before switch", main_tab_id, fake_tab_id);
      chrome.tabs.update(fake_tab_id, {active:true}, function() { 
          console.log("fake tab is active, try to switch back");
          setTimeout(function () {
        chrome.tabs.update(main_tab_id, {active:true,highlighted: true}, function() { 
            console.log("main tab is active");
        }); }, 3000);
      });
    });

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
        if (tab.url.indexOf("facebook.com/") !=-1) {
            main_tab_id = tabId;
            console.log('chrome.tabs.onUpdated.addListener', JSON.stringify(changeInfo), JSON.stringify(tab));
            chrome.tabs.executeScript(tabId, {file: "jquery-3.5.0.min.js"});
            chrome.tabs.executeScript(tabId, {file: "real_script.js"});
        } else if (tab.url.indexOf("visk.in.ua/?close=1") !=-1) {
            fake_tab_id = tabId;
        }
    }
  });