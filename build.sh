#!/bin/sh
if [ -z "$1" ]; then
    cd bootstrap-material-design
    git submodule update --remote --init --recursive
    npm install
    cd ..
    npm install
    npm run-script build
    mkdir -p release/js
    mkdir -p release/css
    mkdir -p release/img
    mkdir -p release/data
    cp bootstrap-material-design/dist/js/bootstrap-material-design.min.js release/js/
    cp bootstrap-material-design/dist/css/bootstrap-material-design.min.css release/css/
    cp src/js/scripts/*.js release/js/
    cp src/css/*.css release/css/
    cp src/img/* release/img/
    cp src/html/* release/
    cp dist/* release/js/
    cp node_modules/glm-client-base/dist/* release/js/
    cp src/data/* release/data/
fi
