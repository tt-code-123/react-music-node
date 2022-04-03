/* 
  操作albums_info集合
*/
const mongoose = require('mongoose')

// 描述文档结构
const AlbumSchema = new mongoose.Schema({
  _id: mongoose.ObjectId,
  album_name: { type: String, required: true },       // 专辑名称
  singer_id: { type: mongoose.Schema.ObjectId, required: true },  // 歌手Id
  release_time: { type: String, required: true },     // 发售时间
  release_company: { type: String, required: true },    // 发售公司
  album_introduction: { type: String, required: true },   // 专辑介绍
  album_img: { type: String, required: true }        // 专辑图片
})

// // 定义Model 操作集合
const AlbumModel = mongoose.model("Albums", AlbumSchema, "albums_info")

module.exports = AlbumModel