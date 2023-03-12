// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-4ghjz7lu7f321217'
})

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const res = await cloud.openapi.security.imgSecCheck({
      media: {
        contentType: 'image/png',
        value: Buffer.from(event.value)
      }
    })
    return res
  } catch (error) {
    return error
  }
}