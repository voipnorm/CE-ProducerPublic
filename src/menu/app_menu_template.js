import {app, shell} from "electron";
import path from "path";

const homedir = require('os').homedir();

export default {
  label: "App",
  submenu: [
    {
      label: 'Application Log',
      click: () => {
        if (process.platform === "darwin") {
          console.log(`${homedir}/Library/Logs/CE-Producer/renderer.log`);
          return shell.openPath(`${homedir}/Library/Logs/CE-Producer/renderer.log`);
        }
        if (process.platform === "win32") {
          console.log(`${homedir}/AppData/Roaming/CE-Producer/renderer.log`);
          return shell.openPath(path.join(homedir, 'AppData/Roaming/CE-Producer/logs', 'renderer.log'));
        }
        if (process.platform === 'linux') {
          return shell.openPath(`${homedir}/.config/CE-Producer/logs/renderer.log`)
        }
      },


    },
    {
      label: "Quit",
      accelerator: "CmdOrCtrl+Q",
      click: () => {
        app.quit();
      }
    }
  ]
};
