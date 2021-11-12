import log from 'electron-log';
import env from 'env';
import jetpack from 'fs-jetpack';
import {app} from 'electron';

const ccustlog = log.scope("CheckCustomAttributes");

export default async () => {
  try{

    //user custom settings
    const userDataDir = jetpack.cwd(app.getPath("userData"));
    //ccustlog.info(userDataDir);
    const stateStoreFile = `custom_env_${env.name}.json`;
    let customState = {};
    let readState =  userDataDir.read(stateStoreFile, "json");
    if(typeof readState === 'undefined'){
      customState.custom_secret_id = '';
      customState.custom_client_id = '';
      customState.custom_domain = '';
      customState.custom_port = '';
      customState.wbxNotifications = false;
      customState.wbxBotToken = '';
      customState.wbxRoomId = '';
      customState.slackNotifications = false;
      customState.slackBotToken = '';
      customState.slackBotName = '';
      customState.slackChannel = '';
      customState.microsoftNotifications = false;
      customState.emailRecipient = '';
      customState.tokenTimeStamp = '';
      customState.webProxy = {};
      customState.autoProxy = true;
      customState.custom_secure_port = '';
      customState.customWebProxy = false;
      customState.customWebProxyServer = '';
      customState.customWebProxyPort = '';
      customState.guestID = '';
      customState.customIntegrationID = '';
      var json = JSON.stringify(customState, null, 2);
      ccustlog.info("Creating custom settings file on first run");
      return userDataDir.write(stateStoreFile, json, {atomic: true});
    }else{
      return
    }
  }catch(e){
    ccustlog.error(e);
  }




}
