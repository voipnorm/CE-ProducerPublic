const app = require('@electron/remote').app;

export default {
  label: "App",
  submenu: [
    {
      label: "Quit",
      accelerator: "CmdOrCtrl+Q",
      click: () => {
        app.quit();
      }
    }
  ]
};
