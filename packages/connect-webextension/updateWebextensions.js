/**
 * Utility script. Not part of example itself. It only helps put the example together.
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const rootPaths = ['./'];

rootPaths.forEach(dir => {
    const rootPath = path.join(__dirname, dir);
    const vendorPath = path.join(rootPath, 'vendor');

    // TODO: We should not need trezor-connect.js in the extension. It should be loaded from npm
    const inlineScriptPath = path.join(vendorPath, 'trezor-connect.js');
    const usbPermissionsScriptPath = path.join(vendorPath, 'trezor-usb-permissions.js');
    const usbPermissionsHtmlPath = path.join(vendorPath, 'trezor-usb-permissions.html');
    const contentScriptPath = path.join(vendorPath, 'trezor-content-script.js');

    if (!fs.existsSync(vendorPath)) {
        fs.mkdirSync(vendorPath);
    }

    [inlineScriptPath, usbPermissionsScriptPath, usbPermissionsHtmlPath, contentScriptPath].forEach(
        path => {
            if (fs.existsSync(path)) {
                fs.rmSync(path);
            }
        },
    );

    fetch('https://connect.trezor.io/9/trezor-connect.js')
        .then(response => response.text())
        .then(text => fs.writeFileSync(inlineScriptPath, text));

    const srcPath = path.join(__dirname, '../connect-web/src/webextension');

    fs.copyFileSync(path.join(srcPath, 'trezor-content-script.js'), contentScriptPath);
    fs.copyFileSync(path.join(srcPath, 'trezor-usb-permissions.js'), usbPermissionsScriptPath);
    fs.copyFileSync(path.join(srcPath, 'trezor-usb-permissions.html'), usbPermissionsHtmlPath);
});
