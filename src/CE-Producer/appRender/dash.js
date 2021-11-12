//dashboard table module
'use strict'

import log from "electron-log";
import Tabulator from 'tabulator-tables';
//import "../../../helpers/external_links.js";
import dashRequest from "./dashRequest";

var Chart = require('chart.js');


const dashTabLog = log.scope("DashTable");

var table;
var statuschart = null, channelchart = null;
var firstRun = true;

///ip/web/call-control shell.openExternal(href);

export default async (data, args) => {
    try{
        dashTabLog.info(data);
        let withStatus = await checkStatus(data, args);

        //set values for overall results

        if(withStatus.renew === true){
            return table.updateData(withStatus.items);
        }
        table = new Tabulator("#dashboard-table", {
            data:withStatus.items,
            index:"id",
            height:600, // Set height of table, this enables the Virtual DOM and improves render speed
            layout:"fitColumns",
            //headerSort:false,                   // Disable header sorter
            resizableColumns:true,             // Disable column resize
            responsiveLayout:true,              // Enable responsive layouts
            placeholder:"No Data Available",
            pagination: "local",       //paginate the data
            paginationSize: 25,         //allow 7 rows per page of data
            paginationSizeSelector:[25, 50, 100, 200, true],
            columns:[
                {title: "Go Live", field:"connect", formatter: "html", headerSort:false, width:150},
                {title:"Status", field:"status", formatter:"traffic", formatterParams:{
                    min:0,
                    max:10,
                    color:["green","orange","red"]
                }},
                {title:"Name", field:"displayName", sorter:"string",headerFilter:true},
                {title:"Tags", field:"tags",headerFilter:true},
                {title:"Status Info", field:"connectionStatus", sorter:"string", hozAlign:"right"},
                //{title: "Call Status", field:"callStatus", sorter:"string", formatter: "html"},
                {title:"IP Address", field:"ip", formatter:customLinkformat},
                {title:"Product", field:"product", sorter:"string"},
            ],
            rowClick:function(e, row){
                log.info(row);
            },
        });
        /*
        document.getElementById("download-csv-dash").addEventListener("click", function (event) {
            event.preventDefault();
            table.download("csv", "data.csv");
        });
        document.getElementById("download-json-dash").addEventListener("click", function (event) {
            event.preventDefault();
            table.download("json", "data.json");
        });*/

        return

    }catch(e){
        dashTabLog.error(e);
    }
}

function checkStatus(data, args){
    return new Promise(async (resolve, reject) => {
        try{

            let connectE = 0, disconectedE = 0, connectedWithIssuesE = 0;
            //Arrays
            let connectivity, channel, product;

            let roomKit = 0, board = 0, desk = 0, share = 0, legacy = 0;

            let beta = 0, stable = 0, latest = 0, preview = 0;

            data.items.forEach(async function(endpoint){
                switch(endpoint.connectionStatus){
                    case "connected":
                        endpoint.status = 1;
                        connectE ++
                        break
                    case "connected_with_issues":
                        endpoint.status = 5;
                        connectedWithIssuesE ++
                        break
                    case "disconnected":
                        endpoint.status = 10;
                        endpoint.callStatus = "Disconnected";
                        disconectedE ++
                        break
                    default:
                        endpoint.status = 10;
                        break
                }
                switch(endpoint.upgradeChannel){
                    case "Beta":
                        beta ++
                        break
                    case "Latest":
                        latest ++
                        break
                    case "Stable":
                        stable ++
                        break
                    case "Preview":
                        preview ++
                        break
                    default:

                        break
                }
                let p = endpoint.product;
                switch(true){
                    case /Cisco Webex Board.*/.test(p):
                        board ++
                        break
                    case /Cisco Webex Room Kit.*/.test(p):
                        roomKit ++
                        break
                    case /Cisco Webex Share.*/.test(p):
                        share ++
                        break
                    case /Cisco Webex Desk Pro/.test(p):
                    case /Cisco Webex DX80/.test(p):
                        desk ++
                        break
                    default:
                        legacy ++
                        break
                }

                dashTabLog.log(endpoint.displayName+": "+endpoint.connectionStatus+ " = "+endpoint.status)
            })

            product = [board, roomKit, share, desk, legacy];
            connectivity = [connectE,disconectedE, connectedWithIssuesE];
            channel = [beta, stable, latest, preview];
            if(firstRun === true){
                deviceResults(connectivity, channel, product);
                firstRun = false;
            }

            let promises = data.items.map(async (endpoint) => {
                log.info(endpoint)
                if(endpoint.connectionStatus === "disconnected") return endpoint.callStatus = "Disconnected";
                //endpoint.callStatus = await checkCallStatus(endpoint, args);
                endpoint.connect = `<div class="form-check"><button id="connect&${endpoint.id}" value="${endpoint.id}" type="button" class="connectButton btn btn-danger btn-sm">Go Live</button>
                          </label></div>`;
            })
            const results = await Promise.all(promises);

            resolve(data);

        }catch(e){
            dashTabLog.error(e);
            reject();
        }
    })
}

function customLinkformat(cell, formatterParams){
    //cell - the cell component
    //formatterParams - parameters set for the column
    let key = cell.getValue()
    let link = `https://${key}/web/call-control`;
    //(`<a href="${link}" class="js-external-link">${key}</a>`)
    return `<a class="js-external-link" href="${link}" >${key}</a>`; //return the contents of the cell;

}

function deviceResults(connectivity, channel, product){
    //drawStatusChart(connectivity);
    //drawChannelChart(channel);
    //drawProductChart(product)
}

function drawStatusChart(data) {
    statuschart = new Chart($('#connectivity'), {
        type: 'pie',
        data: {
            labels: [
                'Online',
                'Offline',
                'w/ Issues'
            ],

            datasets: getStatusDatasets(data)
        },
        options: {
            responsive: false,

            plugins: {
                legend: {
                    position: 'left',
                },
                title: {
                    display: true,
                    text: 'Connectivity'
                }
            },

        },


    });
}

function getStatusDatasets(data) {
    let datasets = [{
        data: data,
        backgroundColor: [
            'rgba(75, 192, 192, 0.2)',
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 206, 86, 0.2)',

        ],
        borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)',

        ],
    }];

    return datasets;
}


function drawChannelChart(data) {
    channelchart = new Chart($('#channel'), {
        type: 'pie',
        data: {
            labels: [
                'Beta',
                'Stable',
                'Latest',
                'Preview',
            ],

            datasets: getChannelDatasets(data)
        },
        options: {
            responsive: false,

            plugins: {
                legend: {
                    position: 'left',
                },
                title: {
                    display: true,
                    text: 'Software Channel'
                }
            },
        },


    });
}

function getChannelDatasets(data) {
    let datasets = [{
        data: data,
        backgroundColor: [
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'

        ],
        borderColor: [
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
        ],
    }];

    return datasets;
}


function drawProductChart(data) {
    channelchart = new Chart($('#product'), {
        type: 'pie',
        data: {
            labels: [
                'Boards',
                'RoomKits',
                'Shares',
                'Desktop',
                'Legacy',
            ],

            datasets: getProductDatasets(data)
        },
        options: {
            responsive: false,

            plugins: {
                legend: {
                    position: 'left',
                },
                title: {
                    display: true,
                    text: 'Product Type'
                }
            },

        },


    });
}

function getProductDatasets(data) {
    let datasets = [{
        data: data,
        backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',

        ],
        borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
        ],
    }];

    return datasets;
}

function checkCallStatus(endpoint, args){
    return new Promise(async (resolve, reject) => {
        try{
            endpoint.token = args.token;
            endpoint.option = "callStatus";
            if(endpoint.sipUrls.length > 1){
                dashTabLog.info("Possible personal mode device");
                resolve(`<div style="color:blue">Unknown</div>`);
            }
            let response = await dashRequest(endpoint);
            if(Object.keys(response.result).length === 0) {
                resolve(`<div style="color:red">Disconnected</div>`);
            }else{
                resolve(`<div style="color:green">Connected</div>`);
            }

        }catch(e){
            log.error(e);
            resolve(`<div style="color:blue">Unknown</div>`);
        }
    })
}
//notes for call status request Call[*].*

//get data for people count etc
function checkAnalytics(endpoint, args){
    return new Promise(async (resolve, reject) => {
        try{
            endpoint.token = args.token;
            endpoint.option = "callStatus";
            if(endpoint.sipUrls.length > 1){
                dashTabLog.info("Possible personal mode device");
                resolve(`<div style="color:blue">Unknown</div>`);
            }
            let response = await dashRequest(endpoint);

            //manipulate the results in here


            /*if(Object.keys(response.result).length === 0) {
                resolve(`<div style="color:red">Disconnected</div>`);
            }else{
                resolve(`<div style="color:green">Connected</div>`);
            }*/

        }catch(e){
            log.error(e);
            resolve(`<div style="color:blue">Unknown</div>`);
        }
    })
}