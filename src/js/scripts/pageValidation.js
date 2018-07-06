var successfulValidations = 0;
var hostRegex             = /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;///^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;

var BasePage = function () {
    // Init Register Form Validation, for more examples you can check out https://github.com/jzaefferer/jquery-validation
    var initValidationRegister = function () {
        jQuery('.mainForm').validate({
            errorClass: 'c-invalid-feedback', //text-right animated fadeInDown
            errorElement: 'span',
            highlight: function (e) {
                jQuery(e).closest('.form-group').removeClass('has-danger').addClass('has-danger');
            },
            success: function (e) {
                jQuery(e).closest('.form-group').removeClass('has-danger');
                successfulValidations++;
            },
            rules: {
                'ip': {
                    required: true,
                    validAddress: true
                },
                'port': {
                    required: true,
                    validPort: true
                }
            },
            messages: {
                'ip': {
                    required: 'Please enter a hostname, IPv4 or IPv6 address',
                    validAddress: 'Please enter a valid hostname, IPv4 or IPv6 address'
                },
                'port': {
                    required: 'Please enter a port',
                    validPort: 'Please enter a port within range 0 - 65535'
                }
            },
            submitHandler : function (form) {
                const height = $(form).height();
                $(form).fadeOut('fast', function () {
                    let ip = $('#ip').val();
                    let port = $('#port').val();
                    $('#holder').height(height);
                    $('#conText').html(defaultConText + ip);
                    $('#loadingDiv').css("display","table-cell").fadeIn('fast', function () {
                        setInfoText("Connecting..");
                        window.dataManager.init();
                        window.dataManager.connectToMainServer(ip, port);
                    });
                });
            }
        });
    };

    return {
        init: function () {
            // Init Register Form Validation
            initValidationRegister();
        }
    };
}();

function isString(value) {
    return typeof value === 'string' || value instanceof String;
}

function isHex(value) {
    return (parseInt(value, 16).toString(16) === value.toLowerCase())
}

function rangeCheck(val, start, end) {
    return val >= start && val <= end;
}

function portCheck(value) {
    return rangeCheck(parseInt(value), 0, 65535);
}

function ipv4Check(value) {
    let val = value.split('.').filter(Boolean);
    if(val.length < 4) {
        return false;
    }
    for (let i=0;i<val.length;i++) {
        if(!rangeCheck(val[i], 0, 255)) {
            return false;
        }
    }
    return true;
}

function ipv6Check(value) {
    let val = value.split(':').filter(Boolean);
    if(val.length < 7) {
        return false;
    }
    if(val.length === 7) {
        for (let i=0;i<val.length - 1;i++) {
            if(!(val[i].length === 4 && isHex(val[i]))) {
                return false;
            }
        }
        return ipv4Check(val[val.length-1]);
    } else if(val.length === 8) {
        for (let i=0;i<val.length;i++) {
            if(!(val[i].length === 4 && isHex(val[i]))) {
                return false;
            }
        }
        return true;
    }
    return false;
}

function hostnameCheck(value) {
    return hostRegex.test(value);
}

// Initialize when page loads
jQuery(function () {
    // Port validator
    jQuery.validator.addMethod("validPort", function(value, element) {
        if(this.optional(element)) {
            return this.optional(element);
        } else {
            return portCheck(value);
        }
    });
    // ipv4 / ipv6 / host name validator
    jQuery.validator.addMethod("validAddress", function(value, element) {
        if(this.optional(element)) {
            return this.optional(element);
        } else {
            if(isString(value)) {
                return hostnameCheck(value) || ipv4Check(value) || ipv6Check(value);
            }
            return false;
        }
    });

    BasePage.init();
});