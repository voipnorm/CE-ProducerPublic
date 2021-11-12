import log from 'electron-log';
import interfaces from "./interfaces";
const {dialog} = require('electron').remote;

async function ipAddressDropdown (){
  return new Promise(async (resolve, reject)=>{
    try{
      log.info("loading interface selection");
      let o ="<option value='Auto' selected>Auto</option>";
      let ips = await interfaces();
      log.info(ips);
      if(ips.length === 0){
        dialog.showErrorBox("Interface Error","Unable to locate valid IPv4 addresses, please try changing networks " +
          "before proceeding. Certain functions will be unavailable until resolved");
        resolve();
      }
      ips.forEach(function(ip, index){
        //<option selected>Choose...</option>
        o += `<option value=${ip} >${ip}</option>`
      });
      log.info(o);
      log.info("loading deployment button");
      let deploy = `<div class="input-group input-group-sm sm-3">
                    <div class="input-group-prepend">
                      <label class="input-group-text" for="inputGroupSelect01">Interface</label>
                    </div>
                    <select class="custom-select" id="myip">
                      ${o}
                  </select>
                </div>`;
      log.info(deploy)
      document.getElementById("ipSelection").innerHTML = deploy
      resolve()
    }catch(e){
      log.error(e);
      reject(e)
    }
  })

}

export {ipAddressDropdown}
