import {ipcRenderer} from 'electron';

function update() {
  var element = document.getElementById("splash-progress-bar");
  var width = 1;
  var identity = setInterval(scene, 50);

  function scene() {
    if (width >= 100) {
      ipcRenderer.send('showMainWindow');
      clearInterval(identity);
    } else {
      width++;
      element.style.width = width + '%';
    }
  }
}
update();
