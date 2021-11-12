
import "./helpers/external_links.js";
import log from "electron-log";
import dash from './CE-Producer/appRender/dash'
import {ipcRenderer} from 'electron';
import dashRequest from "./CE-Producer/appRender/dashRequest";
import dashError from "./CE-Producer/appRender/dashError";
import updates from "./CE-Producer/updates/updates";

const dashMLog = log.scope("DashboardMain");
var CronJob = require('cron').CronJob;

let counter = 0;

updates();
let token;
let deployment = {};
let endpoints;

document.getElementById("dashboard-table").addEventListener('click', async function (event) {
    //event.preventDefault();
    if(event.target.value){
        let epValue = event.target.value;
        log.info(event.target.value);
        //new go live function

        return
    }
})

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
                    '30 * * * * *',
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
    let tags = args;
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
