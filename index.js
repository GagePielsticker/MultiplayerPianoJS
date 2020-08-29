const WebSocket = require('ws')
const EventEmitter = require('events').EventEmitter
const HttpsProxyAgent = require('https-proxy-agent')
const SocksProxyAgent = require('socks-proxy-agent')
const MidiPlayer = require('midi-player-js')

class Client extends EventEmitter {
  constructor (proxy) {
    super()
    this.uri = 'wss://www.multiplayerpiano.com'
    this.proxy = proxy
    this.rooms = []
    this.room = {
      name: undefined,
      users: []
    }

    this._ws = undefined
    this._heartbeatInterval = undefined

    this._isConnected = false
    this._channelHasJoined = false

    this._socketTimeoutMS = 10000
    this._heartbeatMS = 20000
    this._roomScanMS = 2000
    this._noteBufferTime = 0
    this._noteFlushIntervalMS = 200
    this._serverTimeOffset = 0

    this._noteBuffer = []
    this._noteFlushInterval = undefined

    this._pianoSettings = require('./settings/keyMap.json')
    this._player = new MidiPlayer.Player(event => {
      console.log(event)
      if (event.name === 'Controller Change') {
        if (event.value === 127) {
          // start sustain
        }
        if (event.value === 71) {
          // stop sustain
        }
      }
      if (event.name === 'Note on') {
        this.startNote(this._pianoSettings[event.noteName], event.velocity / 100)
      }
      if (event.name === 'Note off') {
        this.stopNote(this._pianoSettings[event.noteName])
      }
    })
  }

  /* The following is client functions */

  /**
   * Connects the websocket
   */
  connect () {
    /* Connect our websocket */
    this._ws = new WebSocket(this.uri, {
      origin: 'https://www.multiplayerpiano.com',
      agent: this.proxy ? this.proxy.startsWith('socks') ? new SocksProxyAgent(this.proxy) : new HttpsProxyAgent(this.proxy) : undefined
    })

    this._constructSocketListeners()

    setTimeout(() => {
      if (!this._isConnected) {
        this.emit('error', new Error('Bot failed to connect to websocket in 10 seconds.'))
        this._ws.close()
      }
    }, this._socketTimeoutMS)
  }

  /**
   * Plays a midi file from path
   * @param {String} path
   */
  playMidi (path) {
    this._player.loadFile(path)
    this._player.play()
  }

  /**
   * Stops the playing of the midi file
   */
  stopMidi () {
    this._player.stop()
  }

  /**
   * Joins a channel
   * @param {String} channelName Name of channel to join
   */
  setChannel (channelName) {
    return new Promise((resolve, reject) => {
      const name = channelName || 'lobby'
      this.room = {
        name: undefined,
        users: []
      }
      this._sendArray([{ m: 'ch', _id: name, set: undefined }])

      const checker = setInterval(() => {
        if (this._channelHasJoined) {
          resolve()
          this._channelHasJoined = false
          clearInterval(checker)
        }
      }, 100)
    })
  }

  /**
   * Sends a message in the current channel
   * @param {String} message Message to send
   */
  sendMessage (message) {
    return new Promise((resolve, reject) => {
      message = message || ''
      try {
        this._sendArray([{ m: 'a', message }])
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * Sets current username
   * @param {String} name Name to use
   */
  setName (name) {
    return new Promise((resolve, reject) => {
      name = name || 'Bot'
      try {
        this._sendArray([{ m: 'userset', name }])
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * Move mouse cursor
   * @param {Integer} x Mouse x position
   * @param {Integer} y Mouse y position
   */
  moveMouse (x, y) {
    return new Promise((resolve, reject) => {
      x = x || 0
      y = y || 0
      try {
        this._sendArray([{ m: 'm', x, y }])
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * Kicks user id from room
   * @param {String} id
   */
  kickUser (id) {
    return new Promise((resolve, reject) => {
      try {
        this._sendArray([{ m: 'kickban', _id: id, ms: 1 }])
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * Gives crown to a specific user
   * @param {String} id
   */
  giveCrown (id) {
    return new Promise((resolve, reject) => {
      try {
        this._sendArray([{ m: 'chown', id }])
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * Closes the websocket
   */
  disconnect () {
    this._ws.close()
  }

  /**
   * Starts a note with a specific velocity
   * @param {String} note
   * @param {Integer} vel
   */
  startNote (note, vel) {
    return new Promise((resolve, reject) => {
      try {
        vel = typeof vel === 'undefined' ? undefined : +vel.toFixed(3)
        if (!this._noteBufferTime) {
          this._noteBufferTime = Date.now()
          this._noteBuffer.push({ n: note, v: vel })
          resolve()
        } else {
          this._noteBuffer.push({ d: Date.now() - this._noteBufferTime, n: note, v: vel })
          resolve()
        }
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * Will stop a note from playing
   * @param {String} note
   */
  stopNote (note) {
    return new Promise((resolve, reject) => {
      try {
        if (!this._noteBufferTime) {
          this._noteBufferTime = Date.now()
          this._noteBuffer.push({ n: note, s: 1 })
          resolve()
        } else {
          this._noteBuffer.push({ d: Date.now() - this._noteBufferTime, n: note, s: 1 })
          resolve()
        }
      } catch (e) {
        reject(e)
      }
    })
  }

  /* The following is internal use functions not necessarily used for the client */

  /**
   * Sends data through the websocket
   * @param {Websocket Data} data
   */
  _sendSocket (data) {
    return this._ws.send(data)
  }

  /**
   * Stringifies array/object data to be sent to WS
   * @param {Array} data
   */
  _sendArray (data) {
    return this._sendSocket(JSON.stringify(data))
  }

  /**
   * Recieves and calculates server offset
   * @param {time} time
   */
  _recieveServerTime (time) {
    const now = Date.now()
    const target = time - now
    const duration = 1000
    let step = 0
    const steps = 50
    const stepMS = duration / steps
    const difference = target - this._serverTimeOffset
    const inc = difference / steps
    const iv = setInterval(() => {
      this._serverTimeOffset += inc
      if (++step >= steps) {
        clearInterval(iv)
        this._serverTimeOffset = target
      }
    }, stepMS)
  }

  /**
   * Creates our socket listeners
   */
  _constructSocketListeners () {
    /* Handles our open event */
    this._ws.addEventListener('open', evt => {
      setInterval(() => {
        this._sendArray([{ m: '+ls' }])
      }, this._roomScanMS)
      this._isConnected = true
      this._sendArray([{ m: 'hi' }])
      this._heartbeatInterval = setInterval(() => {
        this._sendArray([{ m: 't', e: Date.now() }])
      }, this._heartbeatMS)
      this.emit('connected')
      this.setChannel('lobby')
      this._noteFlushInterval = setInterval(() => {
        if (this._noteBufferTime && this._noteBuffer.length > 0) {
          this._sendArray([{ m: 'n', t: this._noteBufferTime + this._serverTimeOffset, n: this._noteBuffer }])
          this._noteBufferTime = 0
          this._noteBuffer = []
        }
      }, this._noteFlushIntervalMS)
    })

    /* Handles our close event */
    this._ws.addEventListener('close', evt => {
      clearInterval(this._heartbeatInterval)
      clearInterval(this._noteFlushInterval)
      if (!this.hasErrored) this.emit('disconnected')
    })

    /* Handles our errors */
    this._ws.addEventListener('error', error => {
      if (error.message === 'WebSocket was closed before the connection was established') return
      this.emit('error', new Error(error))
      this._ws.close()
    })

    /* Handles generic messages */
    this._ws.addEventListener('message', evt => {
      if (typeof evt.data !== 'string') return
      try {
        const transmission = JSON.parse(evt.data)
        for (var i = 0; i < transmission.length; i++) {
          var msg = transmission[i]
          if (msg.m === 'hi') {
            this._recieveServerTime(msg.t, msg.e || undefined)
          }
          if (msg.m === 't') {
            this._recieveServerTime(msg.t, msg.e || undefined)
          }
          if (msg.m === 'a') {
            this.emit('message', {
              content: msg.a,
              user: {
                id: msg.p.id,
                name: msg.p.name,
                color: msg.p.color
              },
              time: msg.t
            })
          }
          if (msg.m === 'ch') {
            this.room.name = msg.ch._id
            this._channelHasJoined = true
            if (this.room.users.length !== 0) return
            msg.ppl.forEach(person => {
              this.room.users.push({
                id: person.id,
                name: person.name,
                color: person.color
              })
            })
          }
          if (msg.m === 'p') {
            const formattedUser = {
              id: msg.id,
              name: msg.name,
              color: msg.color
            }
            this.emit('userJoined', formattedUser)
            this.room.users.push(formattedUser)
          }
          if (msg.m === 'bye') {
            const user = this.room.users.filter(e => e.id === msg.p)[0]
            this.room.users = this.room.users.filter(e => e.id !== msg.p)
            this.emit('userLeave', user)
          }
          if (msg.m === 'ls') {
            this.rooms = []
            msg.u.forEach(room => {
              this.rooms.push({
                name: room._id,
                count: room.count
              })
            })
            this._sendArray([{ m: '-ls' }])
          }
          if (msg.m === 'n') {
            this.emit('notePress', {
              note: msg.n,
              user: msg.p
            })
          }
        }
      } catch (error) {
        this.emit('error', error)
      }
    })
  }
}

module.exports = Client
