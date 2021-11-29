"use strict";

//Endpoint file to run xCommands for local endpoints.

const EventEmitter = require('events');
import log from 'electron-log';
import formatMessage from "../helpers/jsonBeautify";

const mcE = log.scope("macroEndpoint");
const jsxapi = require('jsxapi');

//using local to avoid issues with personal devices and reduce perminute request issues with cloud

export default class xCommandEndpoint extends EventEmitter {

    constructor(endpoint) {
        super();
        this.username = endpoint.user.name;
        this.password = endpoint.user.pwd;
        this.url = `ssh://${endpoint.id}`;
        this.wsurl = `ws://${endpoint.id}/ws`;
        this.wssurl = `wss://${endpoint.id}/ws`;
        this.endpoint = endpoint;
        this.xapi;
    }
    connect() {
        mcE.info("SSH connection requested "+this.endpoint.id);
        return new Promise((resolve, reject) => {
            let url =  this.url;
            mcE.info(url);
            let options = {
                username: this.username,
                password: this.password
            };
            this.xapi = jsxapi.connect(url, options)
                .on('error', (e) => {
                    mcE.error(e);
                    //try websocket if ssh fails to connect TBD
                    if(e === "Connection terminated remotely"|| e === "client-socket"){
                        mcE.error("SSH failed to connect trying to use Websockets");
                        this.xapi.close();
                        this.xapi = jsxapi.connect(this.wsurl, options)
                            .on('error', async (e) => {
                                mcE.error(e);
                                let errorstatus = 'danger';
                                let errorMessage = await formatMessage(e);
                                mcE.info(`Error Device ${this.endpoint.id}: ${errorMessage}`);
                                let errormessage = `<strong>Error Device ${this.endpoint.id}: </strong>${errorMessage}`;

                                reject({status: errorstatus, message: errormessage})
                            })
                            .on('ready', async (xapi) => {
                                mcE.info("WS Connection established "+this.endpoint.id);
                                resolve()
                            });
                    }else{
                        mcE.error(e);
                        reject(e)
                    }
                })
                .on('ready', async (xapi) => {
                    mcE.info("SSH Connection established "+this.endpoint.id);
                    resolve()
                });
        })
    };
    xCommand(command, commandKey, args) {
        return new Promise(async (resolve, reject) => {
            try{
                mcE.info("before sending request"+ JSON.stringify(args));
                mcE.info("launch xCommand on-prem");
                if (command === "Command") {
                    let response = await this.xapi[command][commandKey](args);
                    mcE.info(response);
                    await formatMessage(JSON.stringify(response));
                    resolve(response)
                }
                if (command === "Status") {
                    let response = this.xapi[command][commandKey].get(args);
                    mcE.info(response);
                    resolve(response)
                }
                if (command === "Config") {
                    if(commandKey === ''){
                        let response = this.xapi[command].get(args);
                        mcE.info(response);
                        resolve(response)
                    }
                    let response = this.xapi[command][commandKey].set(args);
                    mcE.info(response);
                    resolve(response)
                }
            }catch(e){
                mcE.error(e);
                //need to do something during a http tiimeout. Fetch failed most likely
                //because of FW issues. Needs to be fixed and process restarted
                resolve(e)
            }
        })
    };
    feedback(commandKey){
        mcE.info("setting up feedback for upgrade");
        const off = this.xapi.feedback.on(commandKey, (event) => {
            mcE.info(event);
            this.emit("feedback", event);
            if(event === "AboutToInstallUpgrade"){
                off();
            }
        });
        this.xapi.on("error", error => {
            mcE.error("Feedback error: "+ error);
        })
    };
    async closeConnect() {
        await this.xapi.close();
        return mcE.info(`connexion closed for ${this.endpoint.id || this.endpoint.url}`);
    };
    join(){
        return new Promise(async resolve => {
            try{
                let command  =  "";
                let response = await this.xCommand("Command",command);
                //this.closeConnect();
                resolve(response)
            }catch(e){
                mcE.error(e)
                resolve(e)
            }
        })
    }
    setVolume(){
        return new Promise(async resolve => {
            try{
                let command  =  "";
                let response = await this.xCommand("Command",command);
                //this.closeConnect();
                resolve(response)
            }catch(e){
                mcE.error(e)
                resolve(e)
            }
        })
    }
    getVolume(){
        return new Promise(async resolve => {
            try{
                let command  =  "";
                let response = await this.xCommand("Command",command);
                //this.closeConnect();
                resolve(response)
            }catch(e){
                mcE.error(e)
                resolve(e)
            }
        })
    }
    muteVideo(){
        return new Promise(async resolve => {
            try{
                let command  =  "";
                let response = await this.xCommand("Command",command);
                //this.closeConnect();
                resolve(response)
            }catch(e){
                mcE.error(e)
                resolve(e)
            }
        })
    }
    muteMicrophone(){
        return new Promise(async resolve => {
            try{
                let command  =  "";
                let response = await this.xCommand("Command",command);
                //this.closeConnect();
                resolve(response)
            }catch(e){
                mcE.error(e)
                resolve(e)
            }
        })
    }
    goLive(){
        return new Promise(async resolve => {
            try{
                let command  =  "";
                let response = await this.xCommand("Command",command);
                //this.closeConnect();
                resolve(response)
            }catch(e){
                mcE.error(e)
                resolve(e)
            }
        })
    }
}
