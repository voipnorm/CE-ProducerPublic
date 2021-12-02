const { ipcRenderer } = require('electron');

function update() {
  var width = 1;
  var identity = setInterval(scene, 100);

  function scene() {
    if (width >= 100) {
      ipcRenderer.send('showMainWindow');
      clearInterval(identity);
    } else {
      width++;
    }
  }
}
update();
