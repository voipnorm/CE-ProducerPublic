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
        this.id = endpoint.id;
        this.username = endpoint.username;
        this.password = endpoint.password;
        this.url = `ssh://${endpoint.ip}`;
        this.wsurl = `ws://${endpoint.ip}/ws`;
        this.wssurl = `wss://${endpoint.ip}/ws`;
        this.endpoint = endpoint;
        this.xapi;
        this.callId;
        this.videoState;
        this.audioState;
    }
    connect() {
        mcE.info("SSH connection requested "+this.endpoint.ip);
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
                                mcE.info(`Error Device ${this.endpoint.ip}: ${errorMessage}`);
                                let errormessage = `<strong>Error Device ${this.endpoint.ip}: </strong>${errorMessage}`;

                                reject({status: errorstatus, message: errormessage})
                            })
                            .on('ready', async (xapi) => {
                                mcE.info("WS Connection established "+this.endpoint.ip);
                                resolve()
                            });
                    }else{
                        mcE.error(e);
                        reject(e)
                    }
                })
                .on('ready', async (xapi) => {
                    mcE.info("SSH Connection established "+this.endpoint.ip);
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
        return mcE.info(`connexion closed for ${this.endpoint.ip || this.endpoint.url}`);
    };
    join(dialString){
        return new Promise(async resolve => {
            try{
                let command  =  "dial";
                let args = {Number: dialString};
                let response = await this.xCommand("Command",command, args);
                //this.closeConnect();
                this.callId =  response.CallId;

                command = "Audio.Microphones.Mute";
                let response2 = await this.xCommand("Command",command);
                log.info(response2);

                resolve(response)
            }catch(e){
                mcE.error(e);
                resolve(e)
            }
        })
    }
    disconnect(){
        return new Promise(async resolve => {
            try{
                let command  =  "call.disconnect";
                let args =  { CallId: this.callId };
                let response = await this.xCommand("Command",command, args);
                log.info(response);
                resolve(response)
            }catch(e){
                mcE.error(e);
                resolve(e)
            }
        })
    }
    muteVolume(){
        return new Promise(async resolve => {
            try{
                let command  =  "Audio.Volume.Mute";
                let response = await this.xCommand("Command",command);
                resolve(response)
            }catch(e){
                mcE.error(e);
                resolve(e)
            }
        })

    }
    unmuteVolume(){
        return new Promise(async resolve => {
            try{
                let command  =  "Audio.Volume.Unmute";
                let response = await this.xCommand("Command",command);
                resolve(response)
            }catch(e){
                mcE.error(e);
                resolve(e)
            }
        })

    }
    setVolume(volume){
        return new Promise(async resolve => {
            try{
                let command  =  "Audio.Volume.Set";
                let args = {Level: volume};
                let response = await this.xCommand("Command",command, args);
                //this.closeConnect();
                resolve(response)
            }catch(e){
                mcE.error(e);
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
                mcE.error(e);
                resolve(e)
            }
        })
    }
    muteVideo(){
        return new Promise(async resolve => {
            try{
                let command  =  "Video.Input.MainVideo.Mute";
                let response = await this.xCommand("Command",command);
                this.videoState = "muted";
                resolve(response)
            }catch(e){
                mcE.error(e);
                resolve(e)
            }
        })
    }
    unmuteVideo(){
        return new Promise(async resolve => {
            try{
                let command  =  "Video.Input.MainVideo.Unmute";
                let response = await this.xCommand("Command",command);
                this.videoState = "muted";
                resolve(response)
            }catch(e){
                mcE.error(e);
                resolve(e)
            }
        })
    }
    muteMicrophone(){
        return new Promise(async resolve => {
            try{
                let command  =  "Audio.Microphones.Mute";
                let response = await this.xCommand("Command",command);
                //this.closeConnect();
                resolve(response)
            }catch(e){
                mcE.error(e)
                resolve(e)
            }
        })
    }
    unmuteMicrophone(){
        return new Promise(async resolve => {
            try{
                let command  =  "Audio.Microphones.Unmute";
                let response = await this.xCommand("Command",command);
                //this.closeConnect();
                resolve(response)
            }catch(e){
                mcE.error(e)
                resolve(e)
            }
        })
    }
    goLive(options){
        return new Promise(async resolve => {
            try{
                //set endpoint options based on selections in table
                if(options.muteMic === false){
                    await this.unmuteMicrophone();
                    this.audioState = true;
                }
                if(options.muteVideo === false){
                    await this.unmuteVideo();
                    this.audioState = true;
                }
                if(options.muteVolume === false){
                    await this.unmuteVolume()
                }
                if(options.setVolume === true){
                    let volume = document.getElementById('volumeRange').value;
                    await this.setVolume(volume)
                }
                resolve(log.info("Endpoint Live"))
            }catch(e){
                mcE.error(e)
                resolve(e)
            }
        })
    }
    muteMe(options){
        return new Promise(async resolve => {
            try{
                //'muteVolume', 'setVolume', 'muteMic', 'muteVideo'
                //set endpoint options based on selections in table
                let videoMute = document.getElementById('muteVideoCheck').checked;

                if(options.muteMic === false || options.muteMic === true){
                    await this.muteMicrophone();
                    this.audioState = false;
                }
                if(options.muteVideo === true || videoMute === true){
                    await this.muteVideo();
                }
                if(options.muteVolume === true){
                    await this.muteVolume();
                }
                resolve(log.info("Endpoint Muted"))
            }catch(e){
                mcE.error(e)
                resolve(e)
            }
        })
    }
}
