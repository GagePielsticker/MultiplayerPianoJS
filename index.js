const WebSocket = require('ws')
const EventEmitter = require('events').EventEmitter
const HttpsProxyAgent = require('https-proxy-agent')
const SocksProxyAgent = require('socks-proxy-agent')

class Client extends EventEmitter {
  constructor (token, proxy) {
    super()

    // These are available to the client
    this.uri = 'wss://www.mppclone.com'
    this.proxy = proxy

    this.token = token

    this.user = {}
    this.room = {}
    this.allRooms = []

    // These are for internal use
    this._currentRoomId = undefined
    this._ws = undefined
    this._isConnected = false
    this._heartbeatMS = 10000
    this._heartbeat = undefined
    this._socketTimeoutMS = 5000
    this._serverOffset = 0
    this._defaultName = 'bot'
    this._defaultLobby = 'lobby'
    this._defaultColor = '#ff8ff9'
  }

  /**
   * Hard error exit handling
   * @param {String} str
   */
  _hardExit (str) {
    const error = new Error(str)
    console.log(error.stack)
    process.exit(1)
  }

  _setupHeartbeat () {
    this._heartbeat = setInterval(() => {
      this._sendArray([{
        m: 't',
        e: +new Date()
      }])
    }, this._heartbeatMS)
  }

  /* The following is client functions */

  /**
   * Connects the websocket
   */
  connect () {
    if (!this.token) return this._hardExit('You MUST provide a valid bot token or else the system will ban you for 24 hours.')

    /* Connect our websocket */
    this._ws = new WebSocket(this.uri, {
      origin: this.uri,
      agent: this.proxy ? this.proxy.startsWith('socks') ? new SocksProxyAgent(this.proxy) : new HttpsProxyAgent(this.proxy) : undefined
    })
    
    this._setupHeartbeat()
    this._constructSocketListeners()

    setTimeout(() => {
      if (!this._isConnected) {
        this._ws.close()
        _hardExit('Initial socket connection timed out')
      }
    }, this._socketTimeoutMS)
  }

  /**
   * Closes the websocket
   */
  disconnect () {
    clearInterval(this._heartbeat)
    this._ws.close(1000, 'disconnect')
    this._ws = undefined
  }

  /**
   * Creates our socket listeners
   */
  _constructSocketListeners () {
    /* Open our socket to the server */
    this._ws.addEventListener('open', evt => {
      this._sendArray([{
        m: 'hi',
        token: this.token
      }])
    })

    this._ws.addEventListener('close', evt => {
      if(evt.reason === 'disconnect') return
      this._ws = undefined
      clearInterval(this._heartbeat)
      console.log(new Error(`SOCKET TO MPP CLOSED RANDOMLY, ATTEMPTING TO RECONNECT IN 5 SECONDS!`))
      setTimeout(() => this.connect(), 5000)
    })

    /* Handles our errors */
    this._ws.addEventListener('error', error => {
      this._ws.close()
      this._hardExit(`Websocket connection has errored :: ${error.message}`)
    })

    /* Handles generic incoming messages */
    this._ws.addEventListener('message', evt => {
      if (typeof evt.data !== 'string') return
      try {
        const transmission = JSON.parse(evt.data)
        for (let i = 0; i < transmission.length; i++) {
          const msg = transmission[i]
          this._messageChofer(msg)
        }
      } catch (error) {
        this._hardExit(`Error recieving websocket message :: ${error.message}`)
      }
    })
  }

  /**
   * Handles orchestrating incoming messages
   * @param {Object} msg websocket message
   */
  _messageChofer (msg) {
    /* On response to greeting (connected) */
    if (msg.m === 'hi') {
      this.user = msg.u
      this.user.id = this.user._id
      this.user.mouse = {
        x: undefined,
        y: undefined
      }
      this._isConnected = true
      this._sendArray([{
        m: '+ls' // Subscribe to channel list updates
      }])

      this._serverOffset = msg.t - (+new Date()) // set the offset

      if(this._currentRoomId) this.setChannel(this._currentRoomId) //If a reconnect triggered a new ws connection, reconnect to the room we are supposed to be in
      this.emit('connected')
    }

    // Chat message
    if (msg.m === 'a') {
      this.emit('message', {
        unixTime: msg.t,
        content: msg.a,
        author: msg.p
      })
    }

    // Heartbeat to update server offset
    if (msg.m === 't') {
      this._serverOffset = msg.t - (+new Date())
    }

    // Channel Settings change / channel join
    if (msg.m === 'ch') {
      // Sanitize the users pos's from string to int &  Get the bots mouse position
      msg.ppl.map(e => {
        e.x = parseFloat(e.x)
        e.y = parseFloat(e.y)

        if (e.id === this.user.id) {
          this.user.mouse.x = parseFloat(e.x)
          this.user.mouse.y = parseFloat(e.y)
        }
      })

      this.room = {
        settings: msg.ch.settings,
        id: msg.ch.id,
        crown: msg.ch.crown,
        users: msg.ppl
      }
    }

    if (msg.m === 'ls') {
      const test = this.allRooms.find(e => e.id === msg.u[0].id)

      if (!test && msg.u[0].count === 0) return
      if (!test) {
        this.allRooms.push(msg.u[0])
      } else {
        let curInd
        this.allRooms.map((e, ind) => {
          if (e.id === msg.u[0].id) {
            curInd = ind
            e = msg.u[0]
          }
        })
        if (msg.u[0].count === 0) this.allRooms.splice(curInd, 1)
      }
    }

    // On user mouse position change
    if (msg.m === 'm') {
      if (this.room.users) {
        this.room.users.map(e => {
          if (e.id === msg.id) {
            e.x = parseFloat(msg.x)
            e.y = parseFloat(msg.y)
          }
        })
      }
    }

    // Handles dms
    if (msg.m === 'dm') {
      this.emit('dm', {
        unixTime: msg.t,
        content: msg.a,
        author: msg.sender
      })
    }

    if (msg.m === 'n') {
      this.emit('notes', {
        unixTime: msg.t,
        id: msg.p,
        notes: msg.n
      })
    }

    // On user leave
    if (msg.m === 'bye') {
      if (this.room.users) {
        const user = this.room.users.find(e => e.id === msg.p)
        const index = this.room.users.findIndex(e => e.id === msg.p)
        this.room.users.splice(index, 1)
        this.emit('userLeave', user)
      }
    }

    // On user join
    if (msg.m === 'p') {
      if (this.room.users) {
        delete msg.m
        this.room.users.push(msg)
        this.emit('userJoin', msg)
      }
    }

    // console.log(msg)
  }

  /**
   * Sends data through the websocket
   * @param {Websocket Data} data
   */
  _sendSocket (data) {
    this._ws.send(data)
  }

  /**
     * Stringifies array/object data to be sent to WS
     * @param {Array} data
     */
  _sendArray (data) {
    // If data is attempted to be sent while not connected, error.
    if (!this._isConnected && data[0].m !== 'hi') return this._hardExit('Attempted to send data while socket not connected. Please wait for connection event.')
    return this._sendSocket(JSON.stringify(data))
  }

  /**
   * Attempts to connect to a channel
   * @param {String} str
   * @param {Boolean} visible
   */
  setChannel (str, visible) {
    this._sendArray([{
      m: 'ch',
      _id: str || this._defaultLobby,
      set: {
        visible: visible || true
      }
    }])
    this._currentRoomId = str || this._defaultLobby
  }

  /**
   * Sends a message in chat
   * @param {String} str
   */
  sendMessage (str) {
    this._sendArray([{
      m: 'a',
      message: str
    }])
  }

  /**
   * Direct message a user
   * @param {String} str
   * @param {String} id
   */
  dm (str, id) {
    this._sendArray([{
      m: 'dm',
      _id: id,
      message: str
    }])
  }

  /**
   * Gives the crown to a specific user
   * @param {String} id
   */
  giveCrown (id) {
    this._sendArray([{
      m: 'chown',
      id: id
    }])
  }

  /**
     * Changes the current channel settings if owner/crown bearer
     * @param {Object} settings
     */
  changeChannelSettings (settings) {
    this._sendArray([{
      m: 'chset',
      set: settings
    }])
  }

  /**
     * Kicks/bans a user for a set amount of time between 0 and 3600000 ms. Only works if owner.
     * @param {String} id
     * @param {Int} ms
     */
  ban (id, ms) {
    this._sendArray([{
      m: 'kickban',
      _id: id,
      ms: ms
    }])
  }

  /**
     * Unbans a user
     * @param {String} id
     */
  unBan (id) {
    this._sendArray([{
      m: 'unban',
      _id: id
    }])
  }

  /**
     * Sets client name
     * @param {String} str Name to set
     * @param {String} clr Hex color of nametag
     */
  setUser (str, clr) {
    this._sendArray([{
      m: 'userset',
      set: {
        name: str || this._defaultName,
        color: clr || this._defaultColor
      }
    }])

    this.user.name = str || this._defaultName
    this.user.color = clr || this._defaultColor
  }

  /**
     * Moves User cursor
     * @param {Int} x
     * @param {Int} y
     */
  moveMouse (x, y) {
    this._sendArray([{
      m: 'm',
      x: x,
      y: y
    }])

    this.user.mouse = {
      x: x,
      y: y
    }
  }

  /**
   * Sends notes to mpp
   * @param {Int} time
   * @param {Array<Obj>} notes
   */
  sendNotes (notes, time) {
    console.log(this._serverOffset)
    this._sendArray([{
      m: 'n',
      t: (time + this._serverOffset) || (+new Date() + this._serverOffset),
      n: notes
    }])
  }
}

module.exports = Client
