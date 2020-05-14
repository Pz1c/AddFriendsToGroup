var arr_friends = [];

function getFBIDfromURL(url) {
    var idx0 = url.indexOf("?id=");
    if (idx0 !== -1) {
        return url.substr(idx0 + 4);
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

function scanFriends() {
    $("html, body").animate({ scrollTop: $(document).height() }, 500);
    
    var before_count = arr_friends.length;

    var arr_a = $('a img[width="80"]');
    console.log('a img[width="80"]', arr_a.length);
    for (var i = 0, Ln = arr_a.length; i < Ln; ++i) {
        var link = $(arr_a[i]).parent().attr("href");
        var frn_lnk = getFBIDfromURL(link);
        if (frn_lnk === "pages") {
            break;
        }
        console.log(i, Ln, link, frn_lnk);
        if ((frn_lnk != '') && (arr_friends.indexOf(frn_lnk) === -1)) {
            arr_friends.push(frn_lnk);
        }
    }

    if (before_count !== arr_friends.length) {
        setTimeout(scanFriends, 1000);
    } else {
        // go to group
        //storeFriends();
    }
}

function storeFriends(callback) {
    chrome.storage.local.set({arr_friend: arr_friends}, function() {
        console.log('set ar 2');
        if (callback) {
            callback();
        }
      });
}

function checkFriends() {
    chrome.storage.local.get(['arr_friend'], function(result) {
        if (!result.arr_friend || result.arr_friend.length == 0) {
            storeFriends(function() { 
                console.log('set ar 2', arr_friends); 

                if (window.location.href.indexOf("/friends") === -1) {
                    window.location.href = 'https://www.facebook.com/me/friends';
                    return ;
                } else {
                    console.log('time to parse friends');
                    setTimeout(scanFriends, 5000);
                } });
        } else {
            arr_friend = result.arr_friend;
        }
      });
}

function justDoIt() {
    if ($(location).attr('href').indexOf("command=clean") !== -1) {
        arr_friends = [];
        storeFriends(checkFriends);
    } else {
        checkFriends();
    }
    console.log('real_script: ' + $(location).attr('href'));
}

$( document ).ready(function() {
    justDoIt();
});