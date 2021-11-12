
import log from "electron-log";
const {dialog} = require('electron').remote;

const dashELog = log.scope("DashError");

export default async (divId, error) => {
  try{
    dashELog.info("Dashboard Error: "+error);
    return dialog.showErrorBox("Error",error);
  }catch(e){
    dashELog.error("Dashboard Error Failed to load ("+e+")")
  }
}
