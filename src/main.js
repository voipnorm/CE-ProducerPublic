// This is main process of Electron, started as first thing when your
// app starts. It runs through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import path from "path";
import url from "url";
import {app, Menu, ipcMain, shell, dialog, BrowserWindow} from "electron";
import appMenuTemplate from "./menu/app_menu_template";
import editMenuTemplate from "./menu/edit_menu_template";
import devMenuTemplate from "./menu/dev_menu_template";
import createWindow from "./helpers/window";
import keytar from 'keytar';
import log from "electron-log";
import jetpack from "fs-jetpack";
import checkCustomExistance from './helpers/checkCustomExistance';
import tokenExpiration from './CE-Producer/services/tokenExpiration/tokenExpire';
import OauthProvider from "./CE-Producer/services/oauth/oauth2provider";
import {getAccessToken,
    getRefreshToken,
    setAccessToken,
    logout,
    getIntegrationToken,
    setIntegrationToken} from "./CE-Producer/services/oauth/credStore";
import customUserData from "./CE-Producer/services/customUserData/customUserData";

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from "env";

const {autoUpdater} = require('electron-updater');
autoUpdater.logger = require("electron-log");
autoUpdater.logger.transports.file.level = "info";


let {authorize_url, access_token_url, response_type, client_secret, client_id, redirect_uri, state, scope} = env;

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== "production") {
    const userDataPath = app.getPath("userData");
    app.setPath("userData", `${userDataPath} (${env.name})`);
}

const setApplicationMenu = () => {
    const menus = [appMenuTemplate, editMenuTemplate];
    if (env.name !== "production") {
        menus.push(devMenuTemplate);
    }
    Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};
//Check for custom settings file
checkCustomExistance();


// We can communicate with our window (the renderer process) via messages.
const initIpc = () => {
    ipcMain.on("need-app-path", (event, arg) => {
        event.reply("app-path", app.getAppPath());
    });
    ipcMain.on("open-external-link", (event, href) => {
        log.info("external link request to open browser");
        shell.openExternal(href);
    });
};

let loginWindow, splash, te, setupWindow, mainWindow;



app.on("ready", async () => {
    setApplicationMenu();
    initIpc();
    mainWindow = new BrowserWindow({
        width: 1300,
        height: 900,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
        },
        show: false
    });
    //perform checks to make sure we are ready to go before letting someone login
    //checks to perform: is there a valid guest issuer ID stored
    //checks to perform: have they accepted the default integration
    //step 1: add guest issuer id and secret
    //step 2: accept default integration or add your own
    //step 3: move to login screen
    let shouldWeSetup = await checkInitialSetup();

    if (shouldWeSetup === true) {
        ipcMain.on("loginScreen", async (event, args) => {
            await login(event, args);
            setupWindow.close();
            setupWindow = null;
        });
        await intialSetup();
    } else {
        await login();
    }

    ipcMain.on("authorized", async (event, args) => {
        loginWindow.close();
        loginWindow = null;
        openAPP(args);
    })

    ipcMain.on("unauthorized", async (event, args) => {
        log.info("User not authorized for application")
    })
    mainWindow.once('show', () => {
        autoUpdater.checkForUpdatesAndNotify();
    });

    autoUpdater.on('checking-for-update', () => {
        mainWindow.webContents.send('checking-for-update');
    });
    autoUpdater.on('update-not-available', (ev, info) => {
        mainWindow.webContents.send('update-not-available');
    });
    autoUpdater.on('update-available', () => {
        mainWindow.webContents.send('update-available');
    });
    autoUpdater.on('update-downloaded', () => {
        mainWindow.webContents.send('update_downloaded');
    });
    autoUpdater.on('download-progress', (progressObj) => {
        let log_message = "Download speed: " + progressObj.bytesPerSecond;
        log_message = log_message + ' - Downloaded ' + Math.round(progressObj.percent) + '%';
        log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
        mainWindow.webContents.send('download-progress', log_message);
    })
    autoUpdater.on('error', (err) => {
        mainWindow.webContents.send('update-error', err);
    })
});

app.on("window-all-closed", () => {
    app.quit();
});

ipcMain.on("oauth", async (event, args) => {
    await authorize(event, args);
})
ipcMain.on("connectToEndpoint", async (event, args) => {
    log.info(args)
    await openConnectWindow(args);
});
async function login() {
    try {
        setApplicationMenu();
        initIpc();

        //check for valid token and return it from keytar if valid
        //has to be solid though, user could get stuck if the token is not really valid
        //need to have a refresh token option just in case its not right.

        //check

        loginWindow = new BrowserWindow({
            width: 1000,
            height: 800,
            center: true,
            webPreferences: {
                // Two properties below are here for demo purposes, and are
                // security hazard. Make sure you know what you're doing
                // in your production app.
                nodeIntegration: true,
                contextIsolation: false,
                // Spectron needs access to Producer module
                enableRemoteModule: env.name === "test"
            },
            frame: false,
            skipTaskbar: true,
            resizable: false,
            show: false
        });

        loginWindow.loadURL(
            url.format({
                pathname: path.join(__dirname, "login.html"),
                protocol: "file:",
                slashes: true
            })
        );
        loginWindow.webContents.on('did-finish-load', function () {
            loginWindow.show();
        });
        loginWindow.on("close", async () => {
            loginWindow = null;
        });

        if (env.name === "development") {
            loginWindow.openDevTools();
        }
        ipcMain.on("resetSettings", async (event, args) => {
            await resetSettings(args)
        });
    } catch (e) {
        log.error(e);
        //return loginWindow()
    }
}

function openAPP(data) {
    setApplicationMenu();
    initIpc();
    splash = new BrowserWindow({
        width: 1000,
        height: 800,
        center: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: false,
        },
        frame: false,
        skipTaskbar: true,
        resizable: false,
        alwaysOnTop: false,
    });
    splash.loadURL(`file://${__dirname}/splash.html`);
    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "app.html"),
            protocol: "file:",
            slashes: true
        })
    );
    ipcMain.on('showMainWindow', () => {
        splash.destroy();
        mainWindow.show();
        te = tokenExpiration();
    });
    mainWindow.webContents.on('did-finish-load', function () {
        mainWindow.webContents.send('msgToMainWindow', data);
    });
    if (env.name === "development") {
        mainWindow.openDevTools();
    }
}

async function authorize(event, args) {
    try {
        let userDataDir = jetpack.cwd(app.getPath("userData"));
        let stateStoreFile = `custom_env_${env.name}.json`;
        let readState = userDataDir.read(stateStoreFile, "json");
        //log.info(readState);
        if (!readState.custom_secret_id) {
            log.info("Default integration keys used.");
        } else {
            log.info("Custom integration key enabled");
            client_id = readState.custom_client_id;
            client_secret = readState.custom_secret_id;
        }
        //process saved token from keystore if requested
        if (args === 'saved') {
            let token = await keytar.getPassword("CE_Producer", "CE_Producer");

            if (token === null) {
                return event.sender.send("oauth-reply", {
                    status: 'danger',
                    error: "No saved token available. Please use Get My Token."
                });
            }
            let t = JSON.parse(token);
            let accessToken = t.access;
            log.info(token)
            return event.sender.send("oauth-reply", {status: "success", tkn: accessToken});
        } else {

            let options = {
                auth_url: authorize_url,
                token_url: access_token_url,
                response_type: response_type,
                client_secret: client_secret,
                client_id: client_id,
                redirect_uri: redirect_uri,
                state: state,
                scope: [scope],
                scope_deliminator: ' ',
            }
            log.info("Token request recieved.....");
            let oauthWindow = new BrowserWindow({

                width: 800,
                height: 600,
                center: true,
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true,
                },
                resizable: false,
                frame: true
            });
            oauthWindow.on("close", async () => {
                try {
                    let response = await oauthWindow.webContents.session.clearStorageData();
                } catch (e) {
                    log.error(e)
                }
            });
            oauthWindow.once("closed", async () => {
                oauthWindow = null
            });
            const provider = new OauthProvider(options);
            log.info("Open window")
            const ses = oauthWindow.webContents.session;
            let tokenResponse = await provider.begin(oauthWindow, ses);
            log.info("Access token provided and processing.");
            log.info(tokenResponse);

            let token = tokenResponse;

            te = tokenExpiration();
            await setAccessToken(token);
            return event.sender.send("oauth-reply", {status: "success", tkn: token.access});
        }
    } catch (e) {
        log.error("Oauth error restart application." + e);
        dialog.showErrorBox("Token failed", "Please try again. I was unable to get your token this time around " + e);
        return event.sender.send("oauth-reply", {status: 'danger', error: e});
    }

}

function openConnectWindow(args) {
    setApplicationMenu();
    initIpc();
    let connectWindow = new BrowserWindow({
        width: 1600,
        height: 1200,
        center: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
        resizable: true,
    });
    connectWindow.webContents.once("did-finish-load", () => {
        connectWindow.webContents.send('msgToConnectWindow', args);
    })
    connectWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "connectWin.html"),
            protocol: "file:",
            slashes: true
        })
    );

    connectWindow.once("closed", () => {
        connectWindow = null
    });

    if (env.name === "development") {
        connectWindow.openDevTools();
    }

}

async function checkInitialSetup(args) {
    const cud = new customUserData();
    let state = await cud.getCustomData();
    log.info(state)
    /*
    if (state.guestID === '') {
        log.info("No Guest ID setup doing intial setup");
        return true
    } else {
        log.info("Guest ID setup not doing intial setup");
        return false
    }*/
    //skipping for now, guest not required
    return false
}

async function intialSetup(args) {
    try {
        setApplicationMenu();
        initIpc();

        //check for valid token and return it from keytar if valid
        //has to be solid though, user could get stuck if the token is not really valid
        //need to have a refresh token option just in case its not right.

        //check

        setupWindow = new BrowserWindow({
            width: 1000,
            height: 800,
            center: true,
            webPreferences: {
                // Two properties below are here for demo purposes, and are
                // security hazard. Make sure you know what you're doing
                // in your production app.
                nodeIntegration: true,
                contextIsolation: false,
                // Spectron needs access to Producer module
                enableRemoteModule: true
            },
            frame: false,
            skipTaskbar: true,
            resizable: false,
        });

        setupWindow.loadURL(
            url.format({
                pathname: path.join(__dirname, "setGuest.html"),
                protocol: "file:",
                slashes: true
            })
        );

        setupWindow.on("close", async () => {
            setupWindow = null;
        });

        if (env.name === "development") {
            setupWindow.openDevTools();
        }

    } catch (e) {
        log.error(e);
    }

}

async function resetSettings(args) {
    ipcMain.on("loginScreen", async (event, args) => {
        await login(event, args);
        setupWindow.close();
        setupWindow = null;
    });
    await intialSetup();
}
//access tokens from key store with out constant prompting
ipcMain.on("TokenRequest", async (event, args) => {

    let type = args.type;

    let token = args.token;

    let tokenRequest= {
        async guestSet (token){
            await setGuestToken(token);
            return null
        },
        async guestGet (){
            let gt = await getGuestToken();
            return gt
        },
        async integrationSet (token){
            await setIntegrationToken(token);
            return null
        },
        async integrationGet(){
            let it = await getIntegrationToken();
            return it
        },
        async accessSet (token){
            await setAccessToken(token);
            return null
        },
        async accessGet (){
            log.info("Pulling token from keystore")
            let at = await getAccessToken();

            return at
        }
    }

    let tkn = await tokenRequest[type](token);
    //log.info(tkn);
    if(tkn !=  null){
        return event.sender.send("TokenRequest-reply", {type: type,token: tkn})
    }
})

//auto update configuration

ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});

