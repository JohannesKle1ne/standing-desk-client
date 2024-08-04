import io from 'socket.io-client'

let aliveCallback = () => {}
let heightCallback = () => {}
let piDisconnectCallback = () => {}
let piConnectCallback = () => {}
let connectedCallback = () => {}
let disconnectedCallback = () => {}

let isConnectedFlag = false // Flag to track connection status

let socket

const connect = async (userId) => {
  if (userId == null) return

  socket = io('https://standing-desk.org', {
    auth: { id: userId, type: 'electron' },
    transports: ['websocket']
  })

  socket.on('connect', (e) => {
    console.log('Connected to Socket.IO server')
    isConnectedFlag = true
    connectedCallback(e)
  })

  socket.on('disconnect', (e) => {
    console.log('Disconnected from Socket.IO server')
    disconnectedCallback(e)
    isConnectedFlag = false
  })

  socket.on('alive', () => {
    aliveCallback()
  })
  socket.on('height', (height) => {
    heightCallback(height)
  })
  socket.on('state', (state) => {
    console.log('state: ', state)
    const stateObj = JSON.parse(state)
    heightCallback(stateObj.deskHeight)
    piConnectCallback()
  })
  socket.on('requestGoUp', () => {
    socket.emit('confirmGoUp')
  })
  socket.on('requestGoDown', () => {
    socket.emit('confirmGoDown')
  })
  socket.on('piDisconnect', () => {
    piDisconnectCallback()
  })
}

const isConnected = () => {
  return isConnectedFlag
}

const onAliveMessage = (callback) => {
  aliveCallback = callback
}

const onPiDisconnect = (callback) => {
  piDisconnectCallback = callback
}

const onPiConnect = (callback) => {
  piConnectCallback = callback
}

const onHeightMessage = (callback) => {
  heightCallback = callback
}

const onConnected = (callback) => {
  connectedCallback = callback
}

const onDisconnected = (callback) => {
  disconnectedCallback = callback
}

const sendCommand = (command) => {
  if (socket && isConnectedFlag) {
    socket.emit('command', command)
  }
}

const sendForceHeight = (height) => {
  if (socket && isConnectedFlag) {
    console.log('send', height)
    socket.emit('forceWriteHeight', height)
  }
}

const requestAlive = () => {
  if (socket && isConnectedFlag) {
    socket.emit('requestAlive')
  }
}

const requestState = () => {
  if (socket && isConnectedFlag) {
    socket.emit('requestState')
  }
}

export default {
  connect,
  isConnected,
  onConnected,
  onDisconnected,
  onAliveMessage,
  sendCommand,
  onHeightMessage,
  onPiDisconnect,
  onPiConnect,
  requestAlive,
  requestState,
  sendForceHeight
}
