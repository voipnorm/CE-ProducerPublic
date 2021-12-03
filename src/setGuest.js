import log from 'electron-log';

import "./helpers/external_links.js";
import {setGuestToken, setIntegrationToken} from './CE-Producer/services/oauth/credStore';
import customUserData from './CE-Producer/services/customUserData/remoteCustomUserData';
const {dialog} = require('@electron/remote');
const { ipcRenderer } = require('electron');

document.getElementById("saveIntegration").addEventListener("click", async (event) => {
    try{
        log.info("Saving new integration information");
        event.preventDefault();

        let intID = document.getElementById("integrationID").value;
        let intSecret = document.getElementById("integrationSecret").value;

        if(!intID || !intSecret){
            let error = "Integration ID can not be blank";
            return dialog.showErrorBox("Error",error);
        }


        //save the ID and secret
        let cud = new customUserData();
        let state = await cud.getCustomData();
        state.customIntegrationID = document.getElementById("integrationID").value;
        let update = await cud.saveCustomdata(state);
        log.info(update);
        let integrationKeyUpdate = await setIntegrationToken(document.getElementById("integrationSecret").value);

        let options = {
            title: 'Integration Save',
            message: 'Integration ID and Secret successfully saved',

        };
        const r = await dialog.showMessageBox(null, options);

        var delayInMilliseconds = 3000; //1 second

        setTimeout(function() {
            ipcRenderer.send("loginScreen");
        }, delayInMilliseconds);
    }catch(e){
        log.error(e);
        await errorAlert(e)
    }

});

async function errorAlert(e){
    let alertTxt = {
        title: "Error",
        text: e
    };
    let html = await momentumErrorAlerts(alertTxt);
    log.info(html)
    document.getElementById("alert").innerHTML = html;
}