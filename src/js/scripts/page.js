const defaultConText = '<strong style="font-weight: 700;">Connecting</strong> to ';

// Init material design
$(document).ready(function () {
    let jqBody = $('body');
    jqBody.bootstrapMaterialDesign();

    window.dataManager = new window.DataManager($("#infoText"), $("#glCanvas"), jqBody);
    window.BasePlugin.registerPlugin();
});
// preform auto loading
$(document).ready(function () {
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
    let ip   = paramArray['ip'];
    let port = paramArray['port'];
    // Set fields
    if (ip != null) {
        $('#ip').val(ip).closest('.form-group').addClass('is-filled');
    }
    if (port != null) {
        $('#port').val(port).closest('.form-group').addClass('is-filled');
    }
    // get option to auto connect
    let auto = paramArray['auto'];
    if (auto !== 'false' && ip != null && port != null) {
        $('#mainForm').submit();
    } else {
        $('#mainForm').fadeIn('fast');
    }
});

function setInfoText(string) {
    $('#infoText').text(string);
}