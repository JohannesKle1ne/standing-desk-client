const path = require('path')
const filePathToUserInfo = path.join(__dirname, '../../resources/user_info.json')

const setUserInfo = async (userInfo) => {
  const data = JSON.stringify(userInfo)
  try {
    await fs.writeFile(filePathToUserInfo, data, 'utf8')
    console.log('saved config')
  } catch (error) {
    console.log('config save error')
  }
}

const getUserInfo = async () => {
  try {
    const data = await fs.readFile(filePathToUserInfo, 'utf8')
    const obj = JSON.parse(data)
    console.log('parsed config')
    return obj
  } catch (error) {
    console.log('config parse error')
  }
}

export { setUserInfo, getUserInfo }
