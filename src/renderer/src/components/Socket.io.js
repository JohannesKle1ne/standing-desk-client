import io from 'socket.io-client'

let aliveCallback = () => {}
let heightCallback = () => {}
let connectedCallback = () => {}
let disconnectedCallback = () => {}

let isConnectedFlag = false // Flag to track connection status

let userId = null

let socket

const connect = async () => {
  const userInfo = await window.electronAPI.getUserInfo()

  if (userInfo?.id == null) return

  userId = userInfo.id

  socket = io('https://standing-desk.org', {
    auth: { id: userInfo.id, type: 'electron' },
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
  socket.on('requestGoUp', () => {
    socket.emit('confirmGoUp')
  })
}

const isConnected = () => {
  return isConnectedFlag
}

const hasUserId = () => userId != null

const onAliveMessage = (callback) => {
  aliveCallback = callback
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

const requestAlive = () => {
  if (socket && isConnectedFlag) {
    socket.emit('requestAlive')
  }
}

export default {
  connect,
  isConnected,
  hasUserId,
  onConnected,
  onDisconnected,
  onAliveMessage,
  sendCommand,
  onHeightMessage,
  requestAlive
}
