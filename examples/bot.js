const Client = require('./index')

const mpp = new Client()

mpp.connect()

mpp.on('connected', () => {
  console.log('bot connected')
  mpp.setChannel('𝒲𝑒𝓁𝒸𝑜𝓂𝑒 𝓉𝑜 𝓉𝒽𝑒 🦉 ๖ۣۜ 𝐨𝓌𝓁 ♪ 🎹𝕽𝖔𝖔𝖒✞')
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
})
