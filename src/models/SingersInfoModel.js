/* 
  操作singers_info集合
*/

const mongoose = require('mongoose')

const SingerSchema = new mongoose.Schema({
  singer_name: { type: String, required: true },                 // 歌手名字
  singer_introduction: { type: String, required: true },        // 歌手介绍
  singer_img: { type: String, required: true },                 // 歌手图片 
  singer_language: { type: String, required: true },          // 歌手国籍 
  singer_gender: { type: String, required: true },            // 歌手性别
})

const SingerModel = mongoose.model("Singers", SingerSchema, "singers_info")

module.exports = SingerModel