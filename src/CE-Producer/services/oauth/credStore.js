// services/credStore.js
import log from 'electron-log';

const keytar = require("keytar");
const os = require("os");

const keytarIntegrationService = "CE-ProducerIntegration";
const keytarGuestService = "CE-ProducerGuest";
const keytarService = "CE-Producer";
const keytarAccount = os.userInfo().username;

let accessToken = null;
let profile = null;
let refreshToken = null;

async function getAccessToken() {
    try{
        let token = await keytar.getPassword(keytarService, keytarAccount);
        let t = JSON.parse(token);
        let accessToken = t.access;
        return accessToken;
    }catch(e){
        log.error(e)
    }
}

async function getRefreshToken() {
    try{
        let token = await keytar.getPassword(keytarService, keytarAccount);
        let t = JSON.parse(token);
        let accessToken = t.refresh;
        return accessToken;
    }catch(e){
        log.error(e)
    }
}

async function setAccessToken(token){
    try{
        await keytar.deletePassword(keytarService, keytarAccount);
        return await keytar.setPassword(keytarService, keytarAccount, JSON.stringify(token));
    }catch(e){
        log.error(e)
    }
}

async function logout() {
    try{
        await keytar.deletePassword(keytarService, keytarAccount);
        accessToken = null;
        profile = null;
        refreshToken = null;
    }catch(e){
        log.error(e)
    }
}

async function getGuestToken() {
    try{
        let token = await keytar.getPassword(keytarGuestService, keytarAccount);
        return token;
    }catch(e){
        log.error(e)
    }
}

async function setGuestToken(token){
    try{
        await keytar.deletePassword(keytarGuestService, keytarAccount);
        return await keytar.setPassword(keytarGuestService, keytarAccount, token);
    }catch(e){
        log.error(e)
    }
}

async function getIntegrationToken() {
    try{
        let token = await keytar.getPassword(keytarIntegrationService, keytarAccount);
        return token;
    }catch(e){
        log.error(e)
    }
}

async function setIntegrationToken(token){
    try{
        await keytar.deletePassword(keytarIntegrationService, keytarAccount);
        return await keytar.setPassword(keytarIntegrationService, keytarAccount, token);
    }catch(e){
        log.error(e)
    }
}

export  {
    getAccessToken,
    getRefreshToken,
    setAccessToken,
    logout,
    getGuestToken,
    setGuestToken,
    getIntegrationToken,
    setIntegrationToken
};