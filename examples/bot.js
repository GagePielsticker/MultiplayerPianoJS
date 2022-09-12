const MPPClient = require('../index')

const mpp = new MPPClient('YOUR BOT TOKEN HERE')
// const mpp = new MPPClient(token, SCOCKS/HTTPS PROXY HERE) alternatively

mpp.connect()

// On connect
mpp.on('connected', () => {
  console.log('bot connected')
  mpp.setChannel('test2')
})

mpp.on('userLeave', user => {
  console.log(`User left: ${user.name}`)
})

mpp.on('userJoin', user => {
  console.log(`User joined: ${user.name}`)
})

mpp.on('dm', msg => {
  console.log(`User ${msg.author.name} dm'd you : ${msg.content}`)
})

mpp.on('notes', msg => {
  // console.log(msg)
})

// Example chat message event
mpp.on('message', msg => {
  const args = msg.content.split(' ')

  if (msg.author._id === '1c7d9536250eb1f43652f4c0') {
    if (args[0] === '!setname') {
      mpp.setUser(args[1])
    }

    if (args[0] === '!joinroom') {
      mpp.setChannel(args[1])
    }

    if (args[0] === '!eval') {
      console.log(mpp[args[1]])
    }

    if (args[0] === '!dc') {
      mpp.disconnect()
    }

    if (args[0] === '!move') {
      mpp.moveMouse(args[1], args[2])
    }

    if (args[0] === '!dm') {
      mpp.sendMessage(`Sent you a dm ${msg.author.name}!`)
      mpp.dm(args[1], msg.author.id)
    }

    if (args[0] === '!banme') {
      mpp.ban(msg.author.id, 1000)
    }

    if (args[0] === '!givecrown') {
      mpp.giveCrown(msg.author.id)
    }

    if (args[0] === '!changesettings') {
      mpp.changeChannelSettings({
        color: '#0066ff',
        color2: '#ff9900',
        chat: 'true'
      })
    }

    if (args[0] === '!sendNotes') {
      mpp.sendNotes([
        {
          n: 'c3',
          v: 0.75
        }
      ])
    }
  }
})
