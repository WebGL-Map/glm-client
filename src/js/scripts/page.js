const defaultConText = '<strong style="font-weight: 700;">Connecting</strong> to ';

// Init material design
$(document).ready(function () {
    let jqBody = $('body');
    jqBody.bootstrapMaterialDesign();

    window.dataManager = new window.DataManager($("#infoText"), $("#glCanvas"), jqBody);
});
// preform auto loading
$(document).ready(function () {
    // Set ip and port to null
    let ip   = null;
    let port = null;
    let auto = false;
    // check if auto
    if(window.DEFAULT_PLUGIN_CONFIG.autoLogin) {
        ip = window.DEFAULT_PLUGIN_CONFIG.autoLoginAddress;
        port = window.DEFAULT_PLUGIN_CONFIG.autoLoginPort;
        auto = true;
    } else {
        // Get parameters
        let url        = window.location.href;
        let paramKvps  = url.split('?');
        let paramArray = [];
        paramKvps      = paramKvps.pop().split('&');
        // Split params into kvp array
        for (let i = 0; i < paramKvps.length; i++) {
            let kvp            = paramKvps[i].split('=');
            paramArray[kvp[0]] = kvp[1];
        }
        // Get ip and port
        ip   = paramArray['ip'];
        port = paramArray['port'];
        // get option to auto connect
        auto = paramArray['auto'];
    }
    // set text
    setIpAndPortText(ip, port);
    if (auto !== 'false' && ip != null && port != null) {
        $('#mainForm').submit();
    } else {
        $('#mainForm').fadeIn('fast');
    }
});

function setInfoText(string) {
    $('#infoText').text(string);
}

function setIpAndPortText(ip, port) {
    // Set fields
    if (ip != null) {
        $('#ip').val(ip).closest('.form-group').addClass('is-filled');
    }
    if (port != null) {
        $('#port').val(port).closest('.form-group').addClass('is-filled');
    }
}