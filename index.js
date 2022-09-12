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

    // These are for internal use
    this._ws = undefined
    this._isConnected = false
    this._heartbeatMS = 20000
    this._heartbeat = undefined
    this._socketTimeoutMS = 5000
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

    this._constructSocketListeners()

    setTimeout(() => {
      if (!this._isConnected) {
        this._ws.close()
        _hardExit('Socket connection timed out')
      }
    }, this._socketTimeoutMS)
  }

  /**
   * Closes the websocket
   */
  disconnect () {
    clearInterval(this._heartbeat)
    this._ws.close()
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
      this._setupHeartbeat()
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

    // Channel Settings change / channel join
    if (msg.m === 'ch') {

      //Sanitize the users pos's from string to int &  Get the bots mouse position
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

    // On user leave
    if (msg.m === 'bye') {
      if (this.room.users) {
        let user = this.room.users.find(e => e.id === msg.p)
        let index = this.room.users.findIndex(e => e.id === msg.p)
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

    //console.log(msg)
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
    if (!this._isConnected && data[0].m !== 'hi') return this._hardExit('Attempted to send data whiel socket not connected. Please wait for connection event.')
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
}

module.exports = Client
