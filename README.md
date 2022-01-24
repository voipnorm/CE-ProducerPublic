# CE-Producer

CE-Producer(CEP) is a endpoint control app. CEP is for producing advanced video meetings
where a producer is in control of video devices that require advanced muting and control.

## Installation

To install CEP go to the latest release within this Github repo and download the Mac or Windows 
installation files(Mac(dmg), Windows(exe)).

## Technology
* Electron
* Chrome
* Nodejs

## Features

* Control audio/video mute and audio volume for video endpoints.
* Go Live to take a individual endpoint off of mute state.
* Mute all endpoints at the sametime using individual mute settings.
* Add additional tags to filter devices.
* Remove unwanted devices.
* Join all endpoint to a conference call with single click.

## Requirements

1. Webex Control Hub administration account.
2. Endpoints are tagged appropriately in Webex Control Hub.
3. Endpoints have local admin accounts configured.
4. Local network access to all endpoints that are to be controlled by CEP.
5. Webex Control Hub Integration Client ID and Secret(required for custom builds only).



## How To Use Demo

Video coming soon......

## Pre-Built CE-Producer Package Installation

Download and install the latest release from the [release section](https://github.com/voipnorm/CE-ProducerPublic/releases).
## Pre Built Package Usage

1. Log into CEP using your configure device tags to filter your devices.
2. Configure mute options for your video endpoints.
3. Join video devices to an in-progress meeting.
   Meeting must be in progress otherwise devices may be stuck at "Are you the Host".
4. Select devices to "Go Live" as desired.

## Using This Code

CE-Producer is built upon an [Electron Boilerplate](https://github.com/szwacz/electron-boilerplate). To install your own Webex Intgration ID and Secret
make sure to update both the env_production and env_development JSON files using the suggested format under the config folder. See example below:
```json
{
  "name": "development",
  "authorize_url": "https://webexapis.com/v1/authorize",
  "access_token_url": "https://webexapis.com/v1/access_token",
  "response_type": "code",
  "client_secret": "<yourSecret>",
  "client_id": "<yourClientID>",
  "redirect_uri": "http://localhost/",
  "state": "Production",
  "scope": "spark:xapi_statuses spark:xapi_commands spark-admin:devices_read spark-admin:devices_write spark-admin:licenses_read spark-admin:places_read spark-admin:places_write spark-admin:workspaces_read spark-admin:workspace_metrics_read"
}
```
For more information on config file usage refer to [Electron Boilerplate](https://github.com/szwacz/electron-boilerplate).

Install and starting CE-Producer code.
```
git clone https://github.com/voipnorm/CE-ProducerPublic.git
cd CE-ProducerPublic
npm install
npm start
```
## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[CISCO SAMPLE CODE LICENSE](https://github.com/voipnorm/CE-Producer/blob/master/LICENSE)