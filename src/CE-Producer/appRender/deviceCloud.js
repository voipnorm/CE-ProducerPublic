//File to make status, config and cloud based calls for informaiton

const EventEmitter = require('events');
import log from 'electron-log';
import axios from 'axios';
import https from 'https';
import CustomData from '../services/customUserData/remoteCustomUserData';

const HttpsProxyAgent = require('https-proxy-agent');

const mchE = log.scope("httpEndpoint");

axios.defaults.adapter = require('axios/lib/adapters/http');

export default class httpEndpoint extends EventEmitter {
    constructor(endpoint) {
        super();
        this.token = endpoint.token;
        this.url = `https://webexapis.com/v1/xapi/`;
        this.deviceurl = 'https://webexapis.com/v1/';
        this.id = endpoint.id;
        this.proxy = {};
    }
    getProxy(){
        return new Promise(async resolve => {
            try{
                log.info("Getting proxy details")
                let userData = new CustomData();
                let settings = await userData.getCustomData();
                log.info(settings.webProxy);
                resolve(this.proxy = settings.webProxy);
            }catch(e){
                mchE.error(e)
            }
        })
    }
    getOptions(commandKey, args, body) {
        return new Promise(resolve => {
            try {
                let postData = {
                    "deviceId": this.id,
                };
                if(args) postData.arguments = args;
                if(body) postData.body = body;

                let options = {
                    method: "POST",
                    decompress: true,
                    url: `${this.url}command/${commandKey}`,
                    headers: {
                        "Authorization": "Bearer " + this.token,
                        "Accept": "application/json",
                    },
                    data: postData,

                };
                resolve(options)
            } catch (e) {
                mchE.error(e)
                resolve(e)
            }
        })
    }
    getConfigOptions(key, value) {
        return new Promise(resolve => {
            try {
                let patchData = {
                    "path": key+ "/sources/configured/value",
                    "value": value,
                    "op": "replace"
                };

                let options = {
                    method: "PATCH",
                    url: `${this.deviceurl}deviceConfigurations?deviceId=${this.id}`,
                    headers: {
                        "Authorization": "Bearer " + this.token,
                        "Content-Type": "application/json-patch+json",
                    },
                    data: JSON.stringify(patchData),

                };
                resolve(options)
            } catch (e) {
                mchE.error(e);
                resolve(e)
            }
        })
    }

    request(options) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.getProxy();
                log.info(this.proxy);
                let optWProxy = options;
                let agent;

                if(this.proxy.host != "DIRECT"){
                    //proxy auth

                    if(this.proxy.username != ''){
                        agent = new HttpsProxyAgent({
                            host: this.proxy.host,
                            port: this.proxy.port,
                            auth: `${this.proxy.username}:${this.proxy.password}`,
                            rejectUnauthorized: false
                        });
                    }else{
                        agent = new HttpsProxyAgent({
                            host: this.proxy.host,
                            port: this.proxy.port,
                            rejectUnauthorized: false
                        });
                    }

                }else{
                    agent = new https.Agent({rejectUnauthorized: false});
                }
                optWProxy.httpsAgent = agent;

                let response = await axios(optWProxy);
                resolve(response)
            } catch (error) {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    log.info(error.response.data);
                    log.info(error.response.status);
                    log.info(error.response.headers);
                } else if (error.request) {
                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                    // http.ClientRequest in node.js
                    log.info(error.request);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    log.info('Error', error.message);
                }
                log.info(error.config);
                reject(error)
            }
        })
    }
    getMacroList(){
        return new Promise(async resolve => {
            try{
                let commandKey = "Macros.Macro.Get";
                let options = await this.getOptions(commandKey);
                let response = await this.request(options)
                resolve(response);
            }catch(e){
                mchE.error(e)
                resolve(e)
            }
        })
    }
    removeMacro(name){
        return new Promise(async resolve => {
            try{
                let commandKey = "Macros.Macro.Remove";
                let args = {Name: name};
                let options = await this.getOptions(commandKey, args);
                let response = await this.request(options)
                resolve(response);
            }catch(e){
                mchE.error(e)
                resolve(e)
            }
        })
    }
    addMacro(name, content){
        return new Promise(async resolve => {
            try{
                let commandKey = "Macros.Macro.Save";
                let args = {Name: name};
                let body =  content;
                let options = await this.getOptions(commandKey, args, body);
                let response = await this.request(options);
                resolve(response);
            }catch(e){
                mchE.error(e)
                resolve(e)
            }
        })
    }
    removeAllMacros(){
        return new Promise(async resolve => {
            try{
                let commandKey = "Macros.Macro.RemoveAll";
                let options = await this.getOptions(commandKey);
                let response = await this.request(options);
                resolve(response);
            }catch(e){
                mchE.error(e)
                resolve(e)
            }
        })
    }
    restartMacroEngine(){
        return new Promise(async resolve => {
            try{
                let commandKey = "Macros.Runtime.Restart";
                let options = await this.getOptions(commandKey);
                let response = await this.request(options);
                resolve(response);
            }catch(e){
                mchE.error(e)
                resolve(e)
            }
        })
    }
    activateMacro(name){
        return new Promise(async resolve => {
            try{
                let commandKey = "Macros.Macro.Activate";
                let args = {Name: name};
                let options = await this.getOptions(commandKey, args);
                let response = await this.request(options);
                resolve(response);
            }catch(e){
                mchE.error(e)
                resolve(e)
            }
        })
    }
    deactivateMacro(name){
        return new Promise(async resolve => {
            try{
                let commandKey = "Macros.Macro.Deactivate";
                let args = {Name: name};
                let options = await this.getOptions(commandKey, args);
                let response = await this.request(options);
                resolve(response);
            }catch(e){
                mchE.error(e)
                resolve(e)
            }
        })
    }
    getMacro(name){
        return new Promise(async resolve => {
            try{
                let commandKey = "Macros.Macro.Get";
                let args = {Content: "True", Name: name};
                let options = await this.getOptions(commandKey, args);
                let response = await this.request(options);
                resolve(response);
            }catch(e){
                mchE.error(e)
                resolve(e)
            }
        })
    }
    engineStatus(){
        return new Promise(async resolve => {
            try{
                let commandKey = "Macros.Runtime.Status";
                let options = await this.getOptions(commandKey);
                let response = await this.request(options);
                resolve(response);
            }catch(e){
                mchE.error(e)
                resolve(e)
            }
        })
    }
    //xCommand Macros Log Get Offset: 20
    macroLogs(){
        return new Promise(async resolve => {
            try{
                let commandKey = "Macros.Log.Get";
                let args = {Offset: 20};
                let options = await this.getOptions(commandKey);
                let response = await this.request(options);
                resolve(response);
            }catch(e){
                mchE.error(e)
                resolve(e)
            }
        })
    }
    enableMacroEngine(){
        return new Promise(async resolve => {
            try{
                let commandKey = "Macros.Mode";
                let value = "On";
                let options = await this.getConfigOptions(commandKey,value);
                let response = await this.request(options);
                resolve(response);
            }catch(e){
                mchE.error(e)
                resolve(e)
            }
        })
    }
}
