import log from 'electron-log';
import {getStatusText} from '../helpers/processStatusCodes';

import CustomData from '../services/customUserData/remoteCustomUserData';
import request from "../services/httpRequests/axiosRequest";

import https from 'https';

const dashRLog = log.scope("DashRequest");
var proxy;

var requestData = null;
var offlineDevices = null;
var onlineDevices = null;

export default async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            dashRLog.info("Loading dashRequest")
            const baseUrl = "https://webexapis.com/v1/";
            let url;

            let userData = new CustomData();
            let settings = await userData.getCustomData();

            proxy = settings.webProxy;
            log.info(data.option);
            if (data.option === "org") {
                url = "devices?orgId=" + data.value + "&max=1000";
            }
            if (data.option === "tags") {
                url = "devices?tag=" + data.value + "&max=1000";
            }
            if (data.option === 'callStatus') {
                url = `xapi/status?deviceId=${data.id}&name=Call%5B*%5D.*`;
                let options = {
                    method: "get",
                    url: baseUrl + url,
                    access_token: data.token,
                };
                let response = await singleRequest(options);
                log.info(response);
                resolve(response);

            }else{
                dashRLog.info("Dash Request url: " + url);

                let options = {
                    method: "get",
                    url: baseUrl + url,
                    access_token: data.token,
                };

                dashRLog.info("Options url passed to request :" + options.url);
                let response = await sendRequest(options);
                log.info(response);
                resolve(response);
            }
        } catch (e) {
            dashRLog.error(await getStatusText(e.statusCode));
            dashRLog.error(e);
            reject({Error: await getStatusText(e.statusCode)});
        }
    })

}

//Needs some work and should replace request above
async function sendRequest(req) {
    return new Promise(async (resolve, reject) => {
        try {
            requestData = [];
            offlineDevices = [];
            onlineDevices = [];
            let options = {
                method: req.method,
                url: req.url,//baseUrl + req.urlExt,
                httpsAgent: new https.Agent({rejectUnauthorized: false}),
                headers: {
                    "Authorization": "Bearer " + req.access_token,
                    "Accept": "application/json",
                },
            };
            dashRLog.info("Options url passed to request :" + options.url);
            let response = await request(options);
            dashRLog.info(JSON.stringify(response.headers))
            log.info(response.data)
            if (response.headers.link) {
                let page = await parseLink("link:" + response.headers.link);
                if (page.next) {
                    dashRLog.info("More data coming in next request");
                    let rd = response.data.items;
                    rd.map(item => {
                        if(item.product != "Cisco Webex Share"){
                            log.info("Timing test")
                            requestData.push(item);
                        }
                        if (item.connectionStatus === "disconnected") {
                            offlineDevices.push(item)
                        } else {
                            onlineDevices.push(item)
                        }
                    })
                    req.url = page.next;
                    resolve(await sendRequest(req))
                }
            } else {
                //finish off reading data into array
                let rd = response.data.items;
                rd.map(item => {
                    if(item.product != "Cisco Webex Share"){
                        log.info("Timing test")
                        requestData.push(item);
                    }
                    if (item.connectionStatus === "disconnected") {
                        offlineDevices.push(item)
                    } else {
                        onlineDevices.push(item)
                    }
                })

                dashRLog.info("Request Completed");
                dashRLog.info(requestData);
                //resolve({all:requestData, offline:offlineDevices, online: onlineDevices});
                resolve({items: requestData});
            }
        } catch (e) {
            dashRLog.error("Request error: " + e);
            reject("Error");
        }
    })
}

async function parseLink(data) {
    try {
        let arrData = data.split("link:")
        data = arrData.length == 2 ? arrData[1] : data;
        let parsed_data = {}
        arrData = data.split(",")
        for (let d of arrData) {
            let linkInfo = /<([^>]+)>;\s+rel="([^"]+)"/ig.exec(d)
            parsed_data[linkInfo[2]] = linkInfo[1]
        }
        dashRLog.info(parsed_data);
        return parsed_data;
    } catch (e) {
        dashRLog.error("ParseLink error: "+e);
        return e;
    }
}


async function singleRequest(req) {
    return new Promise(async (resolve, reject) => {
        try {

            log.info(proxy);
            let options = {
                method: req.method,
                url: req.url,//baseUrl + req.urlExt,
                httpsAgent: new https.Agent({rejectUnauthorized: false}),
                headers: {
                    "Authorization": "Bearer " + req.access_token,
                    "Accept": "application/json",
                },
            };
            let response = await request(options);
            resolve(response.data)
        } catch (e) {
            log.error("Request failed" + e);
            reject(e)
        }
    })
}
