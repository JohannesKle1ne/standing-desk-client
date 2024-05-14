import io from 'socket.io-client'

let stateCallback = () => {}
let connectedCallback = () => {}
let disconnectedCallback = () => {}

let isConnectedFlag = false // Flag to track connection status

let userId = null

const connect = async () => {
  const userInfo = await window.electronAPI.getUserInfo()

  if (userInfo?.id == null) return

  userId = userInfo.id

  const socket = io('https://standing-desk.org', {
    auth: { id: userInfo.id },
    transports: ['websocket']
  })

  socket.on('connect', (e) => {
    console.log('Connected to Socket.IO server')
    connectedCallback(e)
    isConnectedFlag = true
  })

  socket.on('disconnect', (e) => {
    console.log('Disconnected from Socket.IO server')
    disconnectedCallback(e)
    isConnectedFlag = false
  })

  socket.on('state', (state) => {
    stateCallback(state)
  })
}

const isConnected = () => {
  return isConnectedFlag
}

const hasUserId = () => userId != null

const onStateMessage = (callback) => {
  stateCallback = callback
}

const onConnected = (callback) => {
  connectedCallback = callback
}

const onDisconnected = (callback) => {
  disconnectedCallback = callback
}

const sendPreset = () => {}

const sendUp = () => {}

const sendDown = () => {}

export default {
  connect,
  isConnected,
  hasUserId,
  onConnected,
  onDisconnected,
  onStateMessage,
  sendPreset,
  sendUp,
  sendDown
}
