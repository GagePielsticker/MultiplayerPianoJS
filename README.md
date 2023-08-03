![Logo](https://i.imgur.com/tEXHZfc.png)
#

## THIS IS NO LONGER MAINTAINED!

## Foreword

> Wrote this to help developers create bots for https://multiplayerpiano.com/ / https://mppclone.com/ simple and more streamlined. The current method of all devs manually interacting with the websocket seemed a bit inefficient and non-beginner friendly. Enter MultiplayerPianoJS!

## Installation
**Written on NodeJS v17.5**

`npm install multiplayerpianojs`

### YOU MUST GET A TOKEN FROM MPPCLONE.COM OWNER!
To get one, join the discord https://discord.gg/338D2xMufC . Using this without a token will result in a 24 hour ban so be careful!

# Example Usage
Bigger example seen [here](https://github.com/GagePielsticker/MultiplayerPianoJS/blob/master/examples/)

Full bot framework seen [here](https://github.com/GagePielsticker/MPP-Bot-Template)
```js
const MPPClient = require('multiplayerpianojs')
const mpp = new MPPClient('Your Token')

// const mpp = new MPPClient(token, SCOCKS/HTTPS PROXY HERE) alternatively
mpp.connect()

// On connect
mpp.on('connected', () => {
  console.log('bot connected')
  mpp.setChannel('test3')
})

mpp.on('userLeave', user => {
  console.log(`User left: ${user.name}`)
})

mpp.on('userJoin', user => {
  console.log(`User joined: ${user.name}`)
})

// Example chat message event
mpp.on('message', msg => {
  const args = msg.content.split(' ')

  if (args[0] === '!setname') {
    mpp.setUser(args[1])
  }

  if (args[0] === '!joinroom') {
    mpp.setChannel(args[1])
  }
})

```
## Methods/Functions

- **connect()**

_Connects bot to the WS_

- **disconnect()**

_Disconnects bot to the WS_

- **setChannel(String name)**

_Sets the current channel_

- **setName(String name, String hexColor)**

_Sets the current name & tag color_

- **moveMouse(Int x, Int y)**

_Moves client mouse cursor_

- **dm(String msg, String id)**

_Sends a dm to a specific user_

- **giveCrown(String id)**

_If bot has crown (owner of room), give to user id_

- **changeChannelSettings(Object settings)**

_Change the room settings if owner_

```js
// Example Object of settings
{
  color: '#0066ff',
  color2: '#ff9900',
  chat: 'false'
}
```
- **ban(String id, Int ms)**

_Bans a user from channel for set time, requires owner/crown_

- **unBan(String id)**

_un-Bans a user from channel, requires owner/crown_

- **sendMessage(String msg)**

_Sends a message in chat_

- **sendNotes(Array notes, Int time)**

_Sends notes to be played at specific time, defaults to current time_

```js
// Example array of notes
[
  {
    "n":"c3", //note
    "v":0.75 //velocity
  },
  {
    "n":"c3",
    "d":100, //delay from message to trigger note ms
    "s":1 //if the note is a note stop
  }
]
```


## Events
- **connected**

_Fired on bot connection to websocket_

- **message(Object)**

_Fired when chat message recieved_

- **dm(Object)**

_Fired when direct message is recieved_

- **userJoin(Object)**

_Fired when user joins the channel_

- **userLeave(Object)**

_Fired when user leaves the channel_

- **notes(Object)**

_Fired when user sends notes_

## Properties

- **proxy**

_Currently used proxy_

- **hasCrown**

_If the bot has the crown (room ownership)_

- **user**

_Current user object_

- **room**

_Current room object_

- **allRooms**

_All current existing rooms_

- **token**

_Current token_

## Dependencies
- https-proxy-agent
- socks-proxy-agent
- ws

## Planned Features
You can see the planned features [here](https://github.com/GagePielsticker/MultiplayerPianoJS/blob/master/TODO.md)

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

All code must follow standardjs principles & Gitflow branching strategy. Keep documentation thorough as well.

![GitHub stars](https://img.shields.io/github/stars/gagepielsticker/MultiplayerPianoJS?style=social)
![GitHub followers](https://img.shields.io/github/followers/gagepielsticker?style=social)

