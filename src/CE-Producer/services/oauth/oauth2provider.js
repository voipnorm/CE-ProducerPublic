"use strict";

//Endpoint file to run xCommands for local endpoints.


import log from 'electron-log';

import EventEmitter from 'events';
import {urlParams} from './utils';
import axios from 'axios';
import qs from 'qs';
import CustomData from '../customUserData/customUserData';


const HttpsProxyAgent = require('https-proxy-agent');

const https = require('https');


export default class OauthProvider extends EventEmitter {

  constructor(config) {
    super();

    this.auth_url = config.auth_url;
    this.token_url = config.token_url;
    this.client_id = config.client_id;
    this.client_secret = config.client_secret;
    this.redirect_uri = config.redirect_uri;
    this.state = config.state;
    this.scope_deliminator = " ";
    this.scope = config.scope.join(this.scope_deliminator);
    this.proxy = {};

    this.filter = {
      urls: ['http://localhost/*', 'http://127.0.0.1/*']
    }

  }

  begin(win, session) {
    return new Promise(async (resolve, reject) => {
      try {
        // Remove menu from the BrowserWindow.
        let userData = new CustomData();
        let state = await userData.getCustomData();
        this.proxy = state.webProxy;
        log.info("Reading proxy state "+this.proxy);
        win.setMenu(null);

        let authorize_url = `${this.auth_url}?response_type=code`;
        authorize_url += `&client_id=${this.client_id}`;
        authorize_url += `&scope=${encodeURIComponent(this.scope)}`;
        authorize_url += `&redirect_uri=${encodeURIComponent(this.redirect_uri)}`;
        if (this.state) {
          authorize_url += `&state=${this.state}`;
        }
        log.info("Oauth authorize URL: " + authorize_url);
        log.info("Opening Authorization Window");
        win.loadURL(authorize_url);
        let code = await this.urlListener(win);
        resolve(code);
      } catch (e) {
        log.error("Oauth provider error: " + e);
        reject(e)
      }
    })

  }

  async getToken(grant) {
    try {
      log.info(grant);

      const requestBody = {
        "client_id": this.client_id,
        "client_secret": this.client_secret,
        "redirect_uri": this.redirect_uri,
        "grant_type": 'authorization_code',
        "code": grant.code
      };


      const request_config = {
        url: this.token_url,
        method: "POST",
        httpsAgent: new https.Agent({rejectUnauthorized: false}),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: qs.stringify(requestBody),
        //json: true
      };

      log.info("Sending request");
      const response = await this.request(request_config);
      log.info(response);
      if (response.data.hasOwnProperty('access_token')) {
        //log.info(response.data)
        this.tokenTimestamp();
        return response.data;
      }
      else {
        let err = new Error('FAILED_TO_REFRESH_TOKEN');
        err.response = data;
        return err;
      }

    } catch (e) {
      log.error(e)
      return (e);
    }
  }

  urlListener(win) {
    return new Promise((resolve, reject) => {
      try {
        const session = win.webContents.session;

        session.webRequest.onBeforeRequest(this.filter, async (details, callback) => {
          log.info(details);
          let params = await urlParams(details.url);
          const grant = {
            grant_type: "authorization_code",
            code: params.code
          };
          log.info("uriRedirect completed getting token from request token.");
          const data = await this.getToken(grant);
          log.info(data);
          if (data.hasOwnProperty('access_token')) {
            win.close();
            resolve({access: data.access_token, refresh: data.refresh_token});
            callback({
              cancel: false
            });
          } else {
            let err = new Error('FAILED_TO_GET_TOKEN');
            err.response = data;
            reject(err);
          }
        });
      } catch (e) {
        log.error(e);
        reject(e)
      }
    })

  }
  refreshToken(token) {
    return new Promise(async (resolve, reject) => {
      try {
        let userData = new CustomData();
        let state = await userData.getCustomData();
        this.proxy = state.webProxy;
        const requestBody = {
          "grant_type": 'refresh_token',
          "client_id": this.client_id,
          "client_secret": this.client_secret,
          "refresh_token": token
        };
        const request_config = {
          url: this.token_url,
          method: "POST",
          httpsAgent: new https.Agent({rejectUnauthorized: false}),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          data: qs.stringify(requestBody),
          //json: true
        };
        log.info("Sending request");
        const response = await this.request(request_config);
        //log.info(response);
        if (response.data.hasOwnProperty('access_token')) {
          //log.info(response.data)
          await this.tokenTimestamp();
          resolve({access: response.data.access_token, refresh: response.data.refresh_token})
        }
        else {
          let err = new Error('FAILED_TO_REFRESH_TOKEN');
          err.response = data;
          resolve(err);
        }

      } catch (e) {
        log.error(e);
        reject(e);
      }
    })
  }

  async tokenTimestamp() {
    return new Promise(async (resolve) => {
      log.info("Writing timestamp for token");
      let userData = new CustomData();
      let timeStamp = new Date();
      let state = await userData.getCustomData();
      state.tokenTimeStamp = timeStamp;
      resolve(userData.saveCustomdata(state));
    })
  }

  async request(options){
    return new Promise(async(resolve, reject) =>{
      try{
        let optWProxy = options;
        /*log.info(this.proxy.host);
        if(this.proxy.host != "DIRECT"){
          const agent = new HttpsProxyAgent({host: this.proxy.host, port: this.proxy.port, rejectUnauthorized: false});
          optWProxy.httpsAgent = agent
        }*/
        let response = await axios(optWProxy);
        resolve(response)
      }catch(e){
        log.error("Request failed"+e);
        reject(e)
      }
    })
  }


}

