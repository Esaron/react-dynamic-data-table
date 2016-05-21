#!/bin/bash

if [ ! -d build ]; then
    mkdir build;
fi
browserify -t [ babelify --presets [ react ] ] src/js/app.js -o build/app.js
