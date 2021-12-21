import log from "electron-log"

export default async () => {
  return new Promise(resolve => {
    let welcomemodal = `<div class="modal-dialog" style="display:table;text-align:center">

                  <!-- Modal content-->
                  <div class="modal-content">
                    <div class="modal-header" style="display:table">
                      <h4 class="modal-title">Welcome to CE-Producer</h4>
                  </div>
                    <div class="modal-body bg-light">
                      <!--Stuff goes here-->
                     <div style="text-align:left">
                      <p>
                      CE-Producer uses both cloud and device API's to manage your endpoints. Please Follow the steps 
                      below to ensure your success:<br><br>
                       
                       Step 1. Create Tags for devices in Webex Cloud.<br><br>
                       Step 2. Ensure you have direct network access to your endpoints.<br><br>
                       Step 3. Local admin accounts are created on your devices.<br><br>
                       Step 4. (Optional) Create a custom integration in the Webex Cloud. Select custom integration 
                       for more details. <br>
                      
                      </p>
                      
                    
                    </div>
                     </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    </div>
                  </div>`

    document.getElementById('welcomeModal').innerHTML = welcomemodal;
    resolve ($('#welcomeModal').modal());

  })


}
