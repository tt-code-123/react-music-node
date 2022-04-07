/* 
    操作users_info的集合
*/

const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  _id: mongoose.ObjectId,
  username: { type: String, required: true },     // 用户名
  password: { type: String, required: true },     // 密码
  avatar_url: { type: String },    // 头像地址
  like_music: { type: Array },
  like_dynamic: { type: Array }
})

const UserModel = mongoose.model("Users", UserSchema, "users_info")

module.exports = UserModel