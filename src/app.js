/*
Module duties
Collect endpoint data
Build main table

 */
import "./helpers/external_links.js";
import log from "electron-log";
import {dashBoard, getDeviceDetails} from './CE-Producer/appRender/dash'
import dashRequest from "./CE-Producer/appRender/dashRequest";
import dashError from "./CE-Producer/appRender/dashError";
import updates from "./CE-Producer/updates/updates";
import xCommandEndpoint from "./CE-Producer/appRender/deviceLocal";


const {ipcRenderer} = require('electron');
const {dialog, BrowserWindow} = require('@electron/remote');
const dashMLog = log.scope("DashboardMain");
var CronJob = require('cron').CronJob;

let counter = 0;

updates();

let token;
let deployment = {};
let endpoints = {};//Static data used to load the liveDevices array and request connections
let removedDevices = []; //devices that have been removed from the current dashboard
let liveDevices = [];//Device array after connection has been requested through the join conference
let username, password;
let job;
let liveTags;//tags that are currently being used to download webex devices
let arguements = {};

//endpoints contains the cloud DB data used to create the session data stored in the liveDevices array

async function loadData(tags, reload) {
    try {
        liveTags = tags;
        dashMLog.info("Loading dashboard");
        ipcRenderer.send("TokenRequest", {type: "accessGet", token: null});
        ipcRenderer.on("TokenRequest-reply", async (event, args) => {
            log.info(args);
            token = args.token;
            if (args.type === "accessGet") {
                //log.info(args)
                arguements = {
                    token: token,
                    value: liveTags,
                    option: "tags"
                }

                await tableData(arguements);
                await createJob(arguements);
            }
        })
    } catch (e) {
        log.error(e)
    }
}

async function createJob(args) {
    try {
        job = new CronJob(
            '05 * * * * *',
            async function () {
                await tableData(args)
            },
            null,
            true,
            'America/Los_Angeles'
        );
        return job.start()
    } catch (e) {
        log.error(e);
        return
    }
}

async function cancelJob() {
    try {
        job = null;
        return
    } catch (e) {
        log.error(e);
        return
    }
}

ipcRenderer.on('msgToMainWindow', async (event, args) => {
    liveTags = args.tags;
    username = args.username;
    password = args.password;

    log.info("My tags: " + liveTags);
    loadData(liveTags);
})

async function tableData(args) {
    if (counter === 0) {
        args.renew = false;
    } else {
        args.renew = true
    }

    counter += 1;
    let requestWCH = await dashRequest(args);
    if (requestWCH.Error) return dashError("dashboard-table", requestWCH.Error);

    dashMLog.info("Dashboard counter, request number: " + counter);
    endpoints = requestWCH.items;

    //before building dashboard check if any endpoints are removed
    let filtered = await filterRemovedDevices();



    endpoints = filtered;
    log.info(filtered)
    await dashBoard(endpoints, args);
    return
}

document.getElementById("reload").addEventListener('click', async function (event) {
    BrowserWindow.getFocusedWindow().webContents.reloadIgnoringCache();
});
document.getElementById("addTagbtn").addEventListener('click', async function (event) {
    let newtag = document.getElementById('addTag').value;
    liveTags = liveTags + "," + newtag;
    job.stop();
    job = null;
    counter = 0;
    //update to tags in arguements
    arguements = {
        token: token,
        value: liveTags,
        option: "tags"
    }
    await createJob(arguements);
    await tableData(arguements);
});

document.getElementById("removeDevice").addEventListener('click', async function (event) {
    counter = 0;
    await cycleDashboard();
});

//connect the application to all devices in the table before you start to control them.
document.getElementById("connect").addEventListener('click', async function (event) {
    try {
        //open websocket or ssh session before controlling endpoint
        liveDevices = [];

        document.getElementById('connect').style.display = 'none';
        document.getElementById('disconnect').style.display = '';
        document.getElementById('remoteDial').disabled = false;
        document.getElementById('muteAll').disabled = false;
        document.getElementById('addTagbtn').disabled = true;
        document.getElementById('removeDevice').disabled = true;
        document.getElementById('goLive').disabled = false;
        let dialstring = document.getElementById('remoteTarget').value;
        let videoMute = document.getElementById('muteVideoCheck').checked;

        endpoints.map(async ep => {
            try {
                ep.username = username;
                ep.password = password;
                //create a new liveDevice and push into ld Array
                let ld = new xCommandEndpoint(ep);
                await ld.connect();
                log.info(`Connected to endpoint ${ep.ip} setting appConnected to true`);
                ep.appConnected = true
                liveDevices.push(ld)
            } catch (e) {
                ep.appConnected = false;
                log.info("Failed to connect to endpoint");
                log.error(e);
            }

        })
        log.info("endpoints connection completed, cycling dashboard")
        await cycleDashboard()
    } catch (e) {
        log.error("Connecting to endpoints failed " + e);
    }

});

// close connection between endpoint and the application regardless of call state
document.getElementById("disconnect").addEventListener('click', async function (event) {
    //disconnect from device and close ssh session
    document.getElementById('disconnect').style.display = 'none';
    document.getElementById('connect').style.display = '';
    document.getElementById('remoteDial').disabled = true;
    document.getElementById('muteAll').disabled = true;
    document.getElementById('addTagbtn').disabled = false;
    document.getElementById('removeDevice').disabled = false;
    document.getElementById('goLive').disabled = true;

    liveDevices.forEach(async (ep) => {
        await ep.closeConnect();
    })
    liveDevices = [];
    await cycleDashboard();
});


document.getElementById("remoteDial").addEventListener('click', async function (event) {

    document.getElementById('remoteDial').style.display = 'none';
    document.getElementById('remoteDisconnect').style.display = '';

    let dialstring = document.getElementById('remoteTarget').value;
    let videoMute = document.getElementById('muteVideoCheck').checked;

    liveDevices.forEach(ld => {
        ld.join(dialstring);
        if (videoMute === true) {
            ld.muteVideo();
        }
    })
});

document.getElementById("remoteDisconnect").addEventListener('click', async function (event) {
    //disconnect from call and reset device to orignal state
    document.getElementById('remoteDisconnect').style.display = 'none';
    document.getElementById('remoteDial').style.display = '';

    document.getElementById('addTagbtn').disabled = false;
    document.getElementById('removeDevice').disabled = false;
    liveDevices.map(async (ep) => {
        await ep.disconnect();
    })

});


document.getElementById("muteAll").addEventListener('click', async function (event) {
   try{
       await muteMe(endpoints);
   } catch(e){
       log.error(e)
   }
});

/*
Remove device is a three step process:
Remove device from current table
Remove device after any future requests to webex are made

 */


//monitoring the table for changes to the endpoint desired state

document.getElementById("dashboard-table").addEventListener('click', async function (event) {
    //event.preventDefault();
    if (event.target.value) {
        let epValue = event.target.value;
        log.info(event.target.value);

        let testString = event.target.value;
        //new go live function

        //switch to select which button or function is required
        switch (true) {
            case /goLive/.test(testString):
                await liveTable(testString);
                break;
            case /muteMe/.test(testString):
                await muteMeTable(testString);
                break;
            default:
                log.info("• Didn't match any test");
                break;
        }

        return
    }
});

async function liveTable(elementId){
    try {
        let id = elementId.slice(7);
        log.info(id);
        //log.info(liveDevices);

        //find endpoint requested live session from liveDevices array
        let liveEP = await findDevice(id);
        //log.info(liveEP);
        if (!liveEP) {
            //application has no local connection to device
            await dialogErrorPrompt("Connect to endpoints before attempting to 'GoLive'")
            return
        }
        document.getElementById(`goLive.`+id).style.display = 'none';
        document.getElementById(`muteMe.`+id).style.display = '';
        //log.info(liveEP);

        let goLiveOptions = await endpointOptions(id);

        let nowLive = await liveEP.goLive(goLiveOptions)
    }catch(e){
        log.error(e)
    }
}

async function muteMeTable(elementId){
    let id = elementId.slice(7);
    log.info(id);
    document.getElementById(`muteMe.`+id).style.display = 'none';
    document.getElementById(`goLive.`+id).style.display = '';
    let liveEP = await findDevice(id);

    //log.info(liveEP);

    let muteOptions = await endpointOptions(id);

    let notLive = await liveEP.muteMe(muteOptions)
}
//toggle buttons from goLive to muteMe
document.getElementById("goLive").addEventListener('click', async function (event) {
    try {
        let sd = await getDeviceDetails();
        await live(sd)
    } catch (e) {
        log.error(e)
    }
});

document.getElementById("muteMe").addEventListener('click', async function (event) {
    try {
        let sd = await getDeviceDetails();
        await muteMe(sd)
    } catch (e) {
        log.error(e)
    }
});

async function live(devices) {
    try {
        devices.map(async (ep) => {
            try {
                let id = ep.id;
                log.info(id);
                //log.info(liveDevices);
                //find endpoint requested live session from liveDevices array
                let liveEP = await findDevice(id);
                //log.info(liveEP);
                if (!liveEP) {
                    //application has no local connection to device
                    await dialogErrorPrompt("Connect to endpoints before attempting to 'GoLive'")
                    return
                }
                let goLiveOptions = await endpointOptions(id);

                let nowLive = await liveEP.goLive(goLiveOptions)
            } catch (e) {
                log.error(e)
            }

        })
        document.getElementById(`goLive`).style.display = 'none';
        document.getElementById(`muteMe`).style.display = '';
    } catch (e) {
        log.error(e)
    }
}

async function muteMe(devices) {
    try{
        devices.map(async (ep) => {
            let id = ep.id;
            log.info(id);
            let liveEP = await findDevice(id);

            //log.info(liveEP);

            let muteOptions = await endpointOptions(id);

            let notLive = await liveEP.muteMe(muteOptions)
        })
        document.getElementById(`muteMe`).style.display = 'none';
        document.getElementById(`goLive`).style.display = '';
    }catch(e){
        log.error(e)
    }
}

async function findDevice(id) {
    return new Promise((resolve, reject) => {
        try {
            let theOne;
            let found;
            liveDevices.map(device => {
                if (device.id === id) found = device;
            });
            resolve(found)
        } catch (e) {
            log.error(e);
            reject(e)
        }
    })
}

async function endpointOptions(id) {
    return new Promise((resolve, reject) => {
        try {
            let tableOptions = ['muteVolume', 'setVolume', 'muteMic', 'muteVideo'];
            let returnOptions = {};
            let deviceOptions = tableOptions.forEach((option, index) => {
                let value = document.getElementById(option + "." + id).checked;
                returnOptions[option] = value;
                if (index + 1 === tableOptions.length) {
                    resolve(returnOptions);
                }
            });

        } catch (e) {
            log.error(e)
            reject(e)
        }
    })
}

//check that any removed devices to not return to the live dashboard
async function removedDevicesCheck() {
    return new Promise(async (resolve, reject) => {
        try {
            let selectedInfo = await getDeviceDetails();
            selectedInfo.forEach(endpoint => {
                removedDevices.push(endpoint);
            });
            let filtered = await filterRemovedDevices();
            endpoints = filtered;
            resolve(log.info(endpoints))
        } catch (e) {
            log.error(e)
            reject(e)
        }
    })
}

async function filterRemovedDevices() {
    return new Promise(async (resolve, reject) => {
        try {
            //set if devices is in livedevice array to update table
            await liveDevicesCheck();

            if (removedDevices.length === 0) {
                resolve(endpoints)
            } else {
                let yFilter = removedDevices.map(itemY => {
                    return itemY.id;
                });

                let filteredX = endpoints.filter(itemX => !yFilter.includes(itemX.id));

                resolve(filteredX)

            }
        } catch (e) {
            log.error(e)
            reject(e)
        }
    })
}

async function liveDevicesCheck() {
    //check is devices are connected to app via ssh to populate table
    return new Promise((resolve, reject) => {
        try {
            endpoints.map(ep => {
                if (liveDevices.find(o => o.id === ep.id)) {
                    ep.appConnected = true
                } else {
                    ep.appConnected = false
                }
            })
            resolve()
        } catch (e) {
            log.error(e)
            reject(e)
        }
    })
}

async function cycleDashboard() {
    //check if devices are connected to app via ssh to populate table
    return new Promise(async (resolve, reject) => {
        try {
            await removedDevicesCheck();
            job.stop();
            job = null;
            await createJob(arguements);
            await tableData(arguements);
            resolve()
        } catch (e) {
            log.error(e)
            reject(e)
        }
    })
}

async function dialogErrorPrompt(message) {
    //present user dialog error
    return new Promise(async (resolve, reject) => {
        try {
            dialog.showErrorBox("Error", message);
            resolve()
        } catch (e) {
            log.error(e)
            reject(e)
        }
    })
}



