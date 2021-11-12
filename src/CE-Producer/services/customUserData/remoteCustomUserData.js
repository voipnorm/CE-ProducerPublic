import env from 'env';
import jetpack from "fs-jetpack";
import log from"electron-log";

const {app} = require('electron').remote;

export default class CustomData {

  constructor() {
    this.state = {};
  }

  async saveCustomdata(state){
    //log.info("Writing custom user date to store");
    let json = JSON.stringify(state, null, 2);
    const userDataDir = jetpack.cwd(app.getPath("userData"));
    const stateStoreFile = `custom_env_${env.name}.json`;
    return userDataDir.write(stateStoreFile, json, {atomic: true});
  }

  async getCustomData(){
    return new Promise(async (resolve, reject)=> {
      try {
        //log.info("Reading custom user data from store");
        const userDataDir = jetpack.cwd(app.getPath("userData"));
        const stateStoreFile = `custom_env_${env.name}.json`;
        this.state = userDataDir.read(stateStoreFile, "json");
        //log.info(this.state);
        resolve(this.state);
      } catch (e) {
        reject(e)
      }

    })
  }
  async saveDeploymentdata(state){
    log.info("Writing deployment user date to store");
    let json = JSON.stringify(state, null, 2);
    const userDataDir = jetpack.cwd(app.getPath("userData"));
    const stateStoreFile = `deployment_env_${env.name}.json`;
    return userDataDir.write(stateStoreFile, json, {atomic: true});
  }

  async getDeploymentData(){
    return new Promise(async (resolve, reject)=> {
      try {
        log.info("Reading deployment user data from store");
        const userDataDir = jetpack.cwd(app.getPath("userData"));
        const stateStoreFile = `deployment_env_${env.name}.json`;
        this.state = userDataDir.read(stateStoreFile, "json");
        log.info(this.state);
        resolve(this.state);
      } catch (e) {
        reject(e)
      }
    })
  }
}
