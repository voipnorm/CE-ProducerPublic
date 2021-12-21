import log from "electron-log"

export default async (message) => {

  let updatemodal = `<div class="modal-dialog" style="display:table;text-align:center">

                  <!-- Modal content-->
                  <div class="modal-content">
                    <div class="modal-header">
                      <img src="./images/logoPaw.png" width="50" height="55" alt="">
                      <h4 class="modal-title">CE-Deploy Update</h4>
                      <button type="button" class="close" data-dismiss="modal">&times;</button>
                      
                  </div>
                    <div class="modal-body">
                      <p id="updateMessage">${message}</p>
                      <button type="button" class="btn btn-primary" id="close-button" data-dismiss="modal" >
                        Close
                      </button>
                      <button type="button" class="btn btn-primary d-none" id="restart-button">
                        Restart
                      </button>
                     </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    </div>
                  </div>

                </div>`

  return document.getElementById('notificationModal').innerHTML = updatemodal;

}







