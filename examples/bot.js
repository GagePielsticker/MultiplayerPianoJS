const Client = require('../index')

const mpp = new Client()

mpp.connect()

mpp.on('connected', () => {
  console.log('bot connected')
  mpp.setChannel('My r32432oom')
    .then(() => console.log('Channel set, users: ' + mpp.room.users.length))
})

mpp.on('disconnected', () => {
  console.log('bot disconnected')
})

mpp.on('userJoin', user => {
  console.log(`user joined: ${user.name}`)
  mpp.sendMessage(`Welcome ${user.name}`)
})

mpp.on('userLeave', user => {
  console.log(`user left: ${user.name}`)
  mpp.sendMessage(`Goodbye ${user.name}`)
})

mpp.on('error', e => {
  console.log(e)
})

mpp.on('message', msg => {
  if (msg.content === '!ping') {
    mpp.sendMessage('Pong!')
  }
  if (msg.content === 'kickme') {
    mpp.kickUser(msg.user.id)
  }
  if (msg.content === 'givemecrown') {
    mpp.giveCrown(msg.user.id)
  }
})
