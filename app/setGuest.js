/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/CE-Producer/services/customUserData/remoteCustomUserData.js":
/*!*************************************************************************!*\
  !*** ./src/CE-Producer/services/customUserData/remoteCustomUserData.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ CustomData)
/* harmony export */ });
/* harmony import */ var env__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! env */ "./config/env_development.json");
/* harmony import */ var fs_jetpack__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! fs-jetpack */ "fs-jetpack");
/* harmony import */ var fs_jetpack__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(fs_jetpack__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var electron_log__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! electron-log */ "electron-log");
/* harmony import */ var electron_log__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(electron_log__WEBPACK_IMPORTED_MODULE_2__);




const app = (__webpack_require__(/*! @electron/remote */ "@electron/remote").app);

class CustomData {
  constructor() {
    this.state = {};
  }

  async saveCustomdata(state) {
    //log.info("Writing custom user date to store");
    let json = JSON.stringify(state, null, 2);
    const userDataDir = fs_jetpack__WEBPACK_IMPORTED_MODULE_1___default().cwd(app.getPath("userData"));
    const stateStoreFile = `custom_env_${env__WEBPACK_IMPORTED_MODULE_0__.name}.json`;
    return userDataDir.write(stateStoreFile, json, {
      atomic: true
    });
  }

  async getCustomData() {
    return new Promise(async (resolve, reject) => {
      try {
        //log.info("Reading custom user data from store");
        const userDataDir = fs_jetpack__WEBPACK_IMPORTED_MODULE_1___default().cwd(app.getPath("userData"));
        const stateStoreFile = `custom_env_${env__WEBPACK_IMPORTED_MODULE_0__.name}.json`;
        this.state = userDataDir.read(stateStoreFile, "json"); //log.info(this.state);

        resolve(this.state);
      } catch (e) {
        reject(e);
      }
    });
  }

  async saveDeploymentdata(state) {
    electron_log__WEBPACK_IMPORTED_MODULE_2___default().info("Writing deployment user date to store");
    let json = JSON.stringify(state, null, 2);
    const userDataDir = fs_jetpack__WEBPACK_IMPORTED_MODULE_1___default().cwd(app.getPath("userData"));
    const stateStoreFile = `deployment_env_${env__WEBPACK_IMPORTED_MODULE_0__.name}.json`;
    return userDataDir.write(stateStoreFile, json, {
      atomic: true
    });
  }

  async getDeploymentData() {
    return new Promise(async (resolve, reject) => {
      try {
        electron_log__WEBPACK_IMPORTED_MODULE_2___default().info("Reading deployment user data from store");
        const userDataDir = fs_jetpack__WEBPACK_IMPORTED_MODULE_1___default().cwd(app.getPath("userData"));
        const stateStoreFile = `deployment_env_${env__WEBPACK_IMPORTED_MODULE_0__.name}.json`;
        this.state = userDataDir.read(stateStoreFile, "json");
        electron_log__WEBPACK_IMPORTED_MODULE_2___default().info(this.state);
        resolve(this.state);
      } catch (e) {
        reject(e);
      }
    });
  }

}

/***/ }),

/***/ "./src/CE-Producer/services/oauth/credStore.js":
/*!*****************************************************!*\
  !*** ./src/CE-Producer/services/oauth/credStore.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getAccessToken": () => (/* binding */ getAccessToken),
/* harmony export */   "getRefreshToken": () => (/* binding */ getRefreshToken),
/* harmony export */   "setAccessToken": () => (/* binding */ setAccessToken),
/* harmony export */   "logout": () => (/* binding */ logout),
/* harmony export */   "getGuestToken": () => (/* binding */ getGuestToken),
/* harmony export */   "setGuestToken": () => (/* binding */ setGuestToken),
/* harmony export */   "getIntegrationToken": () => (/* binding */ getIntegrationToken),
/* harmony export */   "setIntegrationToken": () => (/* binding */ setIntegrationToken)
/* harmony export */ });
/* harmony import */ var electron_log__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron-log */ "electron-log");
/* harmony import */ var electron_log__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron_log__WEBPACK_IMPORTED_MODULE_0__);
// services/credStore.js


const keytar = __webpack_require__(/*! keytar */ "keytar");

const os = __webpack_require__(/*! os */ "os");

const keytarIntegrationService = "CE-ProducerIntegration";
const keytarGuestService = "CE-ProducerGuest";
const keytarService = "CE-Producer";
const keytarAccount = os.userInfo().username;
let accessToken = null;
let profile = null;
let refreshToken = null;

async function getAccessToken() {
  try {
    let token = await keytar.getPassword(keytarService, keytarAccount);
    let t = JSON.parse(token);
    let accessToken = t.access;
    return accessToken;
  } catch (e) {
    electron_log__WEBPACK_IMPORTED_MODULE_0___default().error(e);
  }
}

async function getRefreshToken() {
  try {
    let token = await keytar.getPassword(keytarService, keytarAccount);
    let t = JSON.parse(token);
    let accessToken = t.refresh;
    return accessToken;
  } catch (e) {
    electron_log__WEBPACK_IMPORTED_MODULE_0___default().error(e);
  }
}

async function setAccessToken(token) {
  try {
    await keytar.deletePassword(keytarService, keytarAccount);
    return await keytar.setPassword(keytarService, keytarAccount, JSON.stringify(token));
  } catch (e) {
    electron_log__WEBPACK_IMPORTED_MODULE_0___default().error(e);
  }
}

async function logout() {
  try {
    await keytar.deletePassword(keytarService, keytarAccount);
    accessToken = null;
    profile = null;
    refreshToken = null;
  } catch (e) {
    electron_log__WEBPACK_IMPORTED_MODULE_0___default().error(e);
  }
}

async function getGuestToken() {
  try {
    let token = await keytar.getPassword(keytarGuestService, keytarAccount);
    return token;
  } catch (e) {
    electron_log__WEBPACK_IMPORTED_MODULE_0___default().error(e);
  }
}

async function setGuestToken(token) {
  try {
    await keytar.deletePassword(keytarGuestService, keytarAccount);
    return await keytar.setPassword(keytarGuestService, keytarAccount, token);
  } catch (e) {
    electron_log__WEBPACK_IMPORTED_MODULE_0___default().error(e);
  }
}

async function getIntegrationToken() {
  try {
    let token = await keytar.getPassword(keytarIntegrationService, keytarAccount);
    return token;
  } catch (e) {
    electron_log__WEBPACK_IMPORTED_MODULE_0___default().error(e);
  }
}

async function setIntegrationToken(token) {
  try {
    await keytar.deletePassword(keytarIntegrationService, keytarAccount);
    return await keytar.setPassword(keytarIntegrationService, keytarAccount, token);
  } catch (e) {
    electron_log__WEBPACK_IMPORTED_MODULE_0___default().error(e);
  }
}



/***/ }),

/***/ "./src/helpers/external_links.js":
/*!***************************************!*\
  !*** ./src/helpers/external_links.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

// Convenient way for opening links in external browser, not in the app.
// Useful especially if you have a lot of links to deal with.
//
// Usage:
//
// Every link with class ".js-external-link" will be opened in external browser.
// <a class="js-external-link" href="http://google.com">google</a>
//
// The same behaviour for many links can be achieved by adding
// this class to any parent tag of an anchor tag.
// <p class="js-external-link">
//    <a href="http://google.com">google</a>
//    <a href="http://bing.com">bing</a>
// </p>
const {
  shell
} = __webpack_require__(/*! electron */ "electron");

const supportExternalLinks = event => {
  let href;
  let isExternal = false;

  const checkDomElement = element => {
    if (element.nodeName === "A") {
      href = element.getAttribute("href");
    }

    if (element.classList.contains("js-external-link")) {
      isExternal = true;
    }

    if (href && isExternal) {
      shell.openExternal(href);
      event.preventDefault();
    } else if (element.parentElement) {
      checkDomElement(element.parentElement);
    }
  };

  checkDomElement(event.target);
};

document.addEventListener("click", supportExternalLinks, false);

/***/ }),

/***/ "@electron/remote":
/*!***********************************!*\
  !*** external "@electron/remote" ***!
  \***********************************/
/***/ ((module) => {

"use strict";
module.exports = require("@electron/remote");

/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("electron");

/***/ }),

/***/ "electron-log":
/*!*******************************!*\
  !*** external "electron-log" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("electron-log");

/***/ }),

/***/ "fs-jetpack":
/*!*****************************!*\
  !*** external "fs-jetpack" ***!
  \*****************************/
/***/ ((module) => {

"use strict";
module.exports = require("fs-jetpack");

/***/ }),

/***/ "keytar":
/*!*************************!*\
  !*** external "keytar" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("keytar");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ "./config/env_development.json":
/*!*************************************!*\
  !*** ./config/env_development.json ***!
  \*************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"name":"development","authorize_url":"https://webexapis.com/v1/authorize","access_token_url":"https://webexapis.com/v1/access_token","response_type":"code","client_secret":"db5823d5ee046a02eb1546d8275988be1ae2214fc30800d0ad372bcfb972f4e3","client_id":"C5428b83db0579a3985b1095ae297d2784f626a749db1bb3feaad02bfd863c8b8","redirect_uri":"http://localhost/","state":"Production","scope":"spark:xapi_statuses spark:xapi_commands spark-admin:devices_read spark-admin:devices_write spark-admin:licenses_read spark-admin:places_read spark-admin:places_write spark-admin:workspaces_read spark-admin:workspace_metrics_read"}');

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
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!*************************!*\
  !*** ./src/setGuest.js ***!
  \*************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var electron_log__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron-log */ "electron-log");
/* harmony import */ var electron_log__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron_log__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _helpers_external_links_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./helpers/external_links.js */ "./src/helpers/external_links.js");
/* harmony import */ var _helpers_external_links_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_helpers_external_links_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _CE_Producer_services_oauth_credStore__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./CE-Producer/services/oauth/credStore */ "./src/CE-Producer/services/oauth/credStore.js");
/* harmony import */ var _CE_Producer_services_customUserData_remoteCustomUserData__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./CE-Producer/services/customUserData/remoteCustomUserData */ "./src/CE-Producer/services/customUserData/remoteCustomUserData.js");





const {
  dialog
} = __webpack_require__(/*! @electron/remote */ "@electron/remote");

const {
  ipcRenderer
} = __webpack_require__(/*! electron */ "electron");

document.getElementById("saveIntegration").addEventListener("click", async event => {
  try {
    electron_log__WEBPACK_IMPORTED_MODULE_0___default().info("Saving new integration information");
    event.preventDefault();
    let intID = document.getElementById("integrationID").value;
    let intSecret = document.getElementById("integrationSecret").value;

    if (!intID || !intSecret) {
      let error = "Integration ID can not be blank";
      return dialog.showErrorBox("Error", error);
    } //save the ID and secret


    let cud = new _CE_Producer_services_customUserData_remoteCustomUserData__WEBPACK_IMPORTED_MODULE_3__["default"]();
    let state = await cud.getCustomData();
    state.customIntegrationID = document.getElementById("integrationID").value;
    let update = await cud.saveCustomdata(state);
    electron_log__WEBPACK_IMPORTED_MODULE_0___default().info(update);
    let integrationKeyUpdate = await (0,_CE_Producer_services_oauth_credStore__WEBPACK_IMPORTED_MODULE_2__.setIntegrationToken)(document.getElementById("integrationSecret").value);
    let options = {
      title: 'Integration Save',
      message: 'Integration ID and Secret successfully saved'
    };
    const r = await dialog.showMessageBox(null, options);
    var delayInMilliseconds = 3000; //1 second

    setTimeout(function () {
      ipcRenderer.send("loginScreen");
    }, delayInMilliseconds);
  } catch (e) {
    electron_log__WEBPACK_IMPORTED_MODULE_0___default().error(e);
    await errorAlert(e);
  }
});

async function errorAlert(e) {
  let alertTxt = {
    title: "Error",
    text: e
  };
  let html = await momentumErrorAlerts(alertTxt);
  electron_log__WEBPACK_IMPORTED_MODULE_0___default().info(html);
  document.getElementById("alert").innerHTML = html;
}
})();

/******/ })()
;
//# sourceMappingURL=setGuest.js.map