![Logo](https://i.imgur.com/tEXHZfc.png)
#

## Foreword

> Wrote this to help developers create bots for https://multiplayerpiano.com/ / https://mppclone.com/ simple and more streamlined. The current method of all devs manually interacting with the websocket seemed a bit inefficient and non-beginner friendly. Enter MultiplayerPianoJS!

## Installation
**Written on NodeJS v17.5**

`npm install multiplayerpianojs`

# Example Usage
More seen [here](https://github.com/GagePielsticker/MultiplayerPianoJS/blob/master/examples/)
```js


```
## Methods/Functions

- **connect()**

_Connects bot to the WS_

- **disconnect()**

_Disconnects bot to the WS_

- **setChannel(String name)**

_Sets the current channel_

Returns: `x`

- **setName(String name, String hexColor)**

_Sets the current name & tag color_

Returns: `x`

- **moveMouse(Int x, Int y)**

_Moves client mouse cursor_

Returns: `x`

## Events
- **connected**

_Fired on bot connection to websocket_

- **message(Object)**

_Fired when chat message recieved_

- **userJoin(Object)**

_Fired when user joins the channel_

- **userLeave(Object)**

_Fired when user leaves the channe_

## Properties

- **proxy**

_Currently used proxy_

- **user**

_Current user object_

- **room**

_Current room object_

- **token**

_Current token_

## Dependencies
- https-proxy-agent
- socks-proxy-agent
- ws

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

All code must follow standardjs principles & Gitflow branching strategy. Keep documentation thorough as well.

![GitHub stars](https://img.shields.io/github/stars/gagepielsticker/MultiplayerPianoJS?style=social)
![GitHub followers](https://img.shields.io/github/followers/gagepielsticker?style=social)

