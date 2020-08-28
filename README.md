# MultiplayerPianoJS

[![Known Vulnerabilities](https://snyk.io/test/github/GagePielsticker/MultiplayerPianoJS/badge.svg?targetFile=package.json)](https://snyk.io/test/github/GagePielsticker/MultiplayerPianoJS?targetFile=package.json) [![License](https://img.shields.io/badge/license-MIT-green)](https://github.com/GagePielsticker/Express-API-Boilerplate/blob/master/LICENSE.md) ![GitHub last commit](https://img.shields.io/github/last-commit/gagepielsticker/Express-API-Boilerplate)

## Foreword

> This was created as a response to the massive lack of libs/support presented in the MPP dev community. I intend to maintain and improve it for the foreseeable future. 

## Installation
**Node.js 12.0.0 or newer is required.**

`npm install multiplayerpianojs`

# Example Usage
More seen [here](https://github.com/GagePielsticker/MultiplayerPianoJS/blob/master/examples/bot.js)
```js
const MPPClient = require('multiplayerpianojs')
const mpp = new MPPClient()
//const mpp = new MPPClient(SCOCKS/HTTPS PROXY HERE) alternatively
mpp.connect()

mpp.on('connected', () => {
  console.log('bot connected')
  mpp.setChannel('my room')
    .then(() => console.log('Channel Set!'))
})

mpp.on('message', msg => {
  if (msg.content === '!ping') {
    mpp.sendMessage('Pong!')
  }
  if (msg.content === '!disconnect') {
    mpp.disconnect()
  }
})

mpp.on('userJoin', user => {
  console.log(`user joined: ${user.name}`)
  mpp.sendMessage(`Welcome ${user.name}`)
})

mpp.on('userLeave', user => {
  console.log(`user left: ${user.name}`)
  mpp.sendMessage(`Goodbye ${user.name}`)
})
```
## Methods/Functions

- **connect()**
_Connects bot to the WS_

- **disconnect()**
_Disconnects bot to the WS_

- **setChannel(String name)**
_Sets the current channel_
Returns: `Promise`

- **sendMessage(String message)**
_Sends message in channel_
Returns: `Promise`

- **setName(String name)**
_Sets the current name_
Returns: `Promise`

- **moveMouse(Int x, Int y)**
_Moves mouse position_
Returns: `Promise`

## Events
- **connected**
_Fired on bot connection to websocket_

- **disconnected**
_Fired on bot disconnect to websocket_

- **userJoin**
_Fired on user join_
Callback: `Object`

- **userLeave**
_Fired on user leave_
Callback: `Object`

- **error**
_Fired on error_
Callback: `String`

- **Message**
_Fired on message recieve_
Callback: `Message Object`

## Properties
- **room**
_Object containing all users in room + room name_

- **proxy**
_Currently connected proxy_

## Dependencies
- https-proxy-agent
- socks-proxy-agent
- ws

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

All code must follow standardjs principles. Keep documentation thorough as well.

![GitHub stars](https://img.shields.io/github/stars/gagepielsticker/MultiplayerPianoJS?style=social)
![GitHub followers](https://img.shields.io/github/followers/gagepielsticker?style=social)

