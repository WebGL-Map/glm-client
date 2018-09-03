const path = require('path');

const entryFile = './src/js/main.js';

module.exports = {
    entry    : {
        dp: entryFile,
    },
    output   : {
        path         : __dirname + '/dist',
        filename     : '[name].umd.js',
        libraryTarget: 'umd',
    },
    module   : {
        rules: [
            {
                test   : path.join(__dirname, 'src/js'),
                loader : 'babel-loader',
                options: {
                    presets: ["env", "stage-1"],
                }
            },
            {
                test   : path.join(__dirname, 'src/js/glm/plugins/config.js'),
                loader : 'file-loader',
                options: {
                    name: 'base-plugin-config.js',
                }
            }
        ]
    },
    externals: {
        "GLM_CONFIG"           : 'window',
        "glm-client-base"      : 'window',
        "math.gl"              : 'window',
        "DEFAULT_PLUGIN_CONFIG": 'window'
    }
};