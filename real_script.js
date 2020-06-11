var arr_friends = [], arr_friend_name = [], fb_group_id = '', scan_status = '';

function simulateClick(element_id) {
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent("click", true, true, window,
        0, 0, 0, 0, 0, false, false, false, false, 0, null);
    var a = document.getElementById(element_id); 
    a.dispatchEvent(evt);
}

function askFriendsToJoinToGroup() {
    console.log("ready to start real work");
    var name = arr_friend_name[0];
    $('div.groupAddMemberTypeaheadBox input[data-testid="GROUP_ADD_MEMBER_TYPEAHEAD_INPUT"]').val(name);
    $('div.groupAddMemberTypeaheadBox input[data-testid="GROUP_ADD_MEMBER_TYPEAHEAD_INPUT"]').attr("id", "asdasdasdasdasd");
    $('div.groupAddMemberTypeaheadBox input[data-testid="GROUP_ADD_MEMBER_TYPEAHEAD_INPUT"]').focus();
    $('div.groupAddMemberTypeaheadBox input[data-testid="GROUP_ADD_MEMBER_TYPEAHEAD_INPUT"]').mousedown();
    //simulateClick("asdasdasdasdasd");

    chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
        console.log(response.farewell);
    });
    //$('#u_0_46').setCursorPosition(name.length);
    //setCaret('u_0_46');
    //setCaretToPos(document.getElementById("u_0_46"), 0);
    //$('#u_0_46').trigger("focus");
    //var press = jQuery.Event("keypress");
    //press.ctrlKey = false;
    //press.which = last_key.charCodeAt(0);
    //$('#u_0_46').trigger(press);
}

function readGroupID() {
    if (!fb_group_id || (fb_group_id == '') || !arr_friends || !arr_friends.length) {
        return;
    }
    var current_url = $(location).attr('href');
    if (current_url.indexOf('/groups/'+fb_group_id) === -1) {
        window.location.href = 'https://www.facebook.com/groups/'+fb_group_id;
    } else {
        askFriendsToJoinToGroup();
    }
}

var empty_scan_count = 0;
function scanFriends() {
    if (scan_status === 'complete') {
        return;
    }

    $("html, body").animate({ scrollTop: $(document).height() }, 500);
    
    var before_count = arr_friends.length;

    var old_style = false;
    var arr_a = $('a img[width="80"]');
    console.log('a img[width="80"]', arr_a.length);
    if (arr_a.length === 0) {
        old_style = true;
        arr_a = $('li._698 a img');
        console.log('li._698 a img', arr_a.length);
    }
    for (var i = 0, Ln = arr_a.length; i < Ln; ++i) {
        var link = $(arr_a[i]).parent().attr("href");
        var name = "undefined";
        try {
            name = old_style ? $(arr_a[i]).attr("aria-label") : $(arr_a[i]).parent().parent().parent().find('div div a span[dir="auto"]').text();
        } catch(e) {

        }
        var frn_lnk = getFBIDfromURL(link);
        if (((["pages", "events", "groups"]).indexOf(frn_lnk) !== -1) || (old_style && (link.indexOf("fref=profile_friend_list") === -1))) {
            if (old_style) {
                continue;
            } else {
                break;
            }
        }
        console.log(i, Ln, link, frn_lnk);
        if ((frn_lnk != '') && (arr_friends.indexOf(frn_lnk) === -1)) {
            arr_friends.push(frn_lnk);
        }
        if ((name != '') && (arr_friend_name.indexOf(name) === -1)) {
            arr_friend_name.push(name);
        }
    }

    var find_friends = before_count !== arr_friends.length;
    if (find_friends || (++empty_scan_count <= 5)) {
        if (find_friends) {
            empty_scan_count = 0;
        }
        setTimeout(scanFriends, 1000);
    } else {
        saveText("friend_list.txt", JSON.stringify({names:arr_friend_name,links:arr_friends}));
        stopWork();
        //scan_status = 'group';
        //storeData(readGroupID);
    }
}

function checkFriends() {
    if ((window.location.href.indexOf("/friends") === -1) && (window.location.href.indexOf("&sk=friends") === -1)) {
        window.location.href = 'https://www.facebook.com/me/friends';
    } else {
        console.log('time to parse friends');
        scanFriends();
    }
}

function saveText(filename, text) {
    var tempElem = document.createElement('a');
    tempElem.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    tempElem.setAttribute('download', filename);
    tempElem.click();
 }

function addFriendsToGroup(url) {
    var param_name = "add_friends_to_group_id=";
    var idx1 = url.indexOf(param_name);
    if (idx1 !== -1) {
        idx1 += param_name.length;
        var idx2 = url.indexOf("&", idx1);
        fb_group_id = url.substr(idx1, idx2 - idx1);
    }
    storeData(scan_status === "friends" ? checkFriends : readGroupID);
}

function stopWork() {
    arr_friends = [];
    arr_friend_name = [];
    fb_group_id = '';
    scan_status = 'complete';
    storeData(function () { console.log("scan cancelled") });
}

function justDoIt(data) {
    scan_status = data.status;
    arr_friends = data.arr_friend;
    fb_group_id = data.group_id;
    arr_friend_name = data.arr_name;
    var current_url = $(location).attr('href');
    console.log(scan_status, fb_group_id, current_url, arr_friends);

    if (current_url.indexOf("command=stop") !== -1) {
        stopWork();
    } else if (current_url.indexOf("command=start") !== -1) {
        fb_group_id = '';
        if (current_url.indexOf("keep_friends=1") === -1) {
            arr_friends = [];
            arr_friend_name = [];
            scan_status = 'friends';
        } else {
            scan_status = 'group';
        }
        storeData(function () { addFriendsToGroup(current_url); });
    } else if (scan_status === 'friends') {
        checkFriends();
    } else if (scan_status === 'group') {
        readGroupID();
    }
}

getData(justDoIt);

// system functions
function getData(callback) {
    var data = {};
    data.status = localStorage.getItem('status');
    data.group_id = localStorage.getItem('group_id');
    data.arr_friend = localStorage.getItem('arr_friend');
    data.arr_name = localStorage.getItem('arr_name');
    if (!data.arr_friend || (data.arr_friend === '')) {
        data.arr_friend = [];
    } else {
        data.arr_friend = data.arr_friend.split(",");
    }
    if (!data.arr_name || (data.arr_name === '')) {
        data.arr_name = [];
    } else {
        data.arr_name = data.arr_name.split(",");
    }
    callback(data);
    //chrome.storage.sync.get(['status', 'group_id', 'arr_friend'], function(result) { callback(result); });

}

function storeData(callback) {
    localStorage.setItem('status', scan_status);
    localStorage.setItem('group_id', fb_group_id);
    localStorage.setItem('arr_friend', arr_friends.join(','));
    localStorage.setItem('arr_name', arr_friend_name.join(','));
    console.log('storeData on complete');
    if (callback) {
        callback();
    }
    // var data = {arr_friend: arr_friends, group_id:fb_group_id, status: scan_status};
    // console.log("storeData", JSON.stringify(data));
    // chrome.storage.sync.set(data, function() {
    //     console.log('storeData on complete');
    //     if (callback) {
    //         callback();
    //     }
    //   });
}

function getFBIDfromURL(url) {
    var idx0 = url.indexOf("?id=");
    if (idx0 !== -1) {
        idx0 += 4;
        var idx1 = url.indexOf("&", idx0);
        if (idx1 === -1) {
            idx1 = url.length - 1;
        }
        return url.substr(idx0, idx1 - idx0);
    } else {
        var idx1 = url.indexOf(".com/") + 5;
        var idx2 = url.indexOf("/", idx1);
        var idx3 = url.indexOf("?", idx1);
        var idx4 = url.length - 1;
        if (idx2 === -1) {
            idx2 = idx4;
        }
        if (idx3 === -1) {
            idx3 = idx4;
        }
        idx5 = Math.min(idx2, idx3);
        return url.substr(idx1, idx5 - idx1);
    }
}

// https://www.facebook.com/?command=stop
// https://www.facebook.com/?command=start
// https://www.facebook.com/?add_friends_to_group_id=210515320339278&command=start
// https://www.facebook.com/?add_friends_to_group_id=210515320339278&command=start&keep_friends=1