import axios from 'axios'
const urlAP = 'http://10.0.0.5'
const urlRestApi = 'https://standing-desk.org/api'

export async function pairWithPi(ssid, psk, userName, id) {
  try {
    const response = await axios({
      method: 'post',
      url: urlAP + '/update_wifi',
      data: {
        ssid,
        psk,
        userName,
        id
      }
    })
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export async function piTest() {
  try {
    const response = await axios({
      method: 'get',
      url: urlAP + '/test',
      timeout: 3000
    })
    if (response) return true
  } catch (error) {
    console.log('Error reaching pi ap')
    return false
  }
}

export async function checkServer() {
  try {
    const response = await axios({
      method: 'get',
      url: urlRestApi + '/state/wRzlEv5zFm',
      timeout: 3000
    })
    if (response) return true
  } catch (error) {
    console.log(error)
    console.log('Error reaching server')
    return false
  }
}

export async function createUser(name) {
  try {
    const response = await axios({
      method: 'post',
      url: urlRestApi + '/user',
      data: {
        userName: name
      }
    })
    console.log(response.data)
    return response.data
  } catch (error) {
    console.log('Error creating user')
    /* return {
      userName: 'Johannes Kleine',
      id: '83898cf2-188b-493f-b6f0-4b15725be10d'
    } */
  }
}
