
import modal from './updateModal';

const {ipcRenderer} = require('electron');



//$("#myModal").modal()

export default () => {
    const notification = document.getElementById('notification');

    ipcRenderer.on('update_available', () => {
        ipcRenderer.removeAllListeners('update_available');
        modal('A new update is available. Downloading now...');
        $("#notificationModal").modal();
    });
    ipcRenderer.on('download-progress', (event, message) => {
        //sends progress message to modal
        modal(message);
    });

    ipcRenderer.on('update_downloaded', () => {
        ipcRenderer.removeAllListeners('update_downloaded');
        modal('Update Downloaded. It will be installed on restart. Restart now?');
        document.getElementById("restart-button").classList.remove('d-none');
        document.getElementById("restart-button").addEventListener("click", async (event) => {
            ipcRenderer.send('restart_app');
        })
    });

    ipcRenderer.on('checking-for-update', () => {
        modal('Checking for updates.......');
        $("#notificationModal").modal();
    });
    ipcRenderer.on('update-not-available', () => {
        modal('No new updates available for CE-Remote');
        $("#notificationModal").modal();
    });
    ipcRenderer.on('update-error', (e) => {
        modal(e);
        $("#notificationModal").modal();
    });

}