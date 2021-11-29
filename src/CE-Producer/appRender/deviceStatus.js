import log from 'electron-log';

export class StatusDB {
    constructor (data) {
        this.callStatus = data.callStatus;
        this.audioMute = data.audioMute;
        this.videoMute = data.videoMute;
        this.conferenceURI = data.conferenceURI
    }


}