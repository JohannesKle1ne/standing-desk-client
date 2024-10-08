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
      url: urlRestApi + '/state/0',
      timeout: 3000
    })
    if (response) return true
  } catch (error) {
    console.log(error)
    console.log('Error reaching server')
    return false
  }
}

export async function getStates(id) {
  try {
    const response = await axios({
      method: 'get',
      url: urlRestApi + `/state/${id}`
    })
    return response.data
  } catch (error) {
    console.log(error)
    console.log('Error reaching server')
  }
}

export async function getStatisticsOfDay(id, startOfDay) {
  try {
    const response = await axios({
      method: 'get',
      url: urlRestApi + `/statistic/${id}/day`,
      params: { startOfDay }
    })
    return response.data
  } catch (error) {
    console.log(error)
    console.log('Error reaching server')
  }
}

export async function getStatisticsOfWeek(id, startOfWeek) {
  try {
    const response = await axios({
      method: 'get',
      url: urlRestApi + `/statistic/${id}/week`,
      params: { startOfWeek }
    })
    return response.data
  } catch (error) {
    console.log(error)
    console.log('Error reaching server')
  }
}

export async function getGoalProgress(id, startOfDay) {
  try {
    const response = await axios({
      method: 'get',
      url: urlRestApi + `/statistic/${id}/goal`,
      params: { startOfDay }
    })
    return response.data
  } catch (error) {
    console.log(error)
    console.log('Error reaching server')
  }
}

export async function getSettings(id) {
  try {
    const response = await axios({
      method: 'get',
      url: urlRestApi + `/profile/${id}`
    })
    return response.data
  } catch (error) {
    console.log(error)
    console.log('Error reaching server')
  }
}

export async function setSettings(id, settings) {
  try {
    const response = await axios({
      method: 'post',
      url: urlRestApi + `/profile/${id}`,
      data: settings
    })
    return response.data
  } catch (error) {
    console.log(error)
    console.log('Error reaching server')
  }
}

export async function addLog(id, type) {
  try {
    const response = await axios({
      method: 'post',
      url: urlRestApi + `/log/${id}`,
      data: { type }
    })
    return response.data
  } catch (error) {
    console.log(error)
    console.log('Error reaching server')
  }
}

export async function getPiConnects(id) {
  try {
    const response = await axios({
      method: 'get',
      url: urlRestApi + `/piConnect/${id}`
    })
    return response.data
  } catch (error) {
    console.log(error)
    console.log('Error reaching server')
  }
}

export async function getBaseline(id) {
  try {
    const response = await axios({
      method: 'get',
      url: urlRestApi + `/user/${id}/baseline`
    })
    return response.data
  } catch (error) {
    console.log(error)
    console.log('Error reaching server')
  }
}

getBaseline

export async function registerUser(name, password) {
  try {
    const response = await axios({
      method: 'post',
      url: urlRestApi + '/user/register',
      data: {
        userName: name,
        password
      }
    })
    console.log(response.data)
    return response.data
  } catch (error) {
    console.log('Error registering user')
    console.log(error)
  }
}

export async function loginUser(name, password) {
  try {
    const response = await axios({
      method: 'post',
      url: urlRestApi + '/user/login',
      data: {
        userName: name,
        password
      }
    })
    console.log(response.data)
    return response.data
  } catch (error) {
    console.log('Error loggin in')
    console.log(error)
  }
}
