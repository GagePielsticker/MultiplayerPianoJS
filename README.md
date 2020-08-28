![Express API Boilerplate](https://i.imgur.com/tEXHZfc.png)
#

[![Known Vulnerabilities](https://snyk.io/test/github/GagePielsticker/MultiplayerPianoJS/badge.svg?targetFile=package.json)](https://snyk.io/test/github/GagePielsticker/MultiplayerPianoJS?targetFile=package.json) [![License](https://img.shields.io/badge/license-MIT-green)](https://github.com/GagePielsticker/Express-API-Boilerplate/blob/master/LICENSE.md) ![GitHub last commit](https://img.shields.io/github/last-commit/gagepielsticker/Express-API-Boilerplate) ![Updates](https://img.shields.io/david/GagePielsticker/MultiplayerPianoJS)

## Foreword

> This was created as a response to the massive lack of libs/support presented in the MPP dev community. I intend to maintain and improve it for the foreseeable future. 

## Installation
**Node.js 12.0.0 or newer is required.**

`npm install multiplayerpianojs`

# Example Usage
More seen [here](https://github.com/GagePielsticker/MultiplayerPianoJS/blob/master/examples/)
```js
const MPPClient = require('multiplayerpianojs')
const mpp = new MPPClient()
//const mpp = new MPPClient(SCOCKS/HTTPS PROXY HERE) alternatively
mpp.connect()

mpp.on('connected', () => {
  console.log('bot connected')
  mpp.setName('Mr Roboto')
  mpp.setChannel('my room')
    .then(() => console.log('Channel Set!'))
})

// These are chat messages
mpp.on('message', msg => {
  if (msg.content === '!ping') {
    mpp.sendMessage('Pong!')
  }
  if (msg.content === '!disconnect') {
    mpp.disconnect()
  }
  if (msg.content === '!kickme') {
    mpp.kickUser(msg.user.id)
  }
  if (msg.content === '!givemecrown') {
    mpp.giveCrown(msg.user.id)
  }
  if (msg.content === '!allrooms') {
    console.log(mpp.rooms)
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

- **kickUser(String userID)**

_Kicks user from room, must be owner_

Returns: `Promise`

- **giveCrown(String userID)**

_Gives crown to specific user, must be owner_

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

- **notePress**

_Fired on note press_

Callback: `Object`

- **error**

_Fired on error_

Callback: `String`

- **Message**

_Fired on chat message recieve_

Callback: `Message Object`

## Properties
- **room**

_Object containing all users in room + room name_

- **rooms**

_Array of all the rooms and their counts_

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

