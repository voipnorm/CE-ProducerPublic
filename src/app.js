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


const { ipcRenderer } = require('electron');
const dashMLog = log.scope("DashboardMain");
var CronJob = require('cron').CronJob;

let counter = 0;

updates();

let token;
let deployment = {};
let endpoints;//Static data used to load the liveDevices array and request connections
let removedDevices = []; //devices that have been removed from the current dashboard
let liveDevices = [];//Device array after connection has been requested through the join conference
let username, password;
let job;
let liveTags;//tags that are currently being used to download webex devices
let arguements = {};

//endpoints contains the cloud DB data used to create the session data stored in the liveDevices array

async function loadData(tags, reload){
    try{
        liveTags = tags;
        dashMLog.info("Loading dashboard");
        ipcRenderer.send("TokenRequest",{type: "accessGet", token: null});
        ipcRenderer.on("TokenRequest-reply", async (event, args) => {
            log.info(args);
            token = args.token;
            if(args.type === "accessGet"){
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
    }catch(e){
        log.error(e)
    }
}

async function createJob(args){
    try{
        job = new CronJob(
            '05 * * * * *',
            async function() {
                await tableData(args)
            },
            null,
            true,
            'America/Los_Angeles'
        );
        return job.start()
    }catch(e){
        log.error(e);
        return
    }
}

async function cancelJob(){
    try{
        job = null;
        return
    }catch(e){
        log.error(e);
        return
    }
}

ipcRenderer.on('msgToMainWindow', async (event, args) => {
    liveTags = args.tags;
    username = args.username;
    password = args.password;

    log.info("My tags: "+liveTags);
    loadData(liveTags);
})

async function tableData(args){
    counter += 1;
    let requestWCH = await dashRequest(args);
    if(requestWCH.Error) return dashError("dashboard-table",requestWCH.Error);
    if(counter > 1 ) requestWCH.renew = true;
    dashMLog.info("Dashboard counter, request number: "+ counter);
    endpoints = requestWCH.items;

    //before building dashboard check if any endpoints are removed
    let filtered = await filterRemovedDevices();
    endpoints = filtered;
    log.info(filtered)
    dashBoard(endpoints, args);
    return
}

document.getElementById("addTagbtn").addEventListener('click', async function (event) {
    let newtag = document.getElementById('addTag').value;
    liveTags = liveTags+","+newtag;
    job.stop();
    job = null;
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
    await removedDevicesCheck();
    job.stop();
    job = null;
    await createJob(arguements);
    await tableData(arguements);
});

document.getElementById("remoteDial").addEventListener('click', async function (event) {
    //read settings to ensure endpoint joins in the correct state
    //when the endpoint joins the call enter the endpoint into array to track
    //Clicking the join button loads the endpoints into the live data array
    liveDevices = [];

    document.getElementById('remoteDial').style.display = 'none';
    document.getElementById('remoteDisconnect').style.display = '';
    document.getElementById('addTagbtn').disabled = true;
    document.getElementById('removeDevice').disabled = true;

    let dialstring = document.getElementById('remoteTarget').value;
    let videoMute = document.getElementById('muteVideoCheck').checked;

    endpoints.forEach(ep => {
        ep.username = username;
        ep.password =  password;
        //create a new liveDevice and push into ld Array
        let ld = new xCommandEndpoint(ep);
        ld.connect();
        ld.join(dialstring);
        if(videoMute === true){
            ld.muteVideo();
        }
        liveDevices.push(ld)
    })
});

document.getElementById("remoteDisconnect").addEventListener('click', async function (event) {
    //disconnect from call and reset device to orignal state
    document.getElementById('remoteDisconnect').style.display = 'none';
    document.getElementById('remoteDial').style.display = '';

    document.getElementById('addTagbtn').disabled = false;
    document.getElementById('removeDevice').disabled = false;
    liveDevices.forEach(async (ep) => {
        await ep.disconnect();
        await ep.closeConnect();
    })

});


document.getElementById("muteAll").addEventListener('click', async function (event) {
    endpoints.forEach(async ep => {
        await muteMe("1234567"+ep.id);
    })

});

/*
Remove device is a three step process:
Remove device from current table
Remove device after any future requests to webex are made

 */
//toggle buttons from goLive to muteMe

//monitoring the table for changes to the endpoint desired state

document.getElementById("dashboard-table").addEventListener('click', async function (event) {
    //event.preventDefault();
    if(event.target.value){
        let epValue = event.target.value;
        log.info(event.target.value);

        let testString = event.target.value;
        //new go live function

        //switch to select which button or function is required
        switch (true) {
            case /goLive/.test(testString):
                await live(testString);
                break;
            case /muteMe/.test(testString):
                await muteMe(testString);
                break;
            default:
                log.info("• Didn't match any test");
                break;
        }

        return
    }
});

async function live(elementId){
    try {
        let id = elementId.slice(7);
        log.info(id);
        //log.info(liveDevices);
        document.getElementById(`goLive.`+id).style.display = 'none';
        document.getElementById(`muteMe.`+id).style.display = '';
        //find endpoint requested live session from liveDevices array
        let liveEP = await findDevice(id);

        //log.info(liveEP);

        let goLiveOptions = await endpointOptions(id);

        let nowLive = await liveEP.goLive(goLiveOptions)
    }catch(e){
        log.error(e)
    }
}

async function muteMe(elementId){
    let id = elementId.slice(7);
    log.info(id);
    document.getElementById(`muteMe.`+id).style.display = 'none';
    document.getElementById(`goLive.`+id).style.display = '';
    let liveEP = await findDevice(id);

    //log.info(liveEP);

    let muteOptions = await endpointOptions(id);

    let notLive = await liveEP.muteMe(muteOptions)
}

async function findDevice(id){
    return new Promise((resolve, reject) => {
        try{
            let theOne;
            let found;
            liveDevices.map(device => {
                if(device.id === id) found = device ;
            });
            resolve(found)
        }catch(e){
            log.error(e);
            reject(e)
        }
    })
}

async function endpointOptions(id){
    return new Promise((resolve, reject) =>{
        try{
            let tableOptions = ['muteVolume', 'setVolume', 'muteMic', 'muteVideo'];
            let returnOptions = {};
            let deviceOptions = tableOptions.forEach((option,index) => {
                let value = document.getElementById(option + "." + id).checked;
                returnOptions[option] = value;
                if(index+1 === tableOptions.length){
                    resolve(returnOptions);
                }
            });

        }catch(e){
            log.error(e)
            reject(e)
        }
    })
}
//check that any removed devices to not return to the live dashboard
async function removedDevicesCheck(){
    return new Promise(async (resolve,reject) => {
        try{
            let selectedInfo =  await getDeviceDetails();
            selectedInfo.forEach(endpoint =>{
                removedDevices.push(endpoint);
            });
            let filtered = await filterRemovedDevices();
            endpoints = filtered;
            resolve(log.info(endpoints))
        }catch(e){
            log.error(e)
            reject(e)
        }
    })
}

async function filterRemovedDevices(){
    return new Promise((resolve, reject) => {
        try{
            if(removedDevices.length === 0){
                resolve(endpoints)
            } else {
                let yFilter = removedDevices.map(itemY => { return itemY.id; });

                let filteredX = endpoints.filter(itemX => !yFilter.includes(itemX.id));

                resolve(filteredX)

            }
        }catch(e){
            log.error(e)
            reject(e)
        }
    })
}
