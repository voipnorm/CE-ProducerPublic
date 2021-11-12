import log from 'electron-log';


async function momentumErrorAlerts(data){
    let alert = `
<div class="md-alert md-alert--error">
  <div class="md-alert__icon"></div>
  <div class="md-alert__content">
    <div class="md-alert__title">${data.title}</div>
    <div class="md-alert__message">
      ${data.text}
    </div>
  </div>
`

    return alert;
}

async function momentumSuccessAlerts(data){
    let alert = `
    <div class="md-alert md-alert--success">
  <div class="md-alert__icon"></div>
  <div class="md-alert__content">
    <div class="md-alert__title">${data.title}</div>
    <div class="md-alert__message">
      ${data.text}
    </div>
  </div>
`
    return alert
}

async function momentumCallAlert(callerName, callerID){
    let alert = `
    <div class="md-alert md-alert--call">
  <div class="md-alert__title">Incoming Call</div>
  <div class="md-alert__caller">
    <div class="md-avatar md-avatar--xlarge">
      <span class="md-avatar__icon">
        <i class="icon icon-spark-board_32"></i>
      </span>
    </div>
    <div class="md-alert__caller-title">${callerName}</div>
    <div class="md-alert__caller-subtitle">${callerID}</div>
  </div>
  <div class="md-alert--call--buttons">
    <button
      class="md-button md-button--circle md-button--44 md-button--green"
      alt="answer call with voice and video"
      type="button"
      aria-label="answer call with voice and video"
      tabindex="0"
      id="answer">
      <span class="md-button__children">
        <i class="icon icon-camera_24"></i>
      </span>
    </button>
    <button
      class="md-button md-button--circle md-button--44 md-button--red"
      alt="reject call"
      type="button"
      aria-label="reject call"
      tabindex="0"
      id="reject">
      <span class="md-button__children">
        <i class="icon icon-cancel_24"></i>
      </span>
    </button>
  </div>
</div>

    `
    return alert;
}


export {
    momentumErrorAlerts,
    momentumSuccessAlerts,
    momentumCallAlert
}
