var url_string = window.location.href;
var url = new URL(url_string);
var c = url.searchParams.get("r");

if(c=== null){
    // do Nothing
    // return
} else{
    document.getElementById('refered_by').value=c;
}

$('#shareBlock').cShare({
      showButtons: [
        'fb',
        'line',
        'plurk',
        'weibo',
        '<a href="https://www.jqueryscript.net/tags.php?/twitter/">twitter</a>',
        'tumblr',
        'email'
      ]
    });
    