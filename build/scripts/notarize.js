require('dotenv').config();
const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
    const { electronPlatformName, appOutDir } = context;
    if (electronPlatformName !== 'darwin') {
        return false;
    }
    console.log("Notarizing app...");
    console.time("Notarize");
    const appName = context.packager.appInfo.productFilename;

    await notarize({
        appBundleId: 'com.voipnorm.CE-Remote',
        appPath: `${appOutDir}/${appName}.app`,
        appleId: process.env.APPLEID,
        appleIdPassword: process.env.APPLEIDPASSWORD,
    });
    console.timeEnd("Notarize");
    console.log("Done");
    return true;
};