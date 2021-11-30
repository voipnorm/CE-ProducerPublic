/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

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

/***/ }),

/***/ "fs-jetpack":
/*!*****************************!*\
  !*** external "fs-jetpack" ***!
  \*****************************/
/***/ ((module) => {

module.exports = require("fs-jetpack");

/***/ }),

/***/ "./config/env_development.json":
/*!*************************************!*\
  !*** ./config/env_development.json ***!
  \*************************************/
/***/ ((module) => {

module.exports = JSON.parse('{"name":"development","authorize_url":"https://webexapis.com/v1/authorize","access_token_url":"https://webexapis.com/v1/access_token","response_type":"code","client_secret":"ab8aa135e6a050fd81a3bec592441eb15717c4c8ec8663546398d4dccbafa4f1","client_id":"Cfec612082a3fee7f005bb59cc38a54e98c38e1af8011b0f19e1bd9fcb15c379b","redirect_uri":"http://localhost/","state":"Production","scope":"spark:xapi_statuses spark:xapi_commands spark-admin:devices_read spark-admin:devices_write spark-admin:licenses_read spark-admin:places_read spark-admin:places_write spark-admin:workspaces_read spark-admin:workspace_metrics_read"}');

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
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron */ "electron");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var fs_jetpack__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! fs-jetpack */ "fs-jetpack");
/* harmony import */ var fs_jetpack__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(fs_jetpack__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var electron_log__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! electron-log */ "electron-log");
/* harmony import */ var electron_log__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(electron_log__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var env__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! env */ "./config/env_development.json");




document.querySelector("#login").addEventListener("click", async event => {
  electron_log__WEBPACK_IMPORTED_MODULE_2___default().info("Token request started......");
  event.preventDefault();
  electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.send("oauth");
});
electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on('oauth-reply', (event, oauthToken) => {
  electron_log__WEBPACK_IMPORTED_MODULE_2___default().info("oauth-reply received .... ");

  if (oauthToken.status === 'danger') {
    return electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.send("unauthorized");
  }

  electron_log__WEBPACK_IMPORTED_MODULE_2___default().info("Access token updated: " + oauthToken.tkn);
  let tags = document.getElementById("tags").value;
  let username = document.getElementById("adminUsername").value;
  let password = document.getElementById('adminPassword').value;
  return electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.send("authorized", {
    tags: tags,
    username: username,
    password: password
  });
});
document.querySelector("#resetSettings").addEventListener("click", async event => {
  electron_log__WEBPACK_IMPORTED_MODULE_2___default().info("Token request started......");
  event.preventDefault();
  electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.send("resetSettings");
});
})();

/******/ })()
;
//# sourceMappingURL=login.js.map