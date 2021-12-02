/*
Module duties
Collect endpoint data
Build main table

 */
import "./helpers/external_links.js";
import log from "electron-log";
import dash from './CE-Producer/appRender/dash'
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
let endpoints;
let liveDevices = [];
let username, password;

//endpoints contains the cloud DB data used to create the session data stored in the liveDevices array

async function loadData(tags){
    try{
        dashMLog.info("Loading dashboard");
        ipcRenderer.send("TokenRequest",{type: "accessGet", token: null});
        ipcRenderer.on("TokenRequest-reply", async (event, args) => {
            log.info(args);
            token = args.token;
            if(args.type === "accessGet"){
                //log.info(args)
                let args = {
                    token: token,
                    value: tags,
                    option: "tags"
                }

                await tableData(args);
                var job = new CronJob(
                    '05 * * * * *',
                    async function() {
                        await tableData(args)
                    },
                    null,
                    true,
                    'America/Los_Angeles'
                );
                job.start()

            }
        })
    }catch(e){
        log.error(e)
    }
}

ipcRenderer.on('msgToMainWindow', async (event, args) => {
    let tags = args.tags;
    username = args.username;
    password = args.password;

    log.info("My tags: "+tags);
    loadData(tags);
})

async function tableData(args){
    counter += 1;
    let requestWCH = await dashRequest(args);
    if(requestWCH.Error) return dashError("dashboard-table",requestWCH.Error);
    if(counter > 1 ) requestWCH.renew = true;
    dashMLog.info("Dashboard counter, request number: "+ counter);
    endpoints = requestWCH.items;
    dash(requestWCH, args);
    return
}

document.getElementById("remoteDial").addEventListener('click', async function (event) {
    //read settings to ensure endpoint joins in the correct state
    //when the endpoint joins the call enter the endpoint into array to track
    //Clicking the join button loads the endpoints into the live data array
    liveDevices = [];

    document.getElementById('remoteDial').style.display = 'none';
    document.getElementById('remoteDisconnect').style.display = '';

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