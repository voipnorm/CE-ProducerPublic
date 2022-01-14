//dashboard table module
'use strict'

import log from "electron-log";
import Tabulator from 'tabulator-tables';
//import "../../../helpers/external_links.js";
import dashRequest from "./dashRequest";

//var Chart = require('chart.js');


const dashTabLog = log.scope("DashTable");

var table;
var firstRun = true;

let endpointTableData = [];

///ip/web/call-control shell.openExternal(href);

async function dashBoard(data, args) {
    try {
        dashTabLog.info("Do we refresh? "+args.renew);
        let withStatus = await checkStatus(data, args);

        //set values for overall results

        if (args.renew) {
            //refresh data function
            log.info("Table refresh");
            return table.updateData(withStatus);
        }

        let withGoLiveCheck = await buildGolLiveChecks(withStatus);

        table = new Tabulator("#dashboard-table", {
            data: withGoLiveCheck,
            index: "id",
            //height:600, // Set height of table, this enables the Virtual DOM and improves render speed
            width: 1400,

            layout: "fitData",
            //layout: "fitColumns",
            //headerSort:false,                   // Disable header sorter
            columnHeaderVertAlign:"bottom",
            resizableColumns: true,             // Disable column resize
            responsiveLayout: true,              // Enable responsive layouts
            placeholder: "No Data Available",
            pagination: "local",       //paginate the data
            paginationSize: 25,         //allow 7 rows per page of data
            paginationSizeSelector: [25, 50, 100, 200, true],
            selectable: true,
            columns: [
                {title: "App", field: "appConnected", sorter: "string", headerFilter: false},
                {title: "System", field: "displayName", sorter: "string", headerFilter: false},
                {title: "Go Live", field: "connect", formatter: "html", headerSort: false},
                {title:"Go Live Controls",
                    columns:[
                        {title: "Mute Mic", field: "muteMic", formatter: "html", headerSort: false, headerVertical:true},
                        {title: "Mute Video", field: "muteVideo", formatter: "html", headerSort: false, headerVertical:true},
                        {title: "Mute Volume", field: "muteVolume", formatter: "html", headerSort: false, headerVertical:true},
                        {title: "Set Volume", field: "setVolume", formatter: "html", headerSort: false, headerVertical:true},
                    ]
                },
                /*{title:"Status", field:"status", formatter:"traffic", formatterParams:{
                    min:0,
                    max:10,
                    color:["green","orange","red"]
                }},*/
                {title: "Call Status", field: "callStatus", sorter: "string", formatter: "html"},
                {title: "IP Address", field: "ip", formatter: customLinkformat},
                {title: "Tags", field: "tags", headerFilter: false},
            ],
            rowClick: function (e, row) {
                log.info(row);
            },
        });

        return

    } catch (e) {
        dashTabLog.error(e);
    }
}
function buildGolLiveChecks(data){
   return new Promise(async (resolve, reject) => {
       try{
           let promises = data.map(async (endpoint) => {
               endpoint.connect = `<div class="form-check">
                                <button id="goLive.${endpoint.id}" value="goLive.${endpoint.id}" type="button" class="connectButton btn btn-success btn-sm">Go Live</button>
                                <button id="muteMe.${endpoint.id}" value="muteMe.${endpoint.id}" type="button" style="display: none;" class="connectButton btn btn-danger btn-sm">Mute Me</button>
                          </div>`;
               endpoint.muteVolume = `<div class="form-check"><input class="mute systemName form-check-input"
                          type="checkbox" name="volumeSelect" value="muteVolume.${endpoint.id}" id="muteVolume.${endpoint.id}" data-toggle="tooltip" data-placement="top"></div>`;
               endpoint.setVolume = `<div class="form-check"><input class="setVolume systemName form-check-input"
                          type="checkbox" name="setVolumeSelect" value="setVolume.${endpoint.id}" id="setVolume.${endpoint.id}" data-toggle="tooltip" data-placement="top"></div>`;
               endpoint.muteMic = `<div class="form-check"><input class="mute systemName form-check-input"
                          type="checkbox" name="muteMic" value="muteMic.${endpoint.id}" id="muteMic.${endpoint.id}" data-toggle="tooltip" data-placement="top"></div>`;
               endpoint.muteVideo = `<div class="form-check"><input class="mute systemName form-check-input"
                          type="checkbox" name="muteVideo" value="muteVideo.${endpoint.id}" id="muteVideo.${endpoint.id}" data-toggle="tooltip" data-placement="top"></div>`;

           })
           const results = await Promise.all(promises);
           resolve(data)
       }catch(e){
           log.error(e)
       }
   })
}
function checkStatus(data, args) {
    return new Promise(async (resolve, reject) => {
        try {
            log.info(data)
            let connectE = 0, disconectedE = 0, connectedWithIssuesE = 0;
            //Arrays
            let connectivity, channel, product;

            let roomKit = 0, board = 0, desk = 0, share = 0, legacy = 0;

            let beta = 0, stable = 0, latest = 0, preview = 0;

            data.forEach(async function (endpoint) {
                switch (endpoint.connectionStatus) {
                    case "connected":
                        endpoint.status = 1;
                        connectE++
                        break
                    case "connected_with_issues":
                        endpoint.status = 5;
                        connectedWithIssuesE++
                        break
                    case "disconnected":
                        endpoint.status = 10;
                        endpoint.callStatus = "Disconnected";
                        disconectedE++
                        break
                    default:
                        endpoint.status = 10;
                        break
                }
                let p = endpoint.product;
                switch (true) {
                    case /Cisco Webex Board.*/.test(p):
                        board++
                        break
                    case /Cisco Webex Room Kit.*/.test(p):
                        roomKit++
                        break
                    case /Cisco Webex Share.*/.test(p):
                        share++
                        break
                    case /Cisco Webex Desk Pro/.test(p):
                    case /Cisco Webex DX80/.test(p):
                        desk++
                        break
                    default:
                        legacy++
                        break
                }

                dashTabLog.log(endpoint.displayName + ": " + endpoint.connectionStatus + " = " + endpoint.status)
            })

            product = [board, roomKit, share, desk, legacy];
            connectivity = [connectE, disconectedE, connectedWithIssuesE];
            channel = [beta, stable, latest, preview];
            if (firstRun === true) {
                firstRun = false;
            }

            let promises = data.map(async (endpoint) => {
                log.info(endpoint)
                if (endpoint.connectionStatus === "disconnected") return endpoint.callStatus = "Disconnected";
                endpoint.callStatus = await checkCallStatus(endpoint, args);
                endpoint.connect = `<div class="form-check">
                                <button id="goLive.${endpoint.id}" value="goLive.${endpoint.id}" type="button" class="connectButton btn btn-success btn-sm">Go Live</button>
                                <button id="muteMe.${endpoint.id}" value="muteMe.${endpoint.id}" type="button" style="display: none;" class="connectButton btn btn-danger btn-sm">Mute Me</button>
                          </div>`;
            })
            const results = await Promise.all(promises);

            resolve(data);

        } catch (e) {
            dashTabLog.error(e);
            reject();
        }
    })
}

function customLinkformat(cell, formatterParams) {
    //cell - the cell component
    //formatterParams - parameters set for the column
    let key = cell.getValue()
    let link = `https://${key}/web/call-control`;
    //(`<a href="${link}" class="js-external-link">${key}</a>`)
    return `<a class="js-external-link" href="${link}" >${key}</a>`; //return the contents of the cell;

}

function checkCallStatus(endpoint, args) {
    return new Promise(async (resolve, reject) => {
        try {
            endpoint.token = args.token;
            endpoint.option = "callStatus";
            if (endpoint.sipUrls.length > 1) {
                dashTabLog.info("Possible personal mode device");
                resolve(`<div style="color:blue">Unknown</div>`);
            }
            let response = await dashRequest(endpoint);
            if (Object.keys(response.result).length === 0) {
                resolve(`<div style="color:red">Disconnected</div>`);
            } else {
                resolve(`<div style="color:green">Connected</div>`);
            }

        } catch (e) {
            log.error(e);
            resolve(`<div style="color:blue">Unknown</div>`);
        }
    })
}

function getDeviceDetails() {
    return new Promise(async (resolve, reject) => {
        try {
            let selectedData = await table.getSelectedData();
            log.info(selectedData);
            //data needs to be processed to return only whats needed
            resolve(selectedData)
        } catch (e) {
            log.error(e)
            reject(e);
        }
    })
    //recover device details of device selected in table

    //
}

export {dashBoard, getDeviceDetails}