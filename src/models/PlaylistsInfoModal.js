/* 
  操作playlists_info的集合
 */

const mongoose = require('mongoose')

// 描述文档结构
const PlaylistSchema = new mongoose.Schema({
  _id: mongoose.ObjectId,
  playlist_name: { type: String, required: true },      // 歌单名字
  playlist_amount: { type: Number, required: true },       // 歌单播放数
  playlist_img: { type: String, required: true },      // 歌单图片
})

// 定义Model 操作集合
const PlaylistModel = mongoose.model("Playlists", PlaylistSchema, 'playlists_info')

module.exports = PlaylistModel