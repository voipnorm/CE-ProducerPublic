
import { ipcRenderer } from "electron";
import jetpack from "fs-jetpack";
import log from "electron-log";

import env from "env";

document.querySelector("#login").addEventListener("click", async (event) => {
    log.info("Token request started......");
    event.preventDefault();
    ipcRenderer.send("oauth");

});

ipcRenderer.on('oauth-reply', (event, oauthToken) => {
    log.info("oauth-reply received .... ");

    if(oauthToken.status === 'danger'){
        return ipcRenderer.send("unauthorized");
    }
    log.info("Access token updated: " + oauthToken.tkn);
    let tags = document.getElementById("tags").value;
    return ipcRenderer.send("authorized", tags);
});


document.querySelector("#resetSettings").addEventListener("click", async (event) => {
    log.info("Token request started......");
    event.preventDefault();
    ipcRenderer.send("resetSettings");

});