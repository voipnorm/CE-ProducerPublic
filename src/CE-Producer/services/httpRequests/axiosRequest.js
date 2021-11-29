//All web requests will come here to be processed

import axios from 'axios';
import axiosRetry from 'axios-retry';
//import CustomData from '../customUserData/remoteCustomUserData';

import log from "electron-log";
import https from 'https';

const HttpsProxyAgent = require('https-proxy-agent');

//fix for webpack replacing default http connector
axiosRetry(axios, { retries: 3 });
axios.defaults.adapter = require('axios/lib/adapters/http');

export default async (options) => {
  return new Promise(async(resolve, reject) =>{
    try{
      log.info(options);

      //let userData = new CustomData();
      //let settings = await userData.getCustomData();

      let optWProxy = options;
      /*
      if(settings.webProxy.host != "DIRECT"){
        const agent = new HttpsProxyAgent({host: settings.webProxy.host, port: settings.webProxy.port, rejectUnauthorized: false});
        optWProxy.httpsAgent = agent;
      }*/
      const agent = new https.Agent({rejectUnauthorized: false});
      optWProxy.httpsAgent = agent;
      log.info(optWProxy);
      let response = await axios(optWProxy);
      //log.info(response);
      resolve(response)
    }catch(e){
      log.error("Request failed"+e);
      reject(e)
    }
  })
}
