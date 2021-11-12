import CustomData from '../customUserData/customUserData';
import log from"electron-log";
import env from "env";
import {getRefreshToken,setAccessToken} from "../oauth/credStore";
import OauthProvider from "../oauth/oauth2provider";

let {authorize_url, access_token_url, response_type, client_secret, client_id, redirect_uri, stateScope, scope} = env;

const {dialog} = require('electron');


const ScheduleTime = '6:00';// Set this to the time you want to have the device do something
let userData = new CustomData();
let state;
const expire = 1009599;
//shorted to 11 days to ensure valid token so refresh will work 1209599
export default async () => {
  try {

    state = await userData.getCustomData();
    if (state.tokenTimeStamp != '') {
      log.info(state.tokenTimeStamp);
      let tv = tokenValidity(ScheduleTime);
    }
  } catch (e) {
    log.error(e);
  }

}

function schedule(time) {
  let [alarmH, alarmM] = time.split(':');
  let now = new Date();
  now = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  let difference = parseInt(alarmH) * 3600 + parseInt(alarmM) * 60 - now;
  if (difference <= 0) difference += 24 * 3600;

  return setTimeout(tokenValidity, difference * 1000);
}

async function tokenValidity() {
  try {
    let now = new Date();
    let old = new Date(state.tokenTimeStamp);

    let days = (now - old) / 1000

    let countdown = days + now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    if (countdown > expire) {
      log.info("Token has expired");
      //token has expired here is where we request a new token through the refresh token

      let newToken = await tokenRefresh();

      if(newToken === false) return;

      log.info("Token has been refreshed");

      dialog.showErrorBox("Token Refreshed", "Your token expired. While you were sleeping I refreshed it for you :) .");

      //return dialog.showErrorBox("Token Expired", "Your token has expired. Tokens are valid for 14 days. Get a new token using Get My Token.");
    }
    log.info("Valid token")
    return schedule(ScheduleTime); // schedule it for the next day
  }catch(e){
    log.error(e)
  }
}


async function tokenRefresh() {
  return new Promise(async (resolve, reject)=>{
    try{
      let token = await getRefreshToken();

      let t = JSON.parse(token);

      if (!t.refresh) {
        dialog.showErrorBox("Token Refresh failed", "Your token expired. Please use my token to refresh your token.");
        resolve(false)
      }else{
        log.info(t);
        let rt = t.refresh;

        let options = {
          auth_url: authorize_url,
          token_url: access_token_url,
          response_type: response_type,
          client_secret: client_secret,
          client_id: client_id,
          redirect_uri: redirect_uri,
          state: stateScope,
          scope: [scope],
          scope_deliminator: ' ',
        }

        const provider = new OauthProvider(options);
        let tr = await provider.refreshToken(rt);

        await setAccessToken(tr);

        log.info("Token refresh completed");

        resolve()
      }
    }catch(e){
      log.error(e);
      dialog.showErrorBox("Token Refresh failed", "Your token expired. Please use my token to refresh your token.");
      resolve(false);
    }
  })


}



