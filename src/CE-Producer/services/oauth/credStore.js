// services/credStore.js
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
    let token = await keytar.getPassword(keytarService, keytarAccount);
    let t = JSON.parse(token);
    let accessToken = t.access;
    return accessToken;
}

async function getRefreshToken() {
    let token = await keytar.getPassword(keytarService, keytarAccount);
    let t = JSON.parse(token);
    let accessToken = t.refresh;
    return accessToken;
}

async function setAccessToken(token){
    await keytar.deletePassword(keytarService, keytarAccount);
    return await keytar.setPassword(keytarService, keytarAccount, JSON.stringify(token));
}

async function logout() {
    await keytar.deletePassword(keytarService, keytarAccount);
    accessToken = null;
    profile = null;
    refreshToken = null;
}

async function getGuestToken() {
    let token = await keytar.getPassword(keytarGuestService, keytarAccount);
    return token;
}

async function setGuestToken(token){
    await keytar.deletePassword(keytarGuestService, keytarAccount);
    return await keytar.setPassword(keytarGuestService, keytarAccount, token);
}

async function getIntegrationToken() {
    let token = await keytar.getPassword(keytarIntegrationService, keytarAccount);
    return token;
}

async function setIntegrationToken(token){
    await keytar.deletePassword(keytarIntegrationService, keytarAccount);
    return await keytar.setPassword(keytarIntegrationService, keytarAccount, token);
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