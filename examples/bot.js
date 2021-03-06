const MPPClient = require('../index')
const mpp = new MPPClient()
// const mpp = new MPPClient(SCOCKS/HTTPS PROXY HERE) alternatively
mpp.connect()

mpp.on('connected', () => {
  console.log('bot connected')
  mpp.setName('Mr Roboto')
  mpp.setChannel('jeffsroom')
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
  if (msg.content === '!play') {
    mpp.playMidi(__dirname + '/midi/test2.MID')
      .catch(console.log)
      .then(mpp.sendMessage('playing!'))
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

mpp.on('notePress', note => {
  // console.log(note)
})
