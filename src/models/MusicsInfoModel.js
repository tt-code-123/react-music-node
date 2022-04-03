/* 
  操作musics_info的集合
 */

const mongoose = require('mongoose')

// 描述文档结构
const MusicSchema = new mongoose.Schema({
  _id: mongoose.ObjectId,
  music_name: { type: String, required: true },      // 歌曲名字
  music_url: { type: String, required: true },       // 歌曲url
  music_img: { type: String, required: true },      // 歌曲图片
  music_time: { type: String, required: true },     // 歌曲总时间
  music_second: { type: String, required: true },   // 歌曲总时长（秒）
  music_lyrics: { type: String, required: true },         // 歌词
  singer_id: { type: mongoose.Schema.ObjectId, required: true },    // 歌手Id
  album_id: { type: mongoose.Schema.ObjectId, required: true }     // 专辑Id
})

// 定义Model 操作集合
const MusicModel = mongoose.model("Musics", MusicSchema, 'musics_info')

module.exports = MusicModel