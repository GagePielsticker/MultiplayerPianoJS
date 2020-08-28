const MPPClient = require('../index')
const { TestScheduler } = require('jest')
const mpp = new MPPClient()
// const mpp = new MPPClient(SCOCKS/HTTPS PROXY HERE) alternatively
mpp.connect()

afterAll(() => {
  mpp.disconnect()
})

test('Can connect to mpp', () => {
  mpp.on('connected', () => {
    expect(1).toBe(1)
  })
})
