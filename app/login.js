/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/CE-Producer/welcome/welcomeModal.js":
/*!*************************************************!*\
  !*** ./src/CE-Producer/welcome/welcomeModal.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var electron_log__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron-log */ "electron-log");
/* harmony import */ var electron_log__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron_log__WEBPACK_IMPORTED_MODULE_0__);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (async () => {
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
                  </div>`;
    document.getElementById('welcomeModal').innerHTML = welcomemodal;
    resolve($('#welcomeModal').modal());
  });
});

/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("electron");

/***/ }),

/***/ "electron-log":
/*!*******************************!*\
  !*** external "electron-log" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("electron-log");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/login.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var electron_log__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron-log */ "electron-log");
/* harmony import */ var electron_log__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron_log__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _CE_Producer_welcome_welcomeModal__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./CE-Producer/welcome/welcomeModal */ "./src/CE-Producer/welcome/welcomeModal.js");



const {
  ipcRenderer
} = __webpack_require__(/*! electron */ "electron");

(0,_CE_Producer_welcome_welcomeModal__WEBPACK_IMPORTED_MODULE_1__["default"])();
document.querySelector("#login").addEventListener("click", async event => {
  electron_log__WEBPACK_IMPORTED_MODULE_0___default().info("Token request started......");
  event.preventDefault();
  ipcRenderer.send("oauth");
});
ipcRenderer.on('oauth-reply', (event, oauthToken) => {
  electron_log__WEBPACK_IMPORTED_MODULE_0___default().info("oauth-reply received .... ");

  if (oauthToken.status === 'danger') {
    return ipcRenderer.send("unauthorized");
  }

  electron_log__WEBPACK_IMPORTED_MODULE_0___default().info("Access token updated: " + oauthToken.tkn);
  let tags = document.getElementById("tags").value;
  let username = document.getElementById("adminUsername").value;
  let password = document.getElementById('adminPassword').value;
  return ipcRenderer.send("authorized", {
    tags: tags,
    username: username,
    password: password
  });
});
document.querySelector("#resetSettings").addEventListener("click", async event => {
  electron_log__WEBPACK_IMPORTED_MODULE_0___default().info("Token request started......");
  event.preventDefault();
  ipcRenderer.send("resetSettings");
});
})();

/******/ })()
;
//# sourceMappingURL=login.js.map