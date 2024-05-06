import io from 'socket.io-client'

const socket = io('https://standing-desk.org', { auth: { id: '123' } })

socket.on('connect', () => {
  console.log('Connected to Socket.IO server')
})

socket.on('disconnect', () => {
  console.log('Disconnected from Socket.IO server')
})

const stateCallback = null

const onStateMessage = (callback) => {
  stateCallback = callback
}

const sendPreset = () => {}

const sendUp = () => {}

const sendDown = () => {}

export default { onStateMessage, sendPreset, sendUp, sendDown }
