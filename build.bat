@echo off
setlocal enabledelayedexpansion

if [%1] == [] (
    REM Download submodules
    git submodule update --remote --init --recursive

    REM Build material theme
    cd bootstrap-material-design
    call npm install
    cd ..

    REM build main js and css
    call npm install
    call npm run-script build

    REM Move all files to dist
    if not exist "release" mkdir release
    if not exist "release\js" mkdir release\js
    if not exist "release\css" mkdir release\css
    if not exist "release\img" mkdir release\img
    if not exist "release\data" mkdir release\data
    set mainDir=%cd%
    xcopy !mainDir!\bootstrap-material-design\dist\css\bootstrap-material-design.min.css !mainDir!\release\css\ /y
    xcopy !mainDir!\bootstrap-material-design\dist\js\bootstrap-material-design.min.js !mainDir!\release\js\ /y
    xcopy !mainDir!\src\js\scripts\*.js !mainDir!\release\js\ /y
    xcopy !mainDir!\src\css\*.css !mainDir!\release\css\ /y
    xcopy !mainDir!\src\img\*.* !mainDir!\release\img\ /y
    xcopy !mainDir!\src\html\*.* !mainDir!\release\ /y
    xcopy !mainDir!\dist\*.js !mainDir!\release\js\ /y
    xcopy !mainDir!\node_modules\glm-client-base\dist\glm.umd.js !mainDir!\release\js\ /y
    xcopy !mainDir!\node_modules\glm-client-base\dist\glm-config.js !mainDir!\release\js\ /y
    xcopy !mainDir!\src\data\*.* !mainDir!\release\data\ /y
) else if "%1" == "update" (
    REM Download submodules
    git submodule update --remote --init --recursive
) else if "%1" == "glm-build" (
    call npm run-script build
) else if "%1" == "copy" (
    if not exist "release" mkdir release
    if not exist "release\js" mkdir release\js
    if not exist "release\css" mkdir release\css
    if not exist "release\img" mkdir release\img
    if not exist "release\data" mkdir release\data
    set mainDir=%cd%
    xcopy !mainDir!\bootstrap-material-design\dist\css\bootstrap-material-design.min.css !mainDir!\release\css\ /y
    xcopy !mainDir!\bootstrap-material-design\dist\js\bootstrap-material-design.min.js !mainDir!\release\js\ /y
    xcopy !mainDir!\src\js\scripts\*.js !mainDir!\release\js\ /y
    xcopy !mainDir!\src\css\*.css !mainDir!\release\css\ /y
    xcopy !mainDir!\src\img\*.* !mainDir!\release\img\ /y
    xcopy !mainDir!\src\html\*.* !mainDir!\release\ /y
    xcopy !mainDir!\dist\*.js !mainDir!\release\js\ /y
    xcopy !mainDir!\node_modules\glm-client-base\dist\glm.umd.js !mainDir!\release\js\ /y
    xcopy !mainDir!\node_modules\glm-client-base\dist\glm-config.js !mainDir!\release\js\ /y
    xcopy !mainDir!\src\data\*.* !mainDir!\release\data\ /y
)