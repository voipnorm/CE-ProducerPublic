import log from 'electron-log';

import CustomData from '../customUserData/remoteCustomUserData';


export  default async (data) => {
  //setInterval(function(){ alert("Hello"); }, 3000);
  // retrieve the browser session
  let session;

  if (!data) {
    session = require('electron').remote.getCurrentWindow().webContents.session;
  } else {
    session = data;
  }

  autoProxy();

  async function autoProxy(){

    //log.info("Auto Proxy check running")


    //retrive custom settings
    let userData = new CustomData();
    let settings = await userData.getCustomData();
    log.info(settings.webProxy);
    //log.info("Checking for proxy");
    // resolve the proxy for a known URL. This could be the URL you expect to use or a known good url like google.com
    let proxyUrl = await session.resolveProxy('https://www.google.com');
    log.info(proxyUrl)
    // DIRECT means no proxy is configured
    if (settings.autoProxy == true) {
      // retrieve the parts of the proxy from the string returned
      // the url would look something like: 'PROXY http-proxy.mydomain.com:8080'
      if(proxyUrl === 'DIRECT'){
        settings.webProxy = {host: "DIRECT"};
        let update = await userData.saveCustomdata(settings);
        //log.info("Auto Proxy check stopped");
        return setTimeout(autoProxy, 30000);
      }
      if(proxyUrl !== 'DIRECT' ){
        const proxyUrlComponents = proxyUrl.split(':');

        const proxyHost = proxyUrlComponents[0].split(' ')[1];
        const proxyPort = parseInt(proxyUrlComponents[1], 10);
        log.info("Proxy host:" + proxyHost);
        log.info("Proxy port: " + proxyPort);
        // do something with proxy details

        settings.webProxy = {host: proxyHost, port: proxyPort};

        let update = await userData.saveCustomdata(settings);
        //log.info("Auto Proxy check stopped");
        return setTimeout(autoProxy, 30000);
      }
    }
    //if custom is true no way auto is also true it is hard set false
    if(settings.customWebProxy == true){
      log.info("Custom Web Proxy Enabled");
      settings.webProxy = {host: settings.customWebProxyServer, port: settings.customWebProxyPort};
      let update = await userData.saveCustomdata(settings);
      return setTimeout(autoProxy, 30000);
    }
    // both false set as direct no point keeping it anything else
   if(settings.customWebProxy == false && settings.autoProxy == false){
      log.info("No proxy configured or auto and custom is turned off");
      settings.webProxy = {host: "DIRECT"};
      let update = await userData.saveCustomdata(settings);
      //log.info("Auto Proxy check stopped");
      return setTimeout(autoProxy, 30000);

    }
  }



}

//create static proxy check
