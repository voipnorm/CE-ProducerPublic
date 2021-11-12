import request from "../services/httpRequests/axiosRequest";
import log from 'electron-log';
import https from 'https';
import qs from 'qs';

const baseUrl = "https://webexapis.com/v1/";
const depLog = log.scope("CloudDeviceIDRequest");

var requestData = null;
var offlineDevices = null;
var onlineDevices = null;

async function requestDeviceIDS(endpoint) {
    return new Promise(async (resolve, reject) =>{
        try {
            let orgId,tag,urlExt;

            if(endpoint.orgId){
                orgId = "?orgId=" + endpoint.orgId;
                urlExt = "devices" + orgId+"&max=1000";
            }else{
                log.info("Tags being processed"+ endpoint.tags);
                //tags based request

                tag = "?" + qs.stringify({tag:endpoint.tags});
                //tag = "?tag=" + qs.stringify(endpoint.tags);
                //https://webexapis.com/v1/devices?tag=home&max=10000
                urlExt = "devices" + tag+"&max=1000";
            }
            let req = {
                url: baseUrl +urlExt,
                method: "GET",
                access_token: endpoint.access_token
            };
            let response = await sendRequest(req);
            if(response === 'Error'|| response.all.length === 0){
                depLog.info(response)
                resolve({status:"danger",message:"Org ID or Tag may not exist"});
            }else{
                resolve(response);
            }
        } catch (e) {
            depLog.error(e);
            resolve({status:"danger",message:"Org ID or Tag may not exist"});
        }
    })

}

async function sendRequest(req) {
    return new Promise(async (resolve,reject) => {
        try {
            requestData = [];
            offlineDevices = [];
            onlineDevices = [];
            let options = {
                method: req.method,
                url: req.url,//baseUrl + req.urlExt,
                httpsAgent: new https.Agent({ rejectUnauthorized: false}),
                headers: {
                    "Authorization": "Bearer " + req.access_token,
                    "Accept": "application/json",
                },
            };
            depLog.info("Options url passed to request :"+options.url);
            let response = await request(options);
            depLog.info(JSON.stringify(response.headers))
            if(response.headers.link){
                let page = await parseLink("link:"+response.headers.link);
                if(page.next){
                    depLog.info("More data coming in next request");
                    let rd = response.data.items;
                    rd.map(item => {
                        requestData.push(item);
                        if(item.connectionStatus === "disconnected"){
                            offlineDevices.push(item)
                        }else{
                            onlineDevices.push(item)
                        }
                    })
                    req.url = page.next;
                    resolve(await sendRequest(req))
                }
            }else{
                //finish off reading data into array
                let rd = response.data.items;
                rd.map(item => {
                    requestData.push(item);
                    if(item.connectionStatus === "disconnected"){
                        offlineDevices.push(item)
                    }else{
                        onlineDevices.push(item)
                    }
                })

                depLog.info("Request Completed");
                depLog.info(requestData);
                resolve({all:requestData, offline:offlineDevices, online: onlineDevices});
            }
        } catch (e) {
            depLog.error("Request error"+ e);
            reject("Error");
        }
    })
}

async function parseLink(data) {
    try{
        let arrData = data.split("link:")
        data = arrData.length == 2? arrData[1]: data;
        let parsed_data = {}
        arrData = data.split(",")
        for (let d of arrData){
            let linkInfo = /<([^>]+)>;\s+rel="([^"]+)"/ig.exec(d)
            parsed_data[linkInfo[2]]=linkInfo[1]
        }
        depLog.info(parsed_data);
        return parsed_data;
    }catch(e){
        depLog.error(e);
        return e;
    }
}

export {requestDeviceIDS}
